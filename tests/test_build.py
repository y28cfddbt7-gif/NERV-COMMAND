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
        self.assertEqual([p for p in config['browser_modules'] if p not in ['src/browser/v223-dialogue.js','src/browser/v223-workspace.js','src/browser/v222-interface.js','src/browser/v221-chronicle.js','src/browser/v221-drama-ui.js','src/browser/v220-terminal-ui.js','src/browser/v219-console-engine.js','src/browser/v219-battle-ui.js','src/browser/v219-magi-ui.js','src/browser/v219-navigation.js','src/browser/v218-city-art.js','src/browser/v217-tactical-engine.js','src/browser/v217-tactical-ui.js','src/vendor/v216-three-open.js','src/vendor/three-r160.min.js','src/vendor/v216-three-close.js','src/browser/v216-three-instances.js','src/browser/v216-city-stage.js','src/browser/v216-battle-screen.js','src/browser/v29-presentation.js','src/browser/v210-operations.js','src/browser/headquarters.js','src/browser/state-safeguard.js','src/browser/persistence-guard.js','src/browser/staff-world.js','src/browser/world-workflow.js','src/browser/v211-discovery.js','src/browser/v212-imagery.js','src/browser/v212-combat.js','src/browser/v212-messages.js','src/browser/v212-motion.js','src/browser/v213-personas.js','src/browser/v213-conversation.js','src/browser/v213-message-ui.js','src/browser/v214-route-open.js','src/browser/v214-security-engine.js','src/browser/v214-imagery.js','src/browser/v214-roster.js','src/browser/v214-security-ui.js','src/browser/v214-visuals.js','src/browser/v214-integration.js','src/browser/v214-ai.js','src/browser/v214-route-close.js','src/vendor/v215-anime-open.js','src/vendor/animejs-4.5.0.umd.min.js','src/vendor/v215-anime-close.js','src/browser/v215-world-engine.js','src/browser/v215-security-engine.js','src/browser/v215-angel-engine.js','src/browser/v215-motion.js','src/browser/v215-city.js','src/browser/v215-operations-ui.js','src/browser/v215-battle-ui.js','src/browser/v215-comms.js']],reference['browser_modules'])
        self.assertEqual([p for p in config['style_modules'] if p not in ['src/styles/v223-duty.css','src/styles/v222-interface.css','src/styles/v221-chronicle.css','src/styles/v220-terminal.css','src/styles/v219-console.css','src/styles/v218-city-art.css','src/styles/v217-tactical.css','src/styles/v216-battle.css','src/styles/pilot-portraits.css','src/styles/command-operations.css','src/styles/staff-world.css','src/styles/immersive-terminal.css','src/styles/contextual-comms.css','src/styles/v214-terminal.css','src/styles/v215-operations.css']],reference['style_modules'])
        for name,expected in reference['sha256'].items():
            # v2.16 explicitly extracts shared prepare/launch/vote transitions for
            # the standalone battle page. Keep the historical fixture intact;
            # original Node state and browser flows plus the new hangar-to-win
            # tests guard these transitions instead of old source bytes. v2.17 also
            # fixes lost-unit cable recovery and uses 10-second tactical turns;
            # classic 32-second rules remain covered by the historical flows.
            if name in ['src/browser/eva.js','src/browser/magi.js','src/browser/operation-visuals.js','src/browser/city-defense.js']:
                continue
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

    def test_v214_added_art_remains_separate_and_fixed(self):
        fixture=json.loads((ROOT/'tests/fixtures/v2_14_added_visuals.json').read_text())
        for name,expected in fixture['sha256'].items():
            with self.subTest(path=name):
                self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),expected)

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
        self.assertEqual(len(images), 13, 'Fixed images, repaired Angel sheet, weapon alpha and new battery inspection painting')
        expected = ['eva_units_redrawn.png', 'command_world_atlas.png',
                    'pilot_portraits.webp', 'command_staff.webp',
                    'headquarters_atlas.webp', 'armaments_v214.webp',
                    'directorate_v214.webp', 'angels_v221.webp','tokyo3_normal_v218.webp','tokyo3_armed_v218.webp','tokyo3_sheltered_v218.webp','armaments_alpha_v220.webp','city_batteries_v222.webp']
        # Compare digests to keep failures readable even for multi-megabyte assets.
        self.assertEqual({hashlib.sha256(base64.b64decode(x, validate=True)).hexdigest() for x in images},
                         {hashlib.sha256((ROOT/'assets'/name).read_bytes()).hexdigest() for name in expected})
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
