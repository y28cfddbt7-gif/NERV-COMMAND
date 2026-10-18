#!/usr/bin/env python3
"""Build the browser and single-file Scriptable release using only Python's stdlib."""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
from pathlib import Path
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
TOKEN = re.compile(r"\{\{(include:[^{}]+|asset:[^{}]+|styles|app|html)\}\}")


def source(path: str) -> Path:
    resolved = (ROOT / path).resolve()
    if not resolved.is_relative_to(ROOT):
        raise ValueError(f"Source escapes repository: {path}")
    return resolved


def render(path: str, values: dict[str, str], assets: dict[str, str], stack=()) -> str:
    if path in stack:
        raise ValueError(f"Recursive template include: {' -> '.join((*stack, path))}")

    def replace(match):
        token = match[1]
        if token.startswith('include:'):
            return render(token[8:], values, assets, (*stack, path))
        if token.startswith('asset:'):
            name = token[6:]
            encoded = base64.b64encode(source(name).read_bytes()).decode('ascii')
            return f'data:{assets[name]};base64,{encoded}'
        return values[token]

    # Substitute once: application strings and JSON must never be treated as templates.
    return TOKEN.sub(replace, source(path).read_text(encoding='utf-8'))


def artifacts() -> dict[str, bytes]:
    config = json.loads(source('src/build.json').read_text(encoding='utf-8'))
    values = {
        'app': ''.join(source(p).read_text(encoding='utf-8') for p in config['browser_modules']),
    }
    values['styles'] = ''.join(render(p, values, config['assets']) for p in config['style_modules'])
    html = render(config['browser_template'], values, config['assets'])
    values['html'] = json.dumps(html, ensure_ascii=False, separators=(',', ':'))
    scriptable = render(config['scriptable_template'], values, config['assets'])
    stem = 'NERV_COMMAND_v' + config['version'].replace('.', '_')
    products = {
        'app.js': values['app'].encode(),
        'styles.css': values['styles'].encode(),
        'index.html': html.encode(),
        f'{stem}_SCRIPTABLE.js': scriptable.encode(),
    }
    release = {
        **products,
        f'{stem}_COPY_PASTE.txt': scriptable.encode(),
        'README_v2_7.md': source('README_v2_7.md').read_bytes(),
        'RELEASE_README.txt': source('docs/RELEASE_README.txt').read_bytes(),
        'STAFF_GUIDE.md': source('docs/STAFF_GUIDE.md').read_bytes(),
        'PERSONNEL_SERVICES.md': source('docs/PERSONNEL_SERVICES.md').read_bytes(),
        'TERMINAL_EXPANSION.md': source('docs/TERMINAL_EXPANSION.md').read_bytes(),
        'RESEARCH_TERMINAL_EXPANSION.md': source('docs/RESEARCH_TERMINAL_EXPANSION.md').read_bytes(),
        'ART_DIRECTION.md': source('docs/ART_DIRECTION.md').read_bytes(),
        'V2_9_RESTORATION.md': source('docs/V2_9_RESTORATION.md').read_bytes(),
        'RESEARCH_MOBILE_OPERATIONS.md': source('docs/RESEARCH_MOBILE_OPERATIONS.md').read_bytes(),
    }
    for path in sorted(source('assets').rglob('*')):
        if path.is_file():
            release[path.relative_to(ROOT).as_posix()] = path.read_bytes()
    checksums = (json.dumps({name: hashlib.sha256(data).hexdigest()
                            for name, data in sorted(release.items())}, indent=2) + '\n').encode()
    release['SHA256SUMS.json'] = checksums
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(release.items()):
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, data, compresslevel=9)
    products.update({
        f'dist/{stem}_COPY_PASTE.txt': scriptable.encode(),
        f'dist/{stem}_RELEASE.zip': archive.getvalue(),
        'dist/SHA256SUMS.json': checksums,
    })
    return products


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out-dir', type=Path, default=ROOT,
                        help='Output directory; defaults to the repository root')
    parser.add_argument('--check', action='store_true',
                        help='Check tracked artifacts without writing or requiring dist/')
    args = parser.parse_args()
    output = args.out_dir.resolve()
    products = artifacts()
    if args.check:
        stale = [name for name, data in products.items() if not name.startswith('dist/')
                 and (not (output / name).is_file() or (output / name).read_bytes() != data)]
        if stale:
            print('STALE generated artifacts: ' + ', '.join(stale), file=sys.stderr)
            return 1
        print('PASS generated artifacts match modular sources')
    else:
        for name, data in products.items():
            path = output / name
            path.parent.mkdir(parents=True, exist_ok=True)
            # Avoid touching valid outputs, so repeat builds preserve their timestamps.
            if not path.is_file() or path.read_bytes() != data:
                path.write_bytes(data)
        print(f'Built {len(products)} artifacts in {output}')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError) as error:
        print(f'Build failed: {error}', file=sys.stderr)
        sys.exit(1)
