"""Reproducibility, artifact equivalence and source-to-target propagation."""
import base64
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SCRIPTABLE = 'NERV_COMMAND_v2_7_SCRIPTABLE.js'


def payload(script):
    marker = 'const htmlSource = '
    return json.JSONDecoder().raw_decode(script.split(marker, 1)[1])[0]


class BuildTests(unittest.TestCase):
    def test_approved_eva_sheet_and_rendering_remain_fixed(self):
        fixture=json.loads((ROOT/'handoff/BASELINE.json').read_text())['implementation_files_sha256']
        for name in ['assets/eva_units_redrawn.png','src/styles/eva.css','src/styles/command-visuals.css']:
            self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),fixture[name],name)

    def build(self, out, checkout=ROOT):
        subprocess.run([sys.executable, str(checkout / 'scripts/build.py'),
                        '--out-dir', str(out)], cwd=out, check=True, capture_output=True)

    def test_unmodified_state_and_task_engines_remain_unchanged(self):
        fixture = json.loads((ROOT / 'tests/fixtures/v2_7_gameplay_modules.json').read_text())
        for name in ['src/browser/state.js','src/browser/tools.js']:
            sha = fixture['sha256'][name]
            with self.subTest(file=name):
                self.assertEqual(hashlib.sha256((ROOT / name).read_bytes()).hexdigest(), sha)

    def test_all_inline_assets_match_source_files(self):
        assets = {p.read_bytes() for p in (ROOT / 'assets').iterdir() if p.is_file()}
        html = (ROOT / 'index.html').read_text()
        images = re.findall(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)', html)
        self.assertEqual(len(images), 2, 'One immutable EVA sheet and one shared environment atlas')
        self.assertEqual({base64.b64decode(x, validate=True) for x in images},
                         {(ROOT/'assets/eva_units_redrawn.png').read_bytes(),
                          (ROOT/'assets/command_world_atlas.png').read_bytes()})
        for encoded in images:
            self.assertIn(base64.b64decode(encoded, validate=True), assets)
        self.assertEqual(payload((ROOT / SCRIPTABLE).read_text()), html)

    def test_portable_repeated_build_and_release_contents(self):
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory)
            self.build(out)
            files = {p.relative_to(out): p.read_bytes() for p in out.rglob('*') if p.is_file()}
            self.build(out)
            self.assertEqual(files, {p.relative_to(out): p.read_bytes()
                                     for p in out.rglob('*') if p.is_file()})
            with zipfile.ZipFile(out / 'dist/NERV_COMMAND_v2_7_RELEASE.zip') as archive:
                self.assertIsNone(archive.testzip())
                sums = json.loads(archive.read('SHA256SUMS.json'))
                self.assertEqual(set(archive.namelist()), {*sums, 'SHA256SUMS.json'})
                for name, sha in sums.items():
                    self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(), sha, name)
                self.assertEqual(archive.read('NERV_COMMAND_v2_7_COPY_PASTE.txt'),
                                 archive.read(SCRIPTABLE))
                self.assertEqual(archive.read('index.html').decode(),
                                 payload(archive.read(SCRIPTABLE).decode()))

    def test_check_rejects_stale_outputs(self):
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory)
            self.build(out)
            (out / 'app.js').write_text('// stale artifact\n')
            result = subprocess.run([sys.executable, str(ROOT / 'scripts/build.py'),
                                     '--out-dir', str(out), '--check'], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertIn('app.js', result.stderr)

    def test_module_change_reaches_both_targets_in_relocated_checkout(self):
        with tempfile.TemporaryDirectory() as directory:
            checkout = Path(directory)
            for name in ['src', 'assets', 'scripts', 'docs']:
                shutil.copytree(ROOT / name, checkout / name, ignore=shutil.ignore_patterns('__pycache__'))
            shutil.copy2(ROOT / 'README_v2_7.md', checkout)
            module = checkout / 'src/browser/mission.js'
            module.write_text(module.read_text().replace('都市防衛・迎撃訓練を開始',
                                                         'BUILD PROPAGATION TEST'))
            self.build(checkout, checkout)
            self.assertIn('BUILD PROPAGATION TEST', (checkout / 'app.js').read_text())
            html = (checkout / 'index.html').read_text()
            self.assertIn('BUILD PROPAGATION TEST', html)
            self.assertEqual(payload((checkout / SCRIPTABLE).read_text()), html)


if __name__ == '__main__':
    unittest.main()
