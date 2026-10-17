#!/usr/bin/env python3
"""Archive one committed project, including handoff context, with per-file hashes."""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import subprocess
import sys
import tarfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def git(*args: str) -> bytes:
    return subprocess.check_output(['git', *args], cwd=ROOT)


def create_package(ref: str) -> Path:
    commit = git('rev-parse', '--verify', '--end-of-options', ref + '^{commit}').decode().strip()
    archive = git('archive', '--format=tar', commit)
    files = {}
    with tarfile.open(fileobj=io.BytesIO(archive), mode='r:') as source:
        for member in source:
            if member.isdir():
                continue
            path = PurePosixPath(member.name)
            if path.is_absolute() or '..' in path.parts or not member.isfile():
                raise ValueError('Unsupported committed archive entry: ' + member.name)
            with source.extractfile(member) as data:
                files[path.as_posix()] = data.read()
    required = {'HANDOFF.md', 'AGENTS.md', 'handoff/NEXT_CHAT_PROMPT.md',
                'handoff/QUALITY_GATE.md', 'handoff/BASELINE.json',
                'handoff/VALIDATION_LOG.txt', 'handoff/previews/README.md',
                'src/build.json', 'scripts/build.py', 'scripts/test.py', 'scripts/handoff.py'}
    missing = required - files.keys()
    if missing:
        raise ValueError('Commit the complete handoff first; missing: ' + ', '.join(sorted(missing)))
    config = json.loads(files['src/build.json'])
    stem = 'NERV_COMMAND_v' + config['version'].replace('.', '_')
    scriptable = stem + '_SCRIPTABLE.js'
    for name in [scriptable, 'index.html', 'app.js', 'styles.css', 'requirements-dev.txt']:
        if name not in files:
            raise ValueError('Missing committed project file: ' + name)
    files.pop('HANDOFF_PACKAGE.json', None)
    files.pop('SHA256SUMS.json', None)
    baseline = json.loads(files['handoff/BASELINE.json'])
    metadata = {
        'format': 'nerv-command-handoff-v1',
        'archive_commit': commit,
        'archive_commit_time': git('show', '-s', '--format=%cI', commit).decode().strip(),
        'repository': baseline['repository'],
        'implementation_baseline_commit': baseline['implementation_commit'],
        'entry_document': 'HANDOFF.md',
        'next_chat_prompt': 'handoff/NEXT_CHAT_PROMPT.md',
        'scriptable': scriptable,
        'scope': 'Committed project only; .git and untracked runtime files are excluded.',
    }
    files['HANDOFF_PACKAGE.json'] = (json.dumps(metadata, ensure_ascii=False, indent=2) + '\n').encode()
    sums = {name: hashlib.sha256(data).hexdigest() for name, data in sorted(files.items())}
    files['SHA256SUMS.json'] = (json.dumps(sums, ensure_ascii=False, indent=2) + '\n').encode()
    destination = ROOT / 'dist' / ('NERV_COMMAND_HANDOFF_' + commit[:12] + '.zip')
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            output.writestr(info, data, compresslevel=9)
    with zipfile.ZipFile(destination) as output:
        if output.testzip() is not None:
            raise ValueError('Archive CRC check failed')
        for name, expected in sums.items():
            if hashlib.sha256(output.read(name)).hexdigest() != expected:
                raise ValueError('Archive hash mismatch: ' + name)
    print(json.dumps({'path': str(destination), 'commit': commit, 'files': len(files),
                      'bytes': destination.stat().st_size,
                      'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()}, indent=2))
    return destination


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', default='HEAD', help='Committed Git ref to package (default: HEAD)')
    args = parser.parse_args()
    create_package(args.ref)


if __name__ == '__main__':
    try:
        main()
    except (ValueError, subprocess.CalledProcessError, OSError) as error:
        print('Cannot create handoff: ' + str(error), file=sys.stderr)
        sys.exit(1)
