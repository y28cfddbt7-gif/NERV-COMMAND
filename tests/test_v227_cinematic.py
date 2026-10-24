"""v2.27 safe-area and visible cinematic station invariants."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

class CinematicStationsTests(unittest.TestCase):
    def test_modules_version_pinned(self):
        cfg=json.loads((ROOT/'src/build.json').read_text())
        self.assertEqual(cfg['version'],'2.32')
        js=cfg['browser_modules']
        self.assertLess(js.index('src/browser/v2261-audio-recovery.js'),js.index('src/browser/v227-cinematic-stations.js'))
        self.assertIn('src/styles/v227-cinematic-stations.css',cfg['style_modules'])

    def test_native_coverage_is_reserved_for_all_pages(self):
        css=(ROOT/'src/styles/v227-cinematic-stations.css').read_text()
        for marker in ('--v227-native-guard:76px','#shell.shell:not(.hidden)','padding-top:var(--v227-native-guard)!important',
            '#shell .mobile-tabs','top:var(--v227-native-guard)!important','#v226AlertStrip{top:var(--v227-native-guard)!important',
            '.mobile-tabs button{min-height:48px!important'):
            self.assertIn(marker,css)
        self.assertIn('web.present(true)',(ROOT/'src/scriptable/webview.js').read_text())

    def test_art_lives_under_unhittable_visual_overlays(self):
        css=(ROOT/'src/styles/v227-cinematic-stations.css').read_text()
        self.assertIn('.v227-overlay{position:absolute;',css)
        self.assertIn('pointer-events:none',css)
        self.assertIn('body[data-page="magi"] .v226-station[data-station="magi"]{display:none!important}',css)
        js=(ROOT/'src/browser/v227-cinematic-stations.js').read_text()
        for marker in ('consoleMagiBoard','tokyoCityCanvas','battleStage','v227SignalRack','v227CityOverlay',
          's.d.enemy?.lane','s.d.enemy?.dist','window.NERV_MOTION.animate','window.anime.stagger','reduced-motion: reduce',
          "document.hidden", "window.NERV_CINEMATIC"):
            if marker=='reduced-motion: reduce':continue
            self.assertIn(marker,js)
        for forbidden in ('requestAnimationFrame(', 'setTimeout(', 'setInterval(', 'fetch(', 'localStorage.setItem(',
                'consoleBattleCommand(', 'consoleMagiCommand(', '.drawImage(', 'S.defense.status='):
            self.assertNotIn(forbidden,js)

    def test_user_motion_preference_disables_background_radar(self):
        css=(ROOT/'src/styles/v227-cinematic-stations.css').read_text()
        for marker in ('@media(prefers-reduced-motion:reduce)',
            'body[data-v224-motion=off] #v227CityOverlay:before',
            'body[data-v224-motion=off] #v227MagiOverlay .v227-pulse'):
            self.assertIn(marker,css)

if __name__=='__main__':unittest.main()
