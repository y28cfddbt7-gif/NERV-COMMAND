"""Real Chromium regressions for personnel, dispatch, command routing and sound."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
import unittest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class PersonnelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda e: self.errors.append(str(e)))
        self.page.route('https://**/*', lambda route: route.abort())
        self.old = {'prefs': {'sound': False, 'showBoot': False}, 'ops': {'xp': 250},
                    'infra': {'power': True, 'armor': True, 'comms': True},
                    'tasks': [{'id': 7, 'text': 'Keep existing task', 'done': False}]}
        self.page.add_init_script('''
            window.__toneCount=0;
            class Param { setValueAtTime(){} exponentialRampToValueAtTime(){} }
            class MockAudioContext {
              constructor(){this.state='running';this.currentTime=0;this.destination={};}
              createOscillator(){window.__toneCount++;return {frequency:new Param(),connect(){},start(){},stop(){}};}
              createGain(){return {gain:new Param(),connect(){}};}
              resume(){return Promise.resolve();}
            }
            window.AudioContext=MockAudioContext;
            window.__speech=[];
            Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(x){window.__speech.push(x.text);}}});
            window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
        ''')
        self.page.add_init_script("if(!localStorage.getItem('nerv-command-v2'))localStorage.setItem('nerv-command-v2'," + json.dumps(json.dumps(self.old)) + ');')
        self.page.goto(f'http://127.0.0.1:{self.server.server_port}/', wait_until='domcontentloaded')
        self.page.wait_for_function('Boolean(window.NERV_HQ_TEST)')

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [], 'Unexpected browser exceptions')

    def open(self, page):
        self.page.evaluate('(name)=>window.NERV_TEST.open(name)', page)

    def state(self):
        return self.page.evaluate('window.NERV_TEST.getState()')

    def router(self, category, command):
        self.open('infra')
        self.page.locator('#hqCommandOpen').click()
        self.page.locator(f'[data-hq-category="{category}"]').click()
        self.page.locator(f'[data-hq-command="{command}"]').click()

    def tones(self):
        return self.page.evaluate('window.__toneCount')

    def enable_sound(self):
        self.open('settings')
        self.page.locator('#soundSwitch').click()

    def test_old_save_backup_and_personnel_persistence(self):
        backup = self.page.evaluate("JSON.parse(localStorage.getItem('nerv-command-v2-pre-v28'))")
        self.assertEqual(backup, self.old)
        self.open('tools')
        self.page.locator('#hqName').fill('<img src=x onerror=alert(1)>')
        self.page.locator('#hqDepartment').fill('技術開発部')
        self.page.locator('#hqProfileForm button').click()
        self.page.wait_for_function("JSON.parse(localStorage.getItem('nerv-command-v2')).personnel?.department==='技術開発部'")
        self.page.reload(wait_until='domcontentloaded')
        self.open('tools')
        state = self.state()
        self.assertEqual(state['personnel']['department'], '技術開発部')
        self.assertEqual(state['ops']['xp'], 250)
        self.assertEqual(state['tasks'], self.old['tasks'])
        self.assertTrue(state['infra']['armor'])
        self.assertEqual(self.page.locator('#hqProfileName img').count(), 0)
        self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('nerv-command-v2-pre-v28'))"), self.old)

    def test_id_front_back_close_and_focus(self):
        self.open('tools')
        trigger = self.page.locator('.hq-personnel-brief [data-hq="id"]')
        trigger.click()
        self.assertTrue(self.page.locator('#hqIdDialog').evaluate('(d)=>d.open'))
        self.assertEqual(self.page.locator('#hqIdRank').inner_text(), 'SECTION CHIEF')
        self.page.locator('#hqFlipId').click()
        self.assertTrue(self.page.locator('#hqIdBack').is_visible())
        self.assertFalse(self.page.locator('#hqIdFront').is_visible())
        self.page.keyboard.press('Escape')
        self.assertFalse(self.page.locator('#hqIdDialog').evaluate('(d)=>d.open'))
        self.assertTrue(trigger.evaluate('(b)=>b===document.activeElement'))

    def test_router_never_spends_before_execute_and_uses_original_handler(self):
        before = self.page.evaluate('window.NERV_V27_TEST.snapshot()')
        self.router('recon', 'v27Detect')
        self.assertEqual(self.page.evaluate('window.NERV_V27_TEST.snapshot()'), before)
        self.page.locator('#hqExecute').click()
        after = self.page.evaluate('window.NERV_V27_TEST.snapshot()')
        self.assertEqual(after['status'], 'active')
        self.assertEqual(after['caseNo'], before['caseNo'] + 1)
        self.router('recon', 'v27Scan')
        energy = self.state()['defense']['energy']
        self.page.locator('#hqExecute').click()
        self.assertEqual(self.state()['defense']['energy'], energy - 12)
        self.assertEqual(self.state()['defense']['scans'], 34)

    def test_router_blocks_unavailable_shot_and_empty_repair(self):
        before = self.state()['defense']
        self.router('support', 'v27Shot')
        self.assertTrue(self.page.locator('#hqExecute').is_disabled())
        self.assertIn('迎撃対象がありません', self.page.locator('.hq-command-status').inner_text())
        self.page.locator('#hqActionBack').click()
        self.assertEqual(self.page.locator('[data-hq-command]').count(), 2)
        self.page.locator('#hqActionBack').click()
        self.assertEqual(self.page.locator('[data-hq-category]').count(), 4)
        self.page.locator('[data-hq-category="facility"]').click()
        self.page.locator('[data-hq-command="v27Repair"]').click()
        self.assertTrue(self.page.locator('#hqExecute').is_disabled())
        self.assertEqual(self.state()['defense'], before)

    def test_messages_acknowledge_persist_and_do_not_modify_gameplay(self):
        self.open('tools')
        before = self.state()['defense']
        self.page.locator('[data-hq="radio"]').click()
        self.assertEqual(len(self.state()['personnel']['feed']), 1)
        self.assertEqual(self.page.locator('#hqUnread').inner_text(), '1 NEW')
        self.page.locator('[data-hq-ack="0"]').click()
        self.assertTrue(self.state()['personnel']['feed'][0]['ack'])
        self.assertEqual(self.page.locator('#hqUnread').inner_text(), '0 NEW')
        self.page.wait_for_function("JSON.parse(localStorage.getItem('nerv-command-v2')).personnel?.feed?.[0]?.ack")
        self.page.reload(wait_until='domcontentloaded')
        self.assertTrue(self.state()['personnel']['feed'][0]['ack'])
        self.assertEqual(self.state()['defense'], before)
        for _ in range(15):
            self.page.evaluate("window.NERV_HQ_TEST.receive('broadcast')")
        self.assertEqual(len(self.state()['personnel']['feed']), 12)

    def test_random_timer_and_off_switch(self):
        self.page.clock.install()
        self.page.evaluate('window.NERV_HQ_TEST.schedule()')
        self.page.clock.fast_forward(140001)
        self.assertEqual(len(self.state()['personnel']['feed']), 1)
        self.open('settings')
        self.page.locator('#hqCommsSwitch').click()
        self.page.clock.fast_forward(300000)
        self.assertEqual(len(self.state()['personnel']['feed']), 1)
        self.assertFalse(self.state()['prefs']['hqComms'])

    def test_random_timer_stops_when_hidden(self):
        self.page.clock.install()
        self.page.evaluate('''()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));}''')
        self.page.clock.fast_forward(300000)
        self.assertEqual(len(self.state()['personnel']['feed']), 0)
        self.page.evaluate('''()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));}''')
        self.page.clock.fast_forward(140001)
        self.assertEqual(len(self.state()['personnel']['feed']), 1)

    def test_sound_fallback_no_double_tones_and_mute(self):
        self.enable_sound()
        self.open('tools')
        count = self.tones()
        self.page.locator('.hq-personnel-brief [data-hq="id"]').click()
        self.assertEqual(self.tones() - count, 2, 'Silent button needs one tap sound')
        count = self.tones()
        self.page.locator('#hqFlipId').click()
        self.assertEqual(self.tones() - count, 2)
        self.page.keyboard.press('Escape')
        count = self.tones()
        self.page.locator('[data-hq="radio"]').click()
        self.assertEqual(self.tones() - count, 3, 'Existing scan sound must not get a second tap')
        count = self.tones()
        self.page.locator('#hqProfileForm button').click()
        self.assertEqual(self.tones() - count, 3, 'Submit must not also play a click fallback')
        self.open('settings')
        self.page.locator('#soundSwitch').click()
        count = self.tones()
        self.open('tools')
        self.page.locator('[data-hq="broadcast"]').click()
        self.assertEqual(self.tones(), count)

    def test_voice_requires_sound_and_opt_in(self):
        self.open('tools')
        self.page.locator('[data-hq="broadcast"]').click()
        self.assertEqual(self.page.evaluate('window.__speech.length'), 0)
        self.open('settings')
        self.page.locator('#hqVoiceSwitch').click()
        self.open('tools')
        self.page.locator('[data-hq="broadcast"]').click()
        self.assertEqual(self.page.evaluate('window.__speech.length'), 0)
        self.enable_sound()
        self.open('tools')
        self.page.locator('[data-hq="broadcast"]').click()
        self.assertEqual(self.page.evaluate('window.__speech.length'), 1)
        self.assertTrue(self.page.evaluate("window.__speech[0].startsWith('模擬館内放送。')"))

    def test_mobile_eight_screens_dialogs_and_eva_alignment(self):
        for width in (320, 390, 430):
            self.page.set_viewport_size({'width': width, 'height': 844})
            for name in ('home', 'weather', 'infra', 'eva', 'magi', 'mission', 'tools', 'settings'):
                self.open(name)
                self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'), name)
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'), 3, (width, name))
            self.open('eva')
            for unit in (0, 1, 2):
                self.page.locator(f'[data-eva="{unit}"]').click()
                self.page.evaluate("document.querySelector('.eva-illustration').classList.add('at-on')")
                centers = self.page.evaluate("['.eva-reference-rig','.v26-at-field','.eva-measure-ring'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.x+r.width/2})")
                self.assertLess(max(centers)-min(centers), 1, (width, unit, centers))
            self.open('tools')
            self.page.locator('.hq-personnel-brief [data-hq="id"]').click()
            self.assertLessEqual(self.page.locator('#hqIdDialog').evaluate('(d)=>d.scrollWidth-d.clientWidth'), 1)
            self.page.keyboard.press('Escape')
            self.router('support', 'v27Shot')
            self.assertLessEqual(self.page.locator('#hqActionDialog').evaluate('(d)=>d.scrollWidth-d.clientWidth'), 1)
            self.page.keyboard.press('Escape')


if __name__ == '__main__':
    unittest.main(verbosity=2)
