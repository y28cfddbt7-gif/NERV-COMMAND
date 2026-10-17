"""Command launcher, large simulated alerts, motion preferences and real Web Audio."""
import unittest
from browser_support import BrowserCase, RESULTS


class TerminalTests(BrowserCase):
    def test_home_contains_only_seven_navigation_buttons(self):
        self.load()
        self.assertEqual(self.page.locator('#commandLauncher .command-tile').count(), 7)
        self.assertEqual(self.page.locator('.staff-home h1, .staff-home section, .staff-home details, .staff-home .command-core').count(), 0)
        self.assertEqual(self.page.locator('.staff-home > :not(nav)').count(), 0)
        self.assertFalse(self.page.locator('.sys-header').is_visible())
        for page in ['weather','infra','eva','mission','magi','tools','settings']:
            self.open('home')
            button=self.page.locator(f'#commandLauncher [data-open="{page}"]')
            self.assertGreaterEqual(button.bounding_box()['height'],44)
            button.click()
            self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),page)
        self.open('home')
        self.page.screenshot(path=str(RESULTS/'staff-home-390.png'),full_page=True)

    def test_large_alert_tracks_real_game_state_and_routes_without_clearing_it(self):
        self.load()
        panel = self.page.locator('#commandAlert')
        self.assertFalse(panel.is_visible())
        self.view('infra','systems')
        self.page.locator('#powerToggle').click()
        self.assertTrue(panel.is_visible())
        self.assertEqual(panel.get_attribute('data-level'), 'critical')
        self.assertEqual(self.page.locator('#commandAlertTitle').inner_text(), '主電源停止')
        self.assertIn('架空の訓練警報', panel.inner_text())
        self.assertGreaterEqual(panel.bounding_box()['height'], 140)
        self.assertGreaterEqual(float(self.page.locator('#commandAlertTitle').evaluate('(e)=>getComputedStyle(e).fontSize').replace('px','')), 24)
        self.open('settings')
        self.assertTrue(panel.is_visible())
        self.page.locator('#commandAlertOpen').click()
        self.assertTrue(self.page.locator('#alertReview').is_visible())
        self.page.locator('#alertTarget').click()
        self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'), 'infra')
        self.assertFalse(self.state()['infra']['power'])
        self.page.screenshot(path=str(RESULTS / 'command-critical-390.png'), full_page=True)
        self.page.locator('#powerToggle').click()
        self.assertFalse(panel.is_visible())
        self.defense('detect')
        self.assertEqual(panel.get_attribute('data-level'), 'watch')
        self.assertIn('敵性反応', self.page.locator('#commandAlertTitle').inner_text())
        self.open('home')
        self.assertIn('都市防衛中', self.page.locator('#launcherInfra').inner_text())
        self.assertEqual(self.state()['defense']['round'], 0)
        self.page.screenshot(path=str(RESULTS / 'command-hostile-390.png'), full_page=True)

    def test_critical_priority_for_comms_and_eva_power_loss(self):
        self.load({'infra':{'comms':False}, 'evas':[
            {'state':'POWER_LOST','sync':70,'power':0,'at':False},
            {'state':'HANGAR','sync':80,'power':300,'at':False},
            {'state':'HANGAR','sync':75,'power':300,'at':False}]})
        self.assertEqual(self.page.locator('#commandAlertTitle').inner_text(), '通信回線断')
        self.view('infra','systems')
        self.page.locator('#commsToggle').click()
        self.assertEqual(self.page.locator('#commandAlertTitle').inner_text(), 'EVA 電源喪失')
        self.page.locator('#commandAlertOpen').click()
        self.page.locator('#alertTarget').click()
        self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'), 'eva')
        self.assertEqual(self.state()['evas'][0]['state'], 'POWER_LOST')

    def test_launcher_weather_does_not_invent_missing_measurements(self):
        self.load()
        self.assertEqual(self.page.locator('#launcherWeather').inner_text(), '気象データ未取得')
        self.page.evaluate("window.NERV_TEST.weather({weather:{current:{},hourly:{}},place:'TEST',updated:Date.now()})")
        self.open('home')
        self.assertEqual(self.page.locator('#launcherWeather').inner_text(), '保存気象 --° / TEST')

    def test_motion_preferences_stop_new_animations(self):
        self.load()
        self.assertFalse(self.page.locator('.terminal-ambient').is_visible())
        self.assertFalse(self.page.locator('.terminal-ambient').is_visible())
        self.page.emulate_media(reduced_motion='no-preference')
        self.assertNotEqual(self.page.locator('.ambient-scan').evaluate('(e)=>getComputedStyle(e).animationName'), 'none')
        self.open('settings')
        self.page.locator('#motionSwitch').click()
        self.assertFalse(self.state()['prefs']['motion'])
        self.open('home')
        self.assertFalse(self.page.locator('.terminal-ambient').is_visible())
        self.assertFalse(self.page.locator('.terminal-ambient').is_visible())
        self.assertEqual(self.page.locator('.page.active').evaluate('(e)=>getComputedStyle(e).animationName'), 'none')

    def test_sound_is_opt_in_layered_bounded_mutable_and_persisted(self):
        # Instrument the real browser audio implementation, without replacing it.
        self.page.add_init_script('''(() => {
          window.audioEvents=[];
          const C=window.AudioContext||window.webkitAudioContext;
          const create=C.prototype.createOscillator;
          C.prototype.createOscillator=function(){
            const o=create.call(this),start=o.start.bind(o),stop=o.stop.bind(o);
            o.start=(...args)=>{window.audioEvents.push({action:'start',wave:o.type});return start(...args)};
            o.stop=(...args)=>{window.audioEvents.push({action:'stop',now:!args.length});return stop(...args)};
            return o;
          };
        })();''')
        self.load()
        self.open('settings')
        self.page.locator('#soundPreview').click()
        self.assertEqual(self.page.evaluate('audioEvents.length'), 0)
        self.page.locator('#soundSwitch').click()
        self.page.locator('#soundPreview').click()
        self.assertGreaterEqual(self.page.evaluate('audioEvents.filter(e=>e.action==="start").length'), 4)
        self.assertGreaterEqual(self.page.evaluate('new Set(audioEvents.filter(e=>e.action==="start").map(e=>e.wave)).size'), 2)
        self.page.locator('#soundVolume').fill('25')
        self.assertEqual(self.state()['prefs']['soundVolume'], 25)
        self.assertEqual(self.page.locator('#soundVolumeValue').inner_text(), '25%')
        self.page.locator('#soundSwitch').click()
        self.assertFalse(self.state()['prefs']['sound'])
        before = self.page.evaluate('audioEvents.filter(e=>e.action==="start").length')
        self.page.locator('#soundPreview').click()
        self.view('infra','systems')
        self.page.locator('#powerToggle').click()
        self.assertEqual(self.page.evaluate('audioEvents.filter(e=>e.action==="start").length'), before)
        self.save_and_reload()
        self.assertEqual(self.state()['prefs']['soundVolume'], 25)
        self.assertFalse(self.state()['prefs']['sound'])

    def test_same_alert_redraw_does_not_replay_alarm(self):
        self.load()
        self.open('settings')
        self.page.locator('#soundSwitch').click()
        self.view('infra','systems')
        self.page.locator('#powerToggle').click()
        self.assertEqual(self.page.locator('#commandAlertTitle').inner_text(), '主電源停止')
        # Repeated navigation re-renders alerts. It must not produce another alarm.
        self.page.evaluate('''() => {window.alarmSawCount=0;const p=(window.AudioContext||window.webkitAudioContext).prototype;
          const old=p.createOscillator;p.createOscillator=function(){const o=old.call(this),start=o.start.bind(o);
          o.start=(...a)=>{if(o.type==='sawtooth')window.alarmSawCount++;return start(...a)};return o;};}''')
        self.page.wait_for_timeout(1500)
        self.open('home')
        self.open('settings')
        self.view('infra','systems')
        self.assertEqual(self.page.evaluate('alarmSawCount'), 0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
