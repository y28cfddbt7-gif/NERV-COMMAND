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
STEM = 'NERV_COMMAND_v' + json.loads((ROOT/'src/build.json').read_text())['version'].replace('.', '_')
SCRIPTABLE = STEM + '_SCRIPTABLE.js'


def payload(script):
    marker = 'const htmlSource = '
    return json.JSONDecoder().raw_decode(script.split(marker, 1)[1])[0]


class BuildTests(unittest.TestCase):
    def test_user_selected_07f2242_behavior_and_visual_baseline_is_preserved(self):
        reference=json.loads((ROOT/'tests/fixtures/reference_07f2242.json').read_text())
        config=json.loads((ROOT/'src/build.json').read_text())
        self.assertEqual([p for p in config['browser_modules'] if p not in ['src/browser/v29-presentation.js','src/browser/v210-operations.js','src/browser/headquarters.js','src/browser/state-safeguard.js','src/browser/persistence-guard.js','src/browser/staff-world.js','src/browser/world-workflow.js','src/browser/v211-discovery.js','src/browser/v212-imagery.js','src/browser/v212-combat.js','src/browser/v212-messages.js','src/browser/v212-motion.js','src/browser/v213-personas.js','src/browser/v213-conversation.js','src/browser/v213-message-ui.js']],reference['browser_modules'])
        self.assertEqual([p for p in config['style_modules'] if p not in ['src/styles/pilot-portraits.css','src/styles/command-operations.css','src/styles/staff-world.css','src/styles/immersive-terminal.css','src/styles/contextual-comms.css']],reference['style_modules'])
        for name,expected in reference['sha256'].items():
            with self.subTest(path=name):
                self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),expected)
        self.assertEqual(hashlib.sha256((ROOT/'assets/pilot_portraits.webp').read_bytes()).hexdigest(),reference['pilot_portraits_sha256'])

    def test_approved_eva_sheet_and_rendering_remain_fixed(self):
        fixture=json.loads((ROOT/'handoff/BASELINE.json').read_text())['implementation_files_sha256']
        for name in ['assets/eva_units_redrawn.png','src/styles/eva.css','src/styles/command-visuals.css']:
            self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),fixture[name],name)

    def test_all_newly_fixed_world_staff_and_intercept_art_is_unchanged(self):
        fixture=json.loads((ROOT/'tests/fixtures/v2_11_fixed_visuals.json').read_text())
        for name,expected in fixture['sha256'].items():
            with self.subTest(path=name):
                self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),expected)
        svg=re.search(r'<svg class="city-weapon-drawing".*?</svg>',(ROOT/'src/ui/pages/headquarters.html').read_text(),re.S).group()
        self.assertEqual(hashlib.sha256(svg.encode()).hexdigest(),fixture['city_weapon_svg_sha256'])

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
        self.assertEqual(len(images), 5, 'Fixed EVA/pilot art plus world, headquarters and staff sheets')
        self.assertEqual({base64.b64decode(x, validate=True) for x in images},
                         {(ROOT/'assets/eva_units_redrawn.png').read_bytes(),
                          (ROOT/'assets/command_world_atlas.png').read_bytes(),
                          (ROOT/'assets/pilot_portraits.webp').read_bytes(),
                          (ROOT/'assets/command_staff.webp').read_bytes(),
                          (ROOT/'assets/headquarters_atlas.webp').read_bytes()})
        for encoded in images:
            self.assertIn(base64.b64decode(encoded, validate=True), assets)
        self.assertEqual(payload((ROOT / SCRIPTABLE).read_text()), html)

    def test_small_starter_pins_current_runtime_and_contains_no_image_payload(self):
        starter=(ROOT/(STEM+'_STARTER.js')).read_text()
        self.assertLess(len(starter.encode()),20000)
        self.assertNotIn('data:image/',starter)
        self.assertIn(hashlib.sha256((ROOT/SCRIPTABLE).read_bytes()).hexdigest(),starter)
        self.assertIn('/'+SCRIPTABLE,starter)

    def test_portable_repeated_build_and_release_contents(self):
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory)
            self.build(out)
            files = {p.relative_to(out): p.read_bytes() for p in out.rglob('*') if p.is_file()}
            self.build(out)
            self.assertEqual(files, {p.relative_to(out): p.read_bytes()
                                     for p in out.rglob('*') if p.is_file()})
            with zipfile.ZipFile(out / ('dist/'+STEM+'_RELEASE.zip')) as archive:
                self.assertIsNone(archive.testzip())
                sums = json.loads(archive.read('SHA256SUMS.json'))
                self.assertEqual(set(archive.namelist()), {*sums, 'SHA256SUMS.json'})
                for name, sha in sums.items():
                    self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(), sha, name)
                self.assertEqual(archive.read(STEM+'_COPY_PASTE.txt'),
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
            shutil.copy2(ROOT / 'COPY_SCRIPTABLE.md', checkout)
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
