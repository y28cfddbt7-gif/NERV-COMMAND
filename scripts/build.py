#!/usr/bin/env python3
"""Portable, deterministic browser + single-file Scriptable build (stdlib only)."""
import argparse
import json
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def build(check=False, release=False):
    read = lambda name: (ROOT / 'src' / name).read_text(encoding='utf-8')
    core = read('core.js')
    end = core.rfind('})();')
    assert end >= 0, 'Missing core closure'
    js = core[:end] + read('personnel.js') + '\n' + core[end:]
    css = read('base.css') + '\n' + read('personnel.css')
    html = read('browser.html').replace('@@APP_JS@@', js).replace('@@APP_CSS@@', css)
    native = read('scriptable.js').replace('@@HTML_JSON@@', json.dumps(html, ensure_ascii=False))
    outputs = {'app.js': js, 'styles.css': css, 'index.html': html,
               'NERV_COMMAND_v2_8_SCRIPTABLE.js': native}
    stale = []
    for name, contents in outputs.items():
        target = ROOT / name
        if check:
            if not target.exists() or target.read_text(encoding='utf-8') != contents:
                stale.append(name)
        else:
            target.write_text(contents, encoding='utf-8')
    if stale:
        print('STALE:', ', '.join(stale))
        return 1
    if release:
        folder = ROOT / 'dist'
        folder.mkdir(exist_ok=True)
        (folder / 'NERV_COMMAND_v2_8_COPY_PASTE.txt').write_text(native, encoding='utf-8')
        with zipfile.ZipFile(folder / 'NERV_COMMAND_v2_8.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
            files = ['index.html', 'app.js', 'styles.css', 'NERV_COMMAND_v2_8_SCRIPTABLE.js',
                     'README_v2_8.md', 'dist/NERV_COMMAND_v2_8_COPY_PASTE.txt'] + [str(p.relative_to(ROOT)) for p in sorted((ROOT / 'assets').glob('*')) if p.is_file()]
            for name in files:
                archive_name = name.removeprefix('dist/')
                info = zipfile.ZipInfo(archive_name, date_time=(2026, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, (ROOT / name).read_bytes())
    print('BUILD CHECK PASS' if check else 'BUILD PASS')
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--release', action='store_true')
    args = parser.parse_args()
    sys.exit(build(args.check, args.release))
