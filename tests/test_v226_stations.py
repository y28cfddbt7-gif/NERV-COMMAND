"""v2.26 contextual station invariants: bounded motion and protected screens."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

class StationTests(unittest.TestCase):
    def test_version_and_module_order(self):
        cfg=json.loads((ROOT/'src/build.json').read_text(encoding='utf-8'))
        self.assertEqual(cfg['version'],'2.33')
        a=cfg['browser_modules']
        self.assertLess(a.index('src/browser/v225-tactical-motion.js'),a.index('src/browser/v226-context-stations.js'))
        self.assertIn('src/styles/v226-context-stations.css',cfg['style_modules'])

    def test_battle_only_tactical_panels(self):
        prior=(ROOT/'src/browser/v224-command-dynamics.js').read_text(encoding='utf-8')
        now=(ROOT/'src/browser/v225-tactical-motion.js').read_text(encoding='utf-8')
        self.assertIn("if(page!=='battle')return null;",prior)
        self.assertIn("document.createElement('details')",prior)
        self.assertIn("currentPage==='battle'",now)
        self.assertIn("if(!owner){panel.remove();return false;}",now)

    def test_workstations_do_not_mutate_simulation(self):
        js=(ROOT/'src/browser/v226-context-stations.js').read_text(encoding='utf-8')
        for marker in ('infra:{','magi:{','messages:{','eva:{','window.NERV_MOTION.animate','window.NERV_MOTION.tween','terminalAlert()','nerv-route','prefers-reduced-motion: reduce'):
            self.assertIn(marker,js)
        for forbidden in ('requestAnimationFrame(', 'setTimeout(', 'setInterval(', 'fetch(', 'localStorage.setItem(', 'consoleBattleCommand(', 'consoleMagiCommand(', 'S.defense.status ='):
            self.assertNotIn(forbidden,js)
        self.assertIn('document.hidden',js)
        css=(ROOT/'src/styles/v226-context-stations.css').read_text(encoding='utf-8')
        self.assertIn('v226-alert-strip[hidden]',css)
        self.assertIn('@media(prefers-reduced-motion:reduce)',css)

if __name__=='__main__': unittest.main()
