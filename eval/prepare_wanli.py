"""Fetch SemIf's pinned WANLI test snapshot and rebuild its exact 256-row subset.

No inference. Verify both cached and downloaded bytes before invoking the original
builder. Upstream dataset: alisawuffles/WANLI, CC-BY-4.0. Selection and conversion:
TheoLeeCJ/SemIf, MIT (see vendor/semif/LICENSE).
"""
import argparse
import hashlib
from pathlib import Path
import subprocess
import sys
import urllib.request

URL = ('https://huggingface.co/datasets/alisawuffles/WANLI/resolve/'
       '61c95318fd71c55b6ba355d76253254615f387ec/test.jsonl')
SHA256 = '4276e0af7fcdf657d1ab7beb54eaf025fda592a76c9ee86b63b7871953fc74fd'
LIMIT = 64 * 1024 * 1024
ROOT = Path(__file__).resolve().parent


def verified(data):
    if len(data) > LIMIT or hashlib.sha256(data).hexdigest() != SHA256:
        raise ValueError('WANLI snapshot hash/size mismatch; refusing a changed benchmark')
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=ROOT/'sources/wanli-test.jsonl')
    parser.add_argument('--output', type=Path, default=ROOT/'data/wanli256.jsonl')
    args = parser.parse_args()
    if args.output.exists():
        parser.error('Output already exists; choose a new path')
    if args.source.exists():
        verified(args.source.read_bytes())
    else:
        request = urllib.request.Request(URL, headers={'User-Agent':'simple-jev-eval/1.0'})
        with urllib.request.urlopen(request, timeout=60) as response:
            data = verified(response.read(LIMIT+1))
        args.source.parent.mkdir(parents=True,exist_ok=True)
        with args.source.open('xb') as output:
            output.write(data)
    subprocess.run([sys.executable,str(ROOT/'vendor/semif/build_wanli.py'),
                    '--source',str(args.source),
                    '--selection',str(ROOT/'vendor/semif/source-selection.jsonl'),
                    '--output',str(args.output)],check=True)


if __name__ == '__main__':
    main()
