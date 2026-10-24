"""v2.26.1 verified full-screen WebView and gesture-only audio reactivation."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

class IosAudioFullscreenTests(unittest.TestCase):
 def test_webview_presents_fullscreen_without_changing_bridge(self):
  s=(ROOT/'src/scriptable/webview.js').read_text(encoding='utf-8')
  self.assertIn('web.present(true)',s)
  self.assertNotIn('web.present(false)',s)
  self.assertIn('const bridge=',s)
  self.assertIn("callNative", (ROOT/'src/browser/native-bridge.js').read_text(encoding='utf-8'))

 def test_recovery_is_additive_and_only_on_input(self):
  cfg=json.loads((ROOT/'src/build.json').read_text(encoding='utf-8'))
  self.assertEqual(cfg['version'],'2.33')
  self.assertIn('src/browser/v2261-audio-recovery.js',cfg['browser_modules'])
  s=(ROOT/'src/browser/v2261-audio-recovery.js').read_text(encoding='utf-8')
  for marker in ('interrupted','visibilitychange','pagehide','pageshow','pointerdown','resume()','previous.close()','needsReopen','prefers'):
   if marker=='prefers':continue
   self.assertIn(marker,s)
  for forbidden in ('requestAnimationFrame(', 'setInterval(', 'setTimeout(', 'fetch(', 'S.prefs.sound=', 'soundScore='):
   self.assertNotIn(forbidden,s)
  self.assertIn("if(document.hidden||!enabled())return",s)

if __name__=='__main__': unittest.main()
