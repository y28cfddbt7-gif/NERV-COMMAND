"""v2.33 — tested home escape and real city action wiring."""
import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class CityCommandTests(unittest.TestCase):
 def test_build_order(self):
  c=json.loads((ROOT/'src/build.json').read_text())
  self.assertEqual(c['version'],'3.0.2')
  mods=c['browser_modules']
  self.assertGreater(mods.index('src/browser/v233-city-commands.js'),mods.index('src/browser/v232-five-station.js'))
  self.assertIn('src/styles/v233-navigation-city.css',c['style_modules'])
 def test_navigation_restored_without_new_route_engine(self):
  css=(ROOT/'src/styles/v233-navigation-city.css').read_text()
  for marker in ('body.battle-active .bottom-nav','body.console-magi-active .bottom-nav',
    'display:grid!important','+ 42px','bottom-nav [data-nav="home"]',
    '#shell .v232-task-nav{top:','padding-bottom:calc(76px'):
   self.assertIn(marker,css)
  js=(ROOT/'src/browser/v233-city-commands.js').read_text()
  self.assertIn(".bottom-nav [data-nav=\\\"home\\\"]".replace('\\\"','"'),js)
  self.assertNotIn("window.NERV_MOBILE.open('home')",js)
  nav=(ROOT/'src/browser/navigation.js').read_text()
  self.assertIn("all('[data-nav]').forEach",nav)
 def test_real_operations_and_resource_gates(self):
  js=(ROOT/'src/browser/v233-city-commands.js').read_text()
  for marker in ('id="v233CityControl"' if False else "root.id='v233CityControl'",
   'v27Armor','v27Turret','v27Repair','v27Power','powerToggle','commsToggle','infraDiag',
   'd.energy>=12','d.parts>=20','d.parts>=18','d.spares>0','v27Power','source.click()',
   'stateBefore()','d?.selected','defense.authority' if False else 'DEFENSE AUTHORITY'):
   self.assertIn(marker,js)
  original=(ROOT/'src/browser/city-defense.js').read_text()
  for marker in ('function v27Armor(){','function v27Turret(){','function v27Repair(){','function v27Power(){'):
   self.assertIn(marker,original)
  infra=(ROOT/'src/browser/infrastructure.js').read_text()
  self.assertIn("$(key+'Toggle').addEventListener",infra)
  self.assertIn("$('infraDiag').addEventListener",infra)
 def test_no_source_art_mutations_or_new_background_loops(self):
  src=(ROOT/'src/browser/v233-city-commands.js').read_text()
  for forbidden in ('requestAnimationFrame(', 'setInterval(', 'setTimeout(', 'fetch(', 'localStorage.setItem(',
    'S.defense=', 'S.evas=', 'S.infra.power=', 'S.defense.energy-='):
   self.assertNotIn(forbidden,src)
  css=(ROOT/'src/styles/v233-navigation-city.css').read_text()
  self.assertNotIn('image-rendering:pixelated',css)
  self.assertNotIn('filter:blur(',css)
if __name__=='__main__':unittest.main()
