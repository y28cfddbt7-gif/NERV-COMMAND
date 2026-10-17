#!/usr/bin/env python3
"""Build and run all regressions, stopping on the first failed command."""
import argparse
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--no-browser', action='store_true',
                        help='Explicitly omit browser regressions (not full validation)')
    args = parser.parse_args()
    commands = [
        [sys.executable, 'scripts/build.py'],
        [sys.executable, 'scripts/build.py', '--check'],
        [sys.executable, 'scripts/verify_baseline.py'],
        ['node', '--check', 'app.js'],
        ['node', 'tests/qa_state_v23.js'],
        ['node', 'tests/qa_widgets_v23.js'],
        ['node', 'tests/qa_scriptable_bridge.js'],
        [sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py', '-v'],
    ]
    if not args.no_browser:
        commands += [[sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'qa_*browser.py', '-v'],
                     [sys.executable, 'tests/qa_v26_flow.py']]
    for command in commands:
        print('\n> ' + ' '.join(command), flush=True)
        subprocess.run(command, cwd=ROOT, check=True)
    print('\nPASS selected checks' + ('; browser regressions NOT RUN' if args.no_browser else ' (including browser regressions)'))


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as error:
        sys.exit(error.returncode)
