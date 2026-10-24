"""NERV 3.0 Phase 2: integrated formal radio, not personal chat, original art intact."""
import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class PhaseTwoRadioTests(unittest.TestCase):
 def test_module_order_and_version(self):
  c=json.loads((ROOT/'src/build.json').read_text())
  self.assertEqual(c['version'],'3.1.2')
  mods=c['browser_modules']
  self.assertGreater(mods.index('src/browser/v301-operational-comms.js'),mods.index('src/browser/v300-command-kernel.js'))
  self.assertGreater(mods.index('src/browser/v301-comms-ui.js'),mods.index('src/browser/v301-operational-comms.js'))
  self.assertIn('src/styles/v301-operations-radio.css',c['style_modules'])
 def test_transactions_and_schema_compatibility(self):
  s=(ROOT/'src/browser/v301-operational-comms.js').read_text()
  for x in ('state(create=false)','comms.request','comms.reply','comms.acknowledge','comms.flush',
    'commandOperation(', 'expectedRevision', 'commandId','transmissions','links','read:false',
    "S.infra.comms?'awaiting_reply':'queued'",'same','worldCommunication('):
   if x=='same':continue
   self.assertIn(x,s)
  for x in ('setInterval(', 'setTimeout(', 'requestAnimationFrame(', 'localStorage.setItem(', 'fetch(', 'new Audio('):
   self.assertNotIn(x,s)
  self.assertIn('schema:1',s)
  self.assertIn('window.NERV_OPS_COMMS=',s)
 def test_private_chat_isolation_and_role_protocol(self):
  s=(ROOT/'src/browser/v301-operational-comms.js').read_text()
  for name in ('hyuga','maya','aoba','ritsuko','misato','rei','shinji','asuka'):
   self.assertIn(name+':{',s)
  self.assertIn('topic===\'shutter-safety\'',s)
  self.assertIn("p.unit!==S.tactics?.attacker",s)
  self.assertIn("if(!S.infra.comms)throw Error",s)
  self.assertNotIn('personalSend(',s)
  self.assertNotIn('S.personalMessages=',s)
 def test_real_pilot_link_gates_phase_one(self):
  s=(ROOT/'src/browser/v300-command-kernel.js').read_text()
  self.assertIn('window.NERV_OPS_COMMS',s)
  self.assertIn("x.topic==='shutter-safety'&&x.status==='acknowledged'",s)
  self.assertIn('x.round===S.defense.round',s)
  self.assertIn('x.unit===o.unit',s)
  self.assertIn('v27Armor()',s)
 def test_one_fold_inside_existing_messages_page(self):
  s=(ROOT/'src/browser/v301-comms-ui.js').read_text()
  self.assertIn("mobileSection('messages','contacts')",s)
  self.assertIn('<details id="v301RadioFold">',s)
  self.assertIn('api.dispatch(',s)
  self.assertIn("'comms.flush'",s)
  self.assertIn("'comms.acknowledge'",s)
  self.assertIn('window.NERV_OPS_COMMS_UI=',s)
  self.assertNotIn("mobileGroup('messages'",s)
  css=(ROOT/'src/styles/v301-operations-radio.css').read_text()
  self.assertIn('min-height:46px',css)
  self.assertIn('min-height:52px',css)
 def test_original_sprites_and_work_radio_preserved(self):
  c=json.loads((ROOT/'src/build.json').read_text())
  for file in ('src/browser/v212-messages.js','src/browser/v213-conversation.js',
   'src/browser/duty-dispatch.js','src/browser/v2261-audio-recovery.js','src/browser/v219-console-engine.js'):
   self.assertIn(file,c['browser_modules'])
  self.assertIn('assets/eva_unit_01_painted.webp',c['assets'])
if __name__=='__main__':unittest.main()
