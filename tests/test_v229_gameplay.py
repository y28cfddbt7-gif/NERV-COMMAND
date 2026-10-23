"""v2.29 must modify actual state transitions, not add passive choice buttons."""
from pathlib import Path
import json,unittest
ROOT=Path(__file__).resolve().parents[1]

class V229GameTests(unittest.TestCase):
 def test_build_order_and_version(self):
  c=json.loads((ROOT/'src/build.json').read_text(encoding='utf-8'))
  self.assertEqual(c['version'],'2.30')
  mods=c['browser_modules']
  self.assertLess(mods.index('src/browser/v228-sortie-tactics.js'),mods.index('src/browser/v229-gameplay.js'))
  self.assertLess(mods.index('src/browser/v229-gameplay.js'),mods.index('src/browser/v229-gameplay-ui.js'))
  self.assertIn('src/styles/v229-gameplay.css',c['style_modules'])

 def test_real_launch_block_and_orders_in_existing_reducer(self):
  src=(ROOT/'src/browser/v219-console-engine.js').read_text(encoding='utf-8')
  self.assertIn("window.NERV_GAME_V229?.onStart()",src)
  self.assertGreaterEqual(src.count('window.NERV_GAME_V229?.beforeNext()'),2)
  for key in ('recon:1','feint:1','fortify:1',"window.NERV_GAME_V229.action(action,b)","consoleEnemyTurn();b.ap=2"):
   self.assertIn(key,src)
  self.assertIn('commandOperation(()=>',src)

 def test_decision_is_real_and_old_saves_not_forced(self):
  src=(ROOT/'src/browser/v229-gameplay.js').read_text(encoding='utf-8')
  for key in ('incidentV229','d.energy-=n','e.tacticalIntegrity','d.enemy.dist','e.sync','d.scans',
    "if(p?.status==='pending')throw","t.enemyPlan=tacticalPlan(t)",
    "t.v229Decoy","t.guardUntil=d.round+1","consoleRecord('sortie'"):
   self.assertIn(key,src)
  self.assertIn("if(!t?.v229Enabled||S.defense.status!=='active')return base",src)
  for forbidden in ('requestAnimationFrame(', 'setTimeout(', 'setInterval(', 'fetch(', 'localStorage.setItem('):
   self.assertNotIn(forbidden,src)

 def test_old_buttons_retained_but_collapsed_on_new_cases(self):
  s=(ROOT/'src/browser/v229-gameplay-ui.js').read_text(encoding='utf-8')
  self.assertIn("legacy.append(old)",s)
  self.assertIn('legacy.hidden=false;',s)
  self.assertIn("api.resolve(value)",s)
  self.assertIn("consoleBattleCommand(key)",s)
  self.assertIn('role="status"',s)
  css=(ROOT/'src/styles/v229-gameplay.css').read_text(encoding='utf-8')
  self.assertIn("min-height:66px",css)

if __name__=='__main__':unittest.main()
