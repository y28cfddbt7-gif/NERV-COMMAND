#!/usr/bin/env python3
"""Offline verification against exact immutable v4.0.4 Git blob hashes.

Allows a shallow CI checkout; does not fetch the historical multi-gigabyte
release tree solely to compare protected artwork/vendor source paths.
"""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/fixtures/protected_v404_sources.json'
PROTECTED_DIRS = (ROOT/'assets', ROOT/'src/vendor')
PROTECTED_STYLES = ('src/styles/eva.css','src/styles/command-visuals.css',
                    'src/styles/v218-city-art.css','src/styles/v222-interface.css')

def git_blob_digest(content):
    return hashlib.sha1(b'blob '+str(len(content)).encode('ascii')+b'\0'+content).hexdigest()

def main():
    fixture=json.loads(FIXTURE.read_text(encoding='utf-8'))
    expected=fixture['blob_sha']
    detected={}
    errors=[]
    for directory in PROTECTED_DIRS:
        for file in directory.rglob('*'):
            if file.is_file():
                name=file.relative_to(ROOT).as_posix()
                detected[name]=git_blob_digest(file.read_bytes())
    for name in PROTECTED_STYLES:
        file=ROOT/name
        if file.is_file():
            detected[name]=git_blob_digest(file.read_bytes())
    for name in sorted(set(expected)|set(detected)):
        if name not in expected:
            errors.append('unexpected protected path: '+name)
        elif name not in detected:
            errors.append('missing protected path: '+name)
        elif expected[name]!=detected[name]:
            errors.append('changed protected blob: '+name)
    if errors:
        print('PROTECTED SOURCES FAILED')
        for message in errors: print(message)
        return 1
    print('PROTECTED SOURCES PASS:',len(expected),'exact Git blob hashes vs',
          fixture['baseline'])
    return 0

if __name__=='__main__':
    sys.exit(main())
