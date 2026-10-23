"""v2.28 tactical UI and saved launch gameplay invariants."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

class SortieTacticalTests(unittest.TestCase):
 def test_version_and_order(self):
  c=json.loads((ROOT/'src/build.json').read_text(encoding='utf-8'))
  self.assertEqual(c['version'],'2.31')
  self.assertGreater(c['browser_modules'].index('src/browser/v228-sortie-tactics.js'),c['browser_modules'].index('src/browser/v219-console-engine.js'))
  self.assertIn('src/styles/v228-sortie-tactics.css',c['style_modules'])

 def test_deployment_uses_atomic_existing_command_transaction(self):
  code=(ROOT/'src/browser/v219-console-engine.js').read_text(encoding='utf-8')
  self.assertIn("window.NERV_SORTIE_HOOK.finalize(b,t,e)",code)
  self.assertIn("if(window.NERV_SORTIE_HOOK)",code)
  self.assertIn("commandOperation(()=>",code)
  self.assertIn("b.ap=2;if(window.NERV_SORTIE_HOOK)",code)

 def test_tactical_commands_are_real_reducer_calls(self):
  js=(ROOT/'src/browser/v228-sortie-tactics.js').read_text(encoding='utf-8')
  for marker in ("data-v228-sector", "battleCommand('move',{col,row})", "battleCommand('guard')",
                 "battleCommand('support')", "consoleBattleCommand(action,payload)",
                 "tacticalThreat(t)", "t.enemyPlan", "consoleRoot(true)", "plan", "caseNo",
                 "window.NERV_MOTION.animate", "window.anime.stagger", "applied=true"):
   if marker=="applied=true": marker="p.applied=true"
   self.assertIn(marker,js)
  for marker in ("requestAnimationFrame(", "setTimeout(", "setInterval(", "fetch(", "localStorage.setItem("):
   self.assertNotIn(marker,js)

 def test_map_is_actual_3x3_not_fake_extended_engine(self):
  js=(ROOT/'src/browser/v228-sortie-tactics.js').read_text(encoding='utf-8')
  self.assertIn("[1,2,3].flatMap(row=>[0,1,2].map(col=>",js)
  self.assertIn("Math.max(Math.abs(col-t.pos.col),Math.abs(row-t.pos.row))===1",js)
  self.assertIn("b.ap<1",js)
  css=(ROOT/'src/styles/v228-sortie-tactics.css').read_text(encoding='utf-8')
  self.assertIn("min-height:98px",css)
  self.assertIn(".battle-page .tactical-stage{height:clamp(345px,53vh,530px)",css)

if __name__=='__main__': unittest.main()
