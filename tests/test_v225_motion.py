"""v2.25 tactical presentation safety and build wiring tests."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class TacticalMotionTests(unittest.TestCase):
    def test_modular_build_contains_v225_after_v224(self):
        config=json.loads((ROOT/'src/build.json').read_text(encoding='utf-8'))
        self.assertEqual(config['version'],'3.2.2')
        app=config['browser_modules']
        self.assertLess(app.index('src/browser/v224-command-dynamics.js'),app.index('src/browser/v225-tactical-motion.js'))
        self.assertIn('src/styles/v225-tactical-motion.css',config['style_modules'])

    def test_v4_animations_reuse_existing_bounded_scheduler(self):
        js=(ROOT/'src/browser/v225-tactical-motion.js').read_text(encoding='utf-8')
        self.assertIn('window.NERV_MOTION.animate',js)
        self.assertIn('window.anime.stagger',js)
        self.assertIn("composition:'replace'",js)
        for forbidden in ('requestAnimationFrame(', 'setInterval(', 'setTimeout(', 'fetch(', 'localStorage.setItem(', 'S.defense.status='):
            self.assertNotIn(forbidden,js)
        self.assertIn("prefers-reduced-motion: reduce",js)
        self.assertIn('document.hidden',js)

    def test_touch_and_approval_are_explicit(self):
        js=(ROOT/'src/browser/v225-tactical-motion.js').read_text(encoding='utf-8')
        css=(ROOT/'src/styles/v225-tactical-motion.css').read_text(encoding='utf-8')
        self.assertIn('実行は別途承認',js)
        self.assertIn('window.NERV_MOBILE.open',js)
        self.assertNotIn("consoleBattleCommand(",js)
        self.assertNotIn("consoleMagiCommand(",js)
        self.assertIn('min-height:46px',css)
        self.assertIn('@media(prefers-reduced-motion:reduce)',css)

if __name__=='__main__':
    unittest.main()
