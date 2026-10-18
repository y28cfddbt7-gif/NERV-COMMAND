#!/usr/bin/env python3
"""Print an immutable Scriptable link only after verifying its branch was published."""
from pathlib import Path
import argparse
import json
import subprocess
import sys
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
VERSION = json.loads((ROOT / 'src/build.json').read_text(encoding='utf-8'))['version']
FILE = 'NERV_COMMAND_v' + VERSION.replace('.', '_') + '_SCRIPTABLE.js'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()


def main(starter=False):
    file=FILE.replace("_SCRIPTABLE.js","_STARTER.js") if starter else FILE
    origin = git('remote', 'get-url', 'origin')
    if origin.startswith('git@github.com:'):
        name = origin.split(':', 1)[1]
    else:
        parsed = urlsplit(origin)
        if parsed.hostname != 'github.com':
            raise ValueError('The origin is not a supported GitHub URL.')
        name = parsed.path.lstrip('/')
    name = name.removesuffix('.git')
    if len(name.split('/')) != 2:
        raise ValueError('Cannot determine the repository owner/name.')
    branch = git('branch', '--show-current')
    if not branch:
        raise ValueError('Publish a named branch before generating its code link.')
    commit = git('rev-parse', 'HEAD')
    remote = git('ls-remote', 'origin', 'refs/heads/' + branch)
    if not remote or remote.split()[0] != commit:
        raise ValueError('The current branch commit is not published; no updated code link was generated.')
    if starter:
        configured=json.loads((ROOT/'src/build.json').read_text()).get('scriptable_runtime_ref')
        if configured!=branch:
            raise ValueError('Starter runtime ref must match the published branch; update src/build.json and rebuild.')
        if git('status','--porcelain','--',FILE):
            raise ValueError('The starter runtime has uncommitted changes.')
    if git('status', '--porcelain', '--', file):
        raise ValueError('The Scriptable export has uncommitted changes; commit and publish them first.')
    git('cat-file', '-e', 'HEAD:' + file)
    subprocess.run([sys.executable, str(ROOT / 'scripts/build.py'), '--check'],
                   cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    print(f'https://github.com/{name}/blob/{commit}/{file}')


if __name__ == '__main__':
    try:
        parser=argparse.ArgumentParser(description=__doc__)
        parser.add_argument('--starter',action='store_true',help='Verify and print the small recommended Scriptable starter')
        main(parser.parse_args().starter)
    except (ValueError, subprocess.CalledProcessError) as error:
        print('Cannot create verified copy link: ' + str(error), file=sys.stderr)
        sys.exit(1)
