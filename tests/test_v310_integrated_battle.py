"""v3.1 integration: no mandatory route detour for any critical tactical choice."""
import json
import unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]

class IntegratedBattleTests(unittest.TestCase):
 def test_manifest_and_version(self):
  c=json.loads((R/'src/build.json').read_text())
  self.assertEqual(c['version'],'3.2.3')
  m=c['browser_modules']
  self.assertGreater(m.index('src/browser/v310-operation-surface.js'),m.index('src/browser/v301-comms-ui.js'))
  self.assertIn('src/styles/v310-operation-surface.css',c['style_modules'])
  self.assertEqual(c['style_modules'][-2],'src/styles/v310-operation-surface.css')
  self.assertEqual(c['style_modules'][-1],'src/styles/v315-operator-ui.css')

 def test_same_screen_real_actions(self):
  s=(R/'src/browser/v310-operation-surface.js').read_text()
  for marker in (
    "page=document.querySelector('.page[data-page=\"battle\"]')",
    "station.id='v310Operations'",
    "q('v310SmartActions')",
    "kernel.read()", "radio.read()",
    "dispatch(kernel,'analysis.request')", "dispatch(kernel,'city.shutter.request'",
    "dispatch(kernel,'city.shutter.review'", "dispatch(kernel,'city.shutter.execute'",
    "dispatch(kernel,'city.shutter.release'",
    "dispatch(radio,'comms.request'", "dispatch(radio,'comms.reply'",
    "dispatch(radio,'comms.acknowledge'", "dispatch(radio,'comms.flush'",
    "['v233CityControl','v310CitySlot']",
    "['v300Operations','v310OrdersSlot']",
    "['v301Radio','v310RadioSlot']",
    "['v229CombatOrders','v310TacticalSlot']",
    "window.NERV_MOBILE.open('battle',view)",
    "window.NERV_MOBILE.open('home')",
    "consoleBattleCommand('mode',{mode:'move'})",
    "data-v310-action=\"wait\"",
    "window.NERV_V310={snapshot:"):
   self.assertIn(marker,s)
  for forbidden in (
    "NERV_MOBILE.open('messages'", "NERV_MOBILE.open('infra'", "NERV_MOBILE.open('magi'",
    "go('messages')","go('infra')","go('magi')",
    "setTimeout(","setInterval(","requestAnimationFrame(","fetch(","localStorage.setItem("):
   self.assertNotIn(forbidden,s)

 def test_main_map_and_accessible_ops(self):
  c=(R/'src/styles/v310-operation-surface.css').read_text()
  for marker in (
    "height:clamp(310px,51dvh,570px)",
    "height:clamp(315px,51dvh,570px)",
    "max-height:min(37dvh,315px)",
    ".v310-sheet-scroll",
    "#v310Actions button",
    "min-height:52px",
    "min-height:44px",
    "grid-template-columns:repeat(2,minmax(0,1fr))",
    "env(safe-area-inset-bottom",
    "button[hidden]{display:none!important}"):
   self.assertIn(marker,c)
  self.assertNotIn("image-rendering:pixelated",c)
  self.assertNotIn("filter:blur(",c)

 def test_same_resource_and_case(self):
  conf=json.loads((R/'src/build.json').read_text())
  for keep in (
    "src/browser/v219-console-engine.js", "src/browser/v217-tactical-engine.js",
    "src/browser/v229-gameplay.js", "src/browser/city-defense.js",
    "src/browser/v300-command-kernel.js", "src/browser/v301-operational-comms.js",
    "src/browser/v2261-audio-recovery.js",
    "src/browser/v215-motion.js"):
   self.assertIn(keep,conf['browser_modules'])
  s=(R/'src/browser/v310-operation-surface.js').read_text()
  for mutation in ("S.defense.energy=", "S.defense.parts=", "S.evas=", "S.commandV3=",
       "commandOperation(", "v27Armor(", "v27Scan("):
   self.assertNotIn(mutation,s)
  self.assertIn("expectedRevision:p.revision",s)
  self.assertIn("openAlertReview('end')",s)
  self.assertIn("id=\"v310Recovery\"",s)
  self.assertIn("actorId:'operator-C3'",s)

if __name__=='__main__':
 unittest.main()
