#!/usr/bin/env python3
"""Check shipped v2.7 source/build consistency without network dependencies."""
from pathlib import Path
import json, re, hashlib, sys
root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text(encoding='utf-8')
js = (root / 'app.js').read_text(encoding='utf-8')
css = (root / 'styles.css').read_text(encoding='utf-8')
artifact = root / 'NERV_COMMAND_v2_8_SCRIPTABLE.js'
if not artifact.exists(): artifact = root / 'NERV_COMMAND_v2_7_SCRIPTABLE.js'
scriptable = artifact.read_text(encoding='utf-8')
errors = []
if js not in html: errors.append('app.js not found in index.html')
if css not in html: errors.append('styles.css not found in index.html')
marker = 'const htmlSource = '
if marker not in scriptable:
    errors.append('Scriptable HTML payload missing')
else:
    start = scriptable.index(marker) + len(marker)
    payload, consumed = json.JSONDecoder().raw_decode(scriptable[start:])
    if payload != html: errors.append('embedded Scriptable HTML differs from index.html')
for path in ('AGENTS.md','MIGRATION_BRIEF.md','FIRST_CODEX_TASK.md'):
    if not (root/path).is_file(): errors.append('Missing '+path)
print('BASELINE', 'PASS' if not errors else 'FAIL')
print('Artifact', artifact.name)
print('HTML bytes', len(html.encode('utf-8')), 'JS bytes', len(js.encode('utf-8')), 'CSS bytes', len(css.encode('utf-8')))
print('Scriptable SHA256', hashlib.sha256(scriptable.encode('utf-8')).hexdigest())
for err in errors: print('ERROR:', err)
sys.exit(1 if errors else 0)
