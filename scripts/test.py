#!/usr/bin/env python3
"""Build and run all regressions, stopping on the first failed command."""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--no-browser', action='store_true',
                        help='Explicitly omit browser regressions (not full validation)')
    parser.add_argument('--browser-workers',type=int,choices=range(1,5),default=1,help='Run independent browser files in 1–4 workers after the build')
    args = parser.parse_args()
    commands = [
        [sys.executable, 'scripts/build.py'],
        [sys.executable, 'scripts/build.py', '--check'],
        [sys.executable, 'scripts/verify_baseline.py'],
        ['node', '--check', 'app.js'],
        ['node', 'tests/qa_state_v23.js'],
        ['node', 'tests/qa_widgets_v23.js'],
        ['node', 'tests/qa_widgets_operations.js'],
        ['node', 'tests/qa_scriptable_bridge.js'],
        ['node', 'tests/qa_starter.js'],
        ['node', 'tests/qa_persistence_recovery.js'],
        ['node', 'tests/qa_ai_native.js'],
        [sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py', '-v'],
    ]
    if not args.no_browser and args.browser_workers == 1:
        commands += [[sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'qa_*browser.py', '-v'],
                     [sys.executable, 'tests/qa_v26_flow.py']]
    for command in commands:
        print('\n> ' + ' '.join(command), flush=True)
        subprocess.run(command, cwd=ROOT, check=True)
    if not args.no_browser and args.browser_workers > 1:
        results=ROOT/'test-results';results.mkdir(exist_ok=True)
        def run_browser(path):
            log=results/(path.stem+'.log')
            command=[sys.executable,'-m','unittest','discover','-s','tests','-p',path.name,'-v']
            with log.open('w') as handle:
                result=subprocess.run(command,cwd=ROOT,stdout=handle,stderr=subprocess.STDOUT)
            return path.name,result.returncode,log
        failed=[]
        with ThreadPoolExecutor(max_workers=args.browser_workers) as pool:
            futures=[pool.submit(run_browser,p) for p in sorted((ROOT/'tests').glob('qa_*browser.py'))]
            for future in as_completed(futures):
                name,code,log=future.result();print(('FAIL ' if code else 'PASS ')+name+' / '+str(log.relative_to(ROOT)),flush=True)
                if code:failed.append(name)
        if failed:raise subprocess.CalledProcessError(1,failed)
        subprocess.run([sys.executable,'tests/qa_v26_flow.py'],cwd=ROOT,check=True)
    print('\nPASS selected checks' + ('; browser regressions NOT RUN' if args.no_browser else ' (including browser regressions)'))


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as error:
        sys.exit(error.returncode)
