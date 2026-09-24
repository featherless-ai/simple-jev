"""Prepare a dataset locally; no model calls.

Use `python3 eval/prepare.py <group> --help` for dataset-specific options.
The converters live in preparation/ so the public CLI stays small.
"""
import argparse
import importlib
import sys

GROUPS = ('additional', 'coding', 'decision_index', 'domains', 'external', 'knowledge',
          'mmlu', 'multi_decision', 'security_rerank', 'vision', 'visual_qa', 'wanli')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('group', choices=GROUPS)
    # Parse just the group; the converter owns the remaining options and --help.
    args = parser.parse_args(sys.argv[1:2])
    sys.argv = [f'{sys.argv[0]} {args.group}', *sys.argv[2:]]
    importlib.import_module(f'preparation.{args.group}').main()


if __name__ == '__main__':
    main()
