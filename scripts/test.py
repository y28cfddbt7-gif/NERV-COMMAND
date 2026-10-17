#!/usr/bin/env python3
"""Run generated-file, state, widget and real Chromium checks; fail immediately."""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
commands = [
    [sys.executable, 'scripts/build.py', '--check'],
    [sys.executable, 'scripts/verify_baseline.py'],
    ['node', '--check', 'app.js'],
    ['node', 'tests/qa_state_v23.js'],
    ['node', 'tests/qa_widgets_v23.js'],
    ['node', 'tests/qa_widgets_v23.js', 'NERV_COMMAND_v2_8_SCRIPTABLE.js'],
    [sys.executable, 'tests/qa_personnel_v28.py'],
]
for command in commands:
    print('RUN', ' '.join(command), flush=True)
    result = subprocess.run(command, cwd=root)
    if result.returncode:
        sys.exit(result.returncode)
print('ALL CHECKS PASS')
