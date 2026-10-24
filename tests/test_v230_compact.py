"""v2.30 compact combat UI does not delete functioning game actions."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class CompactBattleTests(unittest.TestCase):
 def test_modules_and_version(self):
  c=json.loads((ROOT/'src/build.json').read_text())
  self.assertEqual(c['version'],'3.1.1')
  m=c['browser_modules']
  self.assertGreater(m.index('src/browser/v230-compact-battle.js'),m.index('src/browser/v229-gameplay-ui.js'))
  self.assertIn('src/styles/v230-compact-battle.css',c['style_modules'])

 def test_reducers_and_saved_state_untouched(self):
  s=(ROOT/'src/browser/v230-compact-battle.js').read_text()
  for forbidden in ('commandOperation(', 'localStorage.setItem(', 'requestAnimationFrame(', 'setInterval(', 'setTimeout(', 'fetch(', 'S.defense=', 'S.operatorConsole='):
   self.assertNotIn(forbidden,s)
  self.assertIn("consoleBattleCommand('wait')",s)
  self.assertIn("window.NERV_MOTION?.animate?.",s)
  self.assertIn("state.mode='command'",s)
  self.assertIn("window.NERV_COMPACT_BATTLE",s)

 def test_two_modes_with_operable_command_map(self):
  s=(ROOT/'src/browser/v230-compact-battle.js').read_text()
  css=(ROOT/'src/styles/v230-compact-battle.css').read_text()
  for mark in ('data-v230-mode="command"','data-v230-mode="precision"','data-v230-action="wait"',
               "state.mode=next","aria-pressed"):
   self.assertIn(mark,s)
  for mark in ('data-v230-mode="command"] #battleStage','data-v230-mode="command"] #consoleBattleModes',
               'data-v230-mode="precision"] .v228-field','min-height:66px','min-height:47px'):
   self.assertIn(mark,css)
  self.assertIn("battleCommand('move',{col,row})",(ROOT/'src/browser/v228-sortie-tactics.js').read_text())
  self.assertIn("consoleBattleCommand(key)",(ROOT/'src/browser/v229-gameplay-ui.js').read_text())

 def test_optional_panels_and_incident_rows(self):
  s=(ROOT/'src/browser/v230-compact-battle.js').read_text()
  css=(ROOT/'src/styles/v230-compact-battle.css').read_text()
  self.assertIn("v230VoteDetails",s)
  self.assertIn("v230MotionToggle",s)
  self.assertIn("v226DataLink",s)
  self.assertIn("grid-template-columns:repeat(3,minmax(0,1fr))",css)
  self.assertIn('.v229-sortie[data-state="resolved"] .v229-decisions',css)
  self.assertIn('#v225Ops{display:none!important}',css)
  source=(ROOT/'src/browser/v229-gameplay-ui.js').read_text()
  self.assertIn("legacy.hidden=false;",source)
  self.assertNotIn("if(!p&&!legacy.open)legacy.open=true",source)

if __name__=='__main__':unittest.main()
