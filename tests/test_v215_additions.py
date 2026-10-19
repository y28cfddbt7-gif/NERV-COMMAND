"""Pinned vendor integrity, license and separate Angel artwork."""
import hashlib
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

class V215AdditionsTests(unittest.TestCase):
    def test_official_anime_bundle_license_and_new_art_are_pinned(self):
        fixture=json.loads((ROOT/'tests/fixtures/v2_15_additions.json').read_text())
        for name,expected in fixture['sha256'].items():
            with self.subTest(file=name):self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),expected)
        self.assertIn('@version v4.5.0',(ROOT/'src/vendor/animejs-4.5.0.umd.min.js').read_text()[:350])
        self.assertIn('Permission is hereby granted',(ROOT/'app.js').read_text())
        self.assertIn('The MIT License',(ROOT/'src/vendor/ANIMEJS_LICENSE.txt').read_text())

    def test_bundled_animation_is_offline_and_uses_no_default_main_loop(self):
        self.assertIn('window.anime.engine.useDefaultMainLoop=false',(ROOT/'src/vendor/v215-anime-close.js').read_text())
        self.assertNotIn('src="https://animejs.com',(ROOT/'index.html').read_text())
        self.assertIn('registerHook',(ROOT/'src/browser/v215-motion.js').read_text())
