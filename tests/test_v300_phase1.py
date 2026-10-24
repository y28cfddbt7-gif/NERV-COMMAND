"""v3.0 phase 1: shell and command kernel integration, preserve v2.33 games and art."""
import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class V300KernelTests(unittest.TestCase):
 def test_order_and_version(self):
  c=json.loads((ROOT/'src/build.json').read_text())
  self.assertEqual(c['version'],'3.1.1')
  m=c['browser_modules'];s=c['style_modules']
  self.assertGreater(m.index('src/browser/v300-command-kernel.js'),m.index('src/browser/v233-city-commands.js'))
  self.assertGreater(m.index('src/browser/v300-operations-desk.js'),m.index('src/browser/v300-command-kernel.js'))
  self.assertIn('src/styles/v300-operations.css',s)
 def test_commands_not_fake(self):
  src=(ROOT/'src/browser/v300-command-kernel.js').read_text()
  for v in ("commandOperation(","v27Armor()","v27Scan()","root(false)","expectedRevision",
    "order.authorized","order.requested","facility.shutter.closed","facility.shutter.opened",
    "analysis.completed","radio(k,","window.NERV_COMMAND_V3","tacticalFireErrors=function()"):
   self.assertIn(v,src)
  for forbidden in ('setInterval(', 'setTimeout(', 'requestAnimationFrame(', 'fetch(', 'localStorage.setItem(',
      "S.evas=", 'S.defense.energy-=12','data:image/png;base64'):
   self.assertNotIn(forbidden,src)
 def test_preserves_real_game_and_messages(self):
  c=json.loads((ROOT/'src/build.json').read_text())
  for v in ('src/browser/v219-console-engine.js','src/browser/v229-gameplay.js',
     'src/browser/v217-tactical-engine.js','src/browser/v212-messages.js',
     'src/browser/duty-dispatch.js','src/browser/v2261-audio-recovery.js'):
   self.assertIn(v,c['browser_modules'])
  assert c['assets']['assets/eva_unit_01_painted.webp']=='image/webp'
 def test_ui_is_a_small_optional_workflow(self):
  src=(ROOT/'src/browser/v300-operations-desk.js').read_text()
  self.assertIn("panel.id='v300Operations'",src)
  self.assertIn('<details id="v300Workflow">',src)
  self.assertIn("prev.after(panel)",src)
  self.assertIn("api.dispatch(",src)
  self.assertIn("window.NERV_MOBILE.open('messages','contacts')",src)
  self.assertIn("source.click()" if False else "expectedRevision:p.revision",src)
if __name__=='__main__':unittest.main()
