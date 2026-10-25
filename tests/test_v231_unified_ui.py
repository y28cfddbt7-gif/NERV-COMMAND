"""v2.31 contract: one canonical top bar, no stacked data slabs, all gameplay remains."""
from pathlib import Path
import json,unittest
ROOT=Path(__file__).resolve().parents[1]

class V231UnifiedUITests(unittest.TestCase):
 def test_modules_and_version(self):
  c=json.loads((ROOT/'src/build.json').read_text())
  self.assertEqual(c['version'],'3.2.0')
  b=c['browser_modules']
  self.assertGreater(b.index('src/browser/v231-unified-workstation.js'),b.index('src/browser/v230-compact-battle.js'))
  self.assertIn('src/styles/v231-unified-workstation.css',c['style_modules'])
 def test_no_gameplay_save_or_audio_mutation(self):
  js=(ROOT/'src/browser/v231-unified-workstation.js').read_text()
  for bad in ('commandOperation(', 'consoleBattleCommand(', 'requestAnimationFrame(', 'setTimeout(',
       'setInterval(', 'fetch(', 'localStorage.setItem(', 'S.defense=', 'S.operatorConsole=', 'new Audio('):
   self.assertNotIn(bad,js)
  for good in ("const slot=host?.querySelector(':scope > div')", "slot.append(bar)", "v231StatusRail",
               "v231Facilities","station.after(rack)","window.NERV_UNIFIED_UI", "window.NERV_MOBILE.open(page,view)"):
   self.assertIn(good,js)
 def test_hide_only_redundant_visual_summaries(self):
  css=(ROOT/'src/styles/v231-unified-workstation.css').read_text()
  for redundant in ('#shell .v226-station',' #v225Ops','#shell #v226DataLink','#shell #v230MotionToggle',
                    '#shell #v227MagiBus','#shell .battle-page #consoleBattleFlow'):
   self.assertIn(redundant.strip(),css)
  for active in ("#consoleToMap", "#consoleTargets summary", "min-height:64px", "#consoleMagiBoard svg",
                  "#v27IsoMap", "#v227SignalRack.v231-comms-rack", ".v229-decisions button"):
   self.assertIn(active,css)
  self.assertNotIn("#shell #battleTactics{display:none",css)
  self.assertNotIn("#shell #battleTacticalCanvas{display:none",css)
  self.assertNotIn("#shell #tacticalFire{display:none",css)
 def test_unchanged_existing_reducers_and_audio_sources(self):
  cfg=json.loads((ROOT/'src/build.json').read_text())
  self.assertIn('src/browser/v229-gameplay.js',cfg['browser_modules'])
  self.assertIn('src/browser/v2261-audio-recovery.js',cfg['browser_modules'])
  self.assertIn('src/browser/v227-cinematic-stations.js',cfg['browser_modules'])
  self.assertIn('src/browser/v219-battle-ui.js',cfg['browser_modules'])
  self.assertIn('src/browser/v219-magi-ui.js',cfg['browser_modules'])
if __name__=='__main__':unittest.main()
