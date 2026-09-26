"""Bounded public HTTP(S) image downloads with DNS pinning and SSRF protection.

No ambient proxy, cookies, credentials, local files, or private-network access.
Every redirect is independently validated and resolved; the validated address is
also the address used for the socket (no second DNS lookup at connect time).
"""
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeout
import http.client
import ipaddress
import socket
import ssl
import threading
import time
from urllib.parse import urljoin, urlsplit, quote

_DNS = ThreadPoolExecutor(max_workers=4, thread_name_prefix='jev-image-dns')
_DNS_SLOTS = threading.BoundedSemaphore(4)
MAX_REDIRECTS = 3


def _remaining(deadline):
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise ValueError('Image download timed out')
    return remaining


def _resolve(host, port, deadline):
    if not _DNS_SLOTS.acquire(blocking=False):
        raise ValueError('Image DNS resolver is busy')
    try:
        future = _DNS.submit(socket.getaddrinfo, host, port, type=socket.SOCK_STREAM)
    except BaseException:
        _DNS_SLOTS.release()
        raise
    future.add_done_callback(lambda _: _DNS_SLOTS.release())
    try:
        records = future.result(timeout=_remaining(deadline))
    except FutureTimeout as exc:
        future.cancel()
        raise ValueError('Image DNS resolution timed out') from exc
    addresses = list(dict.fromkeys(row[4][0] for row in records))
    def public(ip):
        address = ipaddress.ip_address(ip)
        if not address.is_global or address.is_multicast or address.is_reserved:
            return False
        # Do not let transition-address encodings tunnel into private IPv4.
        if isinstance(address, ipaddress.IPv6Address):
            embedded = [address.ipv4_mapped, address.sixtofour, *(address.teredo or ())]
            if any(item is not None and not public(str(item)) for item in embedded):
                return False
        return True
    if not addresses or any(not public(ip) for ip in addresses):
        raise ValueError('Image URLs must resolve exclusively to public IP addresses')
    return addresses


def _open_connection(host, port, address, secure, timeout):
    """Connect to the validated IP, retaining the original Host and TLS SNI."""
    deadline = time.monotonic() + timeout
    connection = http.client.HTTPConnection(host, port, timeout=timeout)
    family = socket.AF_INET6 if ipaddress.ip_address(address).version == 6 else socket.AF_INET
    raw = socket.socket(family, socket.SOCK_STREAM)
    try:
        raw.settimeout(timeout)
        raw.connect((address, port))
        if secure:
            context = ssl.create_default_context()
            # TCP connect and TLS handshake share one budget, not two full
            # timeouts. SSL's handshake timeout covers the whole handshake.
            raw.settimeout(_remaining(deadline))
            connection.sock = context.wrap_socket(raw, server_hostname=host)
        else:
            connection.sock = raw
    except BaseException:
        raw.close()
        raise
    return connection


def fetch_image(url, *, max_bytes, timeout=10):
    if max_bytes < 1 or timeout <= 0:
        raise ValueError('Image byte/time budget exhausted')
    deadline = time.monotonic() + timeout
    try:
        for redirect in range(MAX_REDIRECTS + 1):
            if len(url) > 8192 or any(ord(char) < 32 or ord(char) == 127 for char in url):
                raise ValueError('Invalid image URL')
            try:
                parsed = urlsplit(url)
                explicit_port = parsed.port
            except ValueError as exc:
                raise ValueError('Invalid image URL') from exc
            if (parsed.scheme not in {'http', 'https'} or not parsed.hostname
                    or parsed.username is not None or parsed.password is not None):
                raise ValueError('Images require HTTP(S) URLs without credentials')
            secure = parsed.scheme == 'https'
            host = parsed.hostname.encode('idna').decode('ascii')
            port = explicit_port if explicit_port is not None else (443 if secure else 80)
            if port != (443 if secure else 80):
                raise ValueError('Image URLs must use the standard HTTP(S) port')
            addresses = _resolve(host, port, deadline)
            connection = None
            for address in addresses:
                try:
                    connection = _open_connection(host, port, address, secure, _remaining(deadline))
                    break
                except OSError:
                    _remaining(deadline)
            if connection is None:
                raise ValueError('Unable to connect to image host')
            transport = connection.sock
            def expire(sock=transport):
                try:
                    sock.shutdown(socket.SHUT_RDWR)
                except OSError:
                    pass
            timer = threading.Timer(max(0, deadline - time.monotonic()), expire)
            timer.daemon = True
            response = None
            try:
                timer.start()
                target = quote(parsed.path or '/', safe="/%:@!$&'()*+,;=-._~")
                if parsed.query:
                    target += '?' + quote(parsed.query, safe="/%?:@!$&'()*+,;=-._~")
                transport.settimeout(_remaining(deadline))
                connection.request('GET', target, headers={'Accept': 'image/png,image/jpeg,image/webp',
                                   'Accept-Encoding': 'identity', 'User-Agent': 'simple-jev-image-loader',
                                   'Connection': 'close'})
                response = connection.getresponse()
                if response.status in {301, 302, 303, 307, 308}:
                    location = response.getheader('Location')
                    if not location or redirect == MAX_REDIRECTS:
                        raise ValueError('Image redirect limit exceeded or missing destination')
                    url = urljoin(url, location)
                    continue
                if response.status != 200:
                    raise ValueError('Image host did not return HTTP 200')
                encoding = response.getheader('Content-Encoding', 'identity').lower()
                if encoding != 'identity':
                    raise ValueError('Compressed HTTP image responses are not supported')
                mime = response.getheader('Content-Type', '').split(';')[0].strip().lower()
                if mime not in {'', 'application/octet-stream', 'image/png', 'image/jpeg', 'image/webp'}:
                    raise ValueError('Image host returned an unsupported content type')
                length = response.getheader('Content-Length')
                if length is not None:
                    try:
                        size = int(length)
                    except ValueError as exc:
                        raise ValueError('Invalid image content length') from exc
                    if not 0 <= size <= max_bytes:
                        raise ValueError('Image byte limit exceeded')
                chunks, total = [], 0
                while True:
                    transport.settimeout(_remaining(deadline))
                    chunk = response.read1(min(65536, max_bytes - total + 1))
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > max_bytes:
                        raise ValueError('Image byte limit exceeded')
                    chunks.append(chunk)
                    if response.isclosed():
                        break
                _remaining(deadline)
                if length is not None and total != size:
                    raise ValueError('Incomplete image response')
                return b''.join(chunks)
            finally:
                timer.cancel()
                if response is not None:
                    response.close()
                connection.close()
    except (OSError, http.client.HTTPException, UnicodeError) as exc:
        # Never echo URLs, credentials, resolver/TLS errors or response bodies.
        raise ValueError('Unable to download image') from exc
    raise ValueError('Image download failed')
