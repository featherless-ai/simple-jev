"""Public URL transport tests. No external network is required by this suite."""
import http.client
import io
import socket
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest
from PIL import Image

import hf_media
from hf_vision import image_messages


@pytest.mark.parametrize('address', ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1',
                                    '169.254.169.254', '0.0.0.0', '::1', 'fe80::1',
                                    'fc00::1', '::ffff:127.0.0.1', '192.0.2.1', '224.0.0.1',
                                    'ff02::1', '2002:7f00:1::', '100.64.0.1'])
def test_nonpublic_addresses_rejected(monkeypatch, address):
    monkeypatch.setattr(socket, 'getaddrinfo', lambda *a, **k: [(0, 0, 0, '', (address, 80))])
    with pytest.raises(ValueError, match='public IP'):
        hf_media.fetch_image('http://example.com/image.png', max_bytes=100)


def test_mixed_dns_answer_rejected(monkeypatch):
    monkeypatch.setattr(socket, 'getaddrinfo', lambda *a, **k: [
        (0, 0, 0, '', ('8.8.8.8', 80)), (0, 0, 0, '', ('127.0.0.1', 80))])
    with pytest.raises(ValueError, match='public IP'):
        hf_media.fetch_image('http://example.com/image.png', max_bytes=100)


@pytest.mark.parametrize('url', ['file:///etc/passwd', 'ftp://example.com/x',
    'http://user:secret@example.com/x', 'http://example.com:8080/x',
    'https://example.com:bad/x', 'https://example.com:0/x', 'https://[broken/x', 'https://example.com/\r\nx',
    'https://example.com/' + 'a' * 8192])
def test_invalid_urls_never_resolved(monkeypatch, url):
    def forbidden(*a, **k):
        pytest.fail('invalid URL reached DNS')
    monkeypatch.setattr(hf_media, '_resolve', forbidden)
    with pytest.raises(ValueError):
        hf_media.fetch_image(url, max_bytes=100)


@pytest.fixture
def transport(monkeypatch):
    """Exercise real HTTP framing while replacing only the dial destination.

    Production's resolver and pinned-socket implementation have separate tests;
    this test-only mapping does not create a production private-network override.
    """
    output = io.BytesIO()
    Image.new('RGB', (8, 5), 'blue').save(output, format='PNG')
    png = output.getvalue()
    calls = []
    class Handler(BaseHTTPRequestHandler):
        protocol_version = 'HTTP/1.1'
        def log_message(self, *args):
            pass
        def do_GET(self):
            calls.append((self.path, self.headers.get('Host')))
            if self.path == '/redirect':
                self.send_response(302); self.send_header('Location', '/image'); self.end_headers(); return
            if self.path == '/private':
                self.send_response(302); self.send_header('Location', 'http://127.0.0.1/image'); self.end_headers(); return
            if self.path == '/loop':
                self.send_response(302); self.send_header('Location', '/loop'); self.end_headers(); return
            if self.path == '/slow':
                time.sleep(.3)
            self.send_response(404 if self.path == '/missing' else 200)
            self.send_header('Content-Type', 'text/html' if self.path == '/html' else 'image/png')
            self.send_header('Connection', 'close')
            if self.path == '/huge': self.send_header('Content-Length', '10000000')
            if self.path == '/length': self.send_header('Content-Length', str(len(png)))
            if self.path == '/truncated': self.send_header('Content-Length', str(len(png) + 1))
            if self.path == '/badlength': self.send_header('Content-Length', '-2')
            if self.path == '/gzip': self.send_header('Content-Encoding', 'gzip')
            self.end_headers()
            try: self.wfile.write(png)
            except (BrokenPipeError, ConnectionResetError): pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
    def resolve(host, port, deadline):
        if host != 'example.com': raise ValueError('not a public IP')
        return ['8.8.8.8']
    def connect(host, port, address, secure, timeout):
        assert host == 'example.com' and address == '8.8.8.8'
        conn = http.client.HTTPConnection(host, port, timeout=timeout)
        conn.sock = socket.create_connection(server.server_address, timeout=timeout)
        return conn
    monkeypatch.setattr(hf_media, '_resolve', resolve)
    monkeypatch.setattr(hf_media, '_open_connection', connect)
    yield png, calls
    server.shutdown(); server.server_close(); thread.join()


@pytest.mark.parametrize('path', ['/image', '/length', '/redirect'])
def test_stream_download(transport, path):
    png, calls = transport
    assert hf_media.fetch_image('http://example.com' + path, max_bytes=len(png)) == png
    assert all(host == 'example.com' for _, host in calls)


@pytest.mark.parametrize('path', ['/private', '/loop', '/huge', '/badlength', '/html', '/missing', '/gzip', '/truncated'])
def test_remote_rejections(transport, path):
    with pytest.raises(ValueError):
        hf_media.fetch_image('http://example.com' + path, max_bytes=1000)


def test_no_content_length_cannot_bypass_limit(transport):
    with pytest.raises(ValueError, match='byte limit'):
        hf_media.fetch_image('http://example.com/image', max_bytes=10)


def test_total_wall_time_bounds_headers(transport):
    start = time.monotonic()
    with pytest.raises(ValueError):
        hf_media.fetch_image('http://example.com/slow', max_bytes=1000, timeout=.05)
    assert time.monotonic() - start < .25


def test_remote_image_is_decoded_and_normalized(transport):
    messages, images = image_messages([{'role': 'user', 'content': [
        {'type': 'image_url', 'image_url': {'url': 'http://example.com/image'}}]}])
    assert images[0].size == (8, 5) and images[0].mode == 'RGB'
    assert messages[0]['content'] == [{'type': 'image'}]


@pytest.mark.parametrize('connect_seconds', [1., 3.])
def test_connection_pins_ip_and_preserves_tls_hostname(monkeypatch, connect_seconds):
    events = []
    # A one-second TCP connect must leave only one second for TLS, not grant
    # a second full timeout. Clock values are consumed only by this helper.
    clock = iter([100., 100. + connect_seconds])
    from types import SimpleNamespace
    monkeypatch.setattr(hf_media, 'time', SimpleNamespace(monotonic=lambda: next(clock)))
    class Sock:
        def settimeout(self, timeout): events.append(('timeout', timeout))
        def connect(self, address): events.append(('connect', address))
        def close(self): events.append(('close',))
    sock = Sock()
    monkeypatch.setattr(socket, 'socket', lambda *a: sock)
    class Context:
        def wrap_socket(self, raw, server_hostname):
            assert raw is sock
            events.append(('sni', server_hostname))
            return raw
    monkeypatch.setattr(hf_media.ssl, 'create_default_context', Context)
    if connect_seconds >= 2:
        with pytest.raises(ValueError, match='timed out'):
            hf_media._open_connection('example.com', 443, '8.8.8.8', True, 2)
        assert events == [('timeout', 2), ('connect', ('8.8.8.8', 443)), ('close',)]
        return
    conn = hf_media._open_connection('example.com', 443, '8.8.8.8', True, 2)
    assert conn.host == 'example.com' and conn.sock is sock
    assert events == [('timeout', 2), ('connect', ('8.8.8.8', 443)), ('timeout', 1), ('sni', 'example.com')]
    conn.close()
