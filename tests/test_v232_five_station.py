"""v2.32 safeguards: real functional UI, no redundant subpanels or degraded art."""
import json,hashlib,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class FiveStationTests(unittest.TestCase):
 def test_v232_manifest(self):
  c=json.loads((ROOT/'src/build.json').read_text(encoding='utf-8'))
  self.assertEqual(c['version'],'3.0.2')
  m=c['browser_modules']
  self.assertLess(m.index('src/browser/v232-boot.js'),m.index('src/browser/v226-context-stations.js'))
  self.assertGreater(m.index('src/browser/v232-five-station.js'),m.index('src/browser/v231-unified-workstation.js'))
  self.assertIn('src/styles/v232-five-station.css',c['style_modules'])
 def test_original_art_and_original_city_atlas(self):
  city=(ROOT/'src/browser/v218-city-art.js').read_text()
  self.assertIn("if(mode==='map'&&!window.NERV_V232_MODE)",city)
  self.assertIn("g.drawImage(image,0,row*height,width,height,dx,dy,dw,dh)",city)
  c=(ROOT/'src/styles/v232-five-station.css').read_text()
  for term in ('.v232-map-window','height:var(--v232-map-height)','width:max(100%,calc(var(--v232-map-height) * 2.3333))',
   'overflow-x:auto','[data-fit=true]','#v227CityOverlay','#operationVisual','#citySystemsVisual'):
   self.assertIn(term,c)
  self.assertNotIn('image-rendering:pixelated',c)
  self.assertNotIn('filter:blur(',c)
 def test_real_original_commands_and_stage_navigation(self):
  s=(ROOT/'src/browser/v232-five-station.js').read_text()
  for marker in ('v232LaunchSteps','01 機体準備','02 出撃審議','03 射出実行','v232CitySummary',
    'v232MapWindow','v232MapToggle','v232SectorGrid' if False else 'v228SectorGrid',
    'v230BattleToolbar' if False else 'v232BattlePhase',
    'window.NERV_MOBILE.open(page,v)','optional(', 'v232MapTools',
    "window.NERV_V232={snapshot:"):
   self.assertIn(marker,s)
  js=(ROOT/'src/browser/v230-compact-battle.js').read_text()
  self.assertIn("consoleBattleCommand('mode',{mode:'attack'})",js)
  legacy=(ROOT/'src/browser/v219-console-engine.js').read_text()
  self.assertIn("window.NERV_GAME_V229?.beforeNext()",legacy)
  self.assertIn("consoleEnemyTurn()",legacy)
 def test_no_new_mutation_or_background_loops(self):
  s=(ROOT/'src/browser/v232-five-station.js').read_text()
  for forbidden in ('requestAnimationFrame(', 'setTimeout(', 'setInterval(', 'fetch(',
   'localStorage.setItem(', 'commandOperation(', 'S.defense=', 'S.evas=', 'window.NERV_SORTIE_HOOK.finalize('):
   self.assertNotIn(forbidden,s)
  self.assertIn("document",s)
  self.assertIn('pointer', (ROOT/'src/styles/v232-five-station.css').read_text())
 def test_only_two_task_tabs_plus_advanced_disclosure(self):
  s=(ROOT/'src/browser/v232-five-station.js').read_text()
  self.assertIn(".slice(0,2)",s)
  self.assertIn("const more=create('details','v232-more')",s)
  css=(ROOT/'src/styles/v232-five-station.css').read_text()
  self.assertIn('.v232-more summary',css)
  self.assertIn('.v232-menu-choices button',css)
  self.assertIn('#shell .page.active>.mobile-tabs{display:none!important}',css)
  self.assertIn('[data-view=engage][data-v230-mode=precision] #battleStage',css)
  self.assertIn('[data-view=engage][data-v230-mode=command] .v228-sector-grid',css)
if __name__=='__main__':unittest.main()
