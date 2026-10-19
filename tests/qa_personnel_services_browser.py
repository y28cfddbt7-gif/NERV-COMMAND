"""Staff identity, fictional radio, reviewed dispatch and real button audio cues."""
import unittest
from browser_support import BrowserCase, RESULTS


class PersonnelServicesTests(BrowserCase):
    def choose(self, category, command):
        self.view('mission', 'orders')
        self.page.locator('#staffCommandOpen').click()
        self.page.locator(f'[data-dispatch-choice="{category}"]').click()
        self.page.locator(f'[data-dispatch-choice="{command}"]').click()

    def test_identity_preserves_legacy_staff_data_escapes_text_and_restores_focus(self):
        self.load({'prefs': {'showBoot': False}, 'personnel': {'extension': 'keep', 'checks': {'2': True},
                  'handover': [{'at': 1, 'category': '業務連絡', 'text': 'keep'}]}})
        self.view('tools', 'identity')
        self.page.locator('#staffDisplayName').fill('<img src=x onerror=alert(1)>')
        self.page.locator('#staffDepartment').fill('技術開発部')
        self.page.locator('#staffProfileForm button').click()
        self.page.wait_for_function("NERV_TEST.getState().personnel.profile?.department==='技術開発部'")
        saved = self.save_and_reload()
        self.assertEqual(self.page.evaluate('location.hash'), '#tools/identity')
        self.assertEqual(saved['personnel']['extension'], 'keep')
        self.assertEqual(saved['personnel']['checks'], {'2': True})
        self.assertEqual(saved['personnel']['handover'][0]['text'], 'keep')
        self.page.locator('#staffIdOpen').click()
        self.assertEqual(self.page.locator('#staffCardName').inner_text(), '<img src=x onerror=alert(1)>')
        self.assertEqual(self.page.locator('#personnelCard img').count(), 0)
        self.page.locator('#staffIdFlip').click()
        self.assertTrue(self.page.locator('#staffIdBack').is_visible())
        self.assertFalse(self.page.locator('#staffIdFront').is_visible())
        self.page.keyboard.press('Escape')
        self.assertTrue(self.page.locator('#staffIdOpen').evaluate('(b)=>b===document.activeElement'))
        self.assertEqual(self.state()['personnel'], saved['personnel'])

    def test_identity_and_dispatch_fit_three_widths_and_dialogs_trap_focus(self):
        self.load({'prefs': {'showBoot': False, 'motion': False}})
        for width in [320, 390, 430]:
            self.page.set_viewport_size({'width': width, 'height': 844})
            self.view('tools', 'identity'); self.page.locator('#staffIdOpen').click()
            for _ in range(6):
                self.page.keyboard.press('Tab')
                self.assertTrue(self.page.evaluate("document.getElementById('staffIdDialog').contains(document.activeElement)"))
            card = self.page.locator('#personnelCard').bounding_box()
            self.assertGreaterEqual(card['x'], 0); self.assertLessEqual(card['x'] + card['width'], width)
            self.page.screenshot(path=str(RESULTS/f'staff-id-{width}.png'))
            self.page.keyboard.press('Escape')
            self.choose('facility', 'armor')
            for selector in ['#staffCommandDialog', '#staffCommandExecute']:
                box = self.page.locator(selector).bounding_box()
                self.assertGreaterEqual(box['x'], 0); self.assertLessEqual(box['x']+box['width'], width)
            self.assertEqual(self.page.locator('#staffCommandExecute').evaluate('(b)=>getComputedStyle(b).animationName'), 'none')
            self.page.screenshot(path=str(RESULTS/f'command-review-{width}.png'))
            self.page.keyboard.press('Escape')
        self.view('tools', 'communications');self.page.screenshot(path=str(RESULTS/'staff-radio-430.png'),full_page=True)
        self.page.locator('[data-mobile-go="tools/desk"]').last.click()
        self.assertEqual(self.page.evaluate('location.hash'), '#tools/desk')
        self.page.go_back();self.assertEqual(self.page.evaluate('location.hash'), '#tools/communications')

    def test_separate_v28_profile_messages_and_disabled_radio_are_read_without_erasing_legacy_fields(self):
        legacy={'name':'旧当直','department':'旧技術部','feed':[{'at':1,'kind':'radio','source':'旧通信','text':'引継ぎ済みの旧連絡','ack':False}]}
        self.load({'prefs':{'showBoot':False,'hqComms':False},'personnel':legacy})
        self.view('tools','identity')
        self.assertEqual(self.page.locator('#staffDisplayName').input_value(),'旧当直')
        self.assertEqual(self.page.locator('#staffDepartment').input_value(),'旧技術部')
        self.view('tools','communications')
        self.assertEqual(self.page.locator('#staffCommsFlag').inner_text(),'OFF')
        self.assertIn('引継ぎ済みの旧連絡',self.page.locator('#staffRadioList').inner_text())
        self.page.locator('#staffRadioList button').click()
        self.page.wait_for_function('NERV_TEST.getState().personnel.messages?.[0]?.read')
        for key,value in legacy.items():self.assertEqual(self.state()['personnel'][key],value)
        self.page.locator('#staffCommsToggle').click()
        self.page.wait_for_function('NERV_TEST.getState().prefs.staffComms===true')
        saved=self.save_and_reload()
        self.assertEqual(self.state()['personnel'],saved['personnel'])

    def test_backup_failure_blocks_profile_and_incoming_records(self):
        self.page.add_init_script('''const set=Storage.prototype.setItem;
          Storage.prototype.setItem=function(key,value){if(key==='nerv-command-v2-before-visual-upgrade')throw Error('fixture backup denied');return set.call(this,key,value);};''')
        self.load({'prefs': {'showBoot': False}})
        old = self.state()['personnel']
        self.view('tools', 'identity');self.page.locator('#staffDisplayName').fill('変更しない')
        self.page.locator('#staffProfileForm button').click()
        self.page.wait_for_function("document.getElementById('staffProfileResult').textContent.includes('保存できません')")
        self.assertEqual(self.state()['personnel'], old)
        self.view('tools', 'communications');self.page.locator('#staffRadio').click()
        self.page.wait_for_function("document.getElementById('staffCommsResult').textContent.includes('記録できません')")
        self.assertEqual(self.state()['personnel'], old)

    def test_persist_failure_keeps_registered_profile_and_does_not_accept_message(self):
        self.load({'prefs': {'showBoot': False},'personnel':{'profile':{'name':'元の担当','department':'管制部'}}})
        self.page.evaluate('''() => {const set=Storage.prototype.setItem;
          Storage.prototype.setItem=function(key,value){if(key==='nerv-command-v2')throw Error('fixture disk full');return set.call(this,key,value);};}''')
        self.view('tools','identity');self.page.locator('#staffDisplayName').fill('保存失敗')
        self.page.locator('#staffProfileForm button').click()
        self.page.wait_for_function("document.getElementById('staffProfileResult').textContent.includes('fixture disk full')")
        self.assertEqual(self.state()['personnel']['profile']['name'],'元の担当')
        self.view('tools','communications');self.page.locator('#staffBroadcast').click()
        self.page.wait_for_function("document.getElementById('staffCommsResult').textContent.includes('fixture disk full')")
        self.assertNotIn('messages',self.state()['personnel'])

    def test_messages_are_bounded_acknowledged_persistent_and_preserved_on_recovery(self):
        self.load({'prefs': {'showBoot': False,'staffComms':False}})
        self.view('tools', 'communications')
        before=self.state()
        for i in range(14):
            old=self.state()['personnel'].get('messages',[{}])[0].get('id')
            self.page.locator('#staffBroadcast' if i%2 else '#staffRadio').click()
            self.page.wait_for_function('(old)=>NERV_TEST.getState().personnel.messages?.[0]?.id!==old',arg=old)
            self.assertEqual(len(self.state()['personnel']['messages']),min(i+1,12))
        for field in ['defense','evas','mission','infra','ops']:
            self.assertEqual(self.state()[field],before[field])
        self.page.locator('#staffRadioList button').first.click()
        self.page.wait_for_function('NERV_TEST.getState().personnel.messages[0].read')
        saved=self.save_and_reload()
        self.assertEqual(self.state()['personnel'],saved['personnel'])
        self.assertEqual(self.page.locator('#staffUnread').inner_text(),'11 未受領')
        self.view('infra','systems');self.page.locator('#powerToggle').click()
        self.page.locator('#commandAlertOpen').click();self.page.locator('#alertClear').click()
        self.page.wait_for_function('NERV_TEST.getState().infra.power')
        self.assertEqual(self.state()['personnel'],saved['personnel'])

    def test_automatic_communications_stop_when_disabled_or_hidden_and_does_not_catch_up(self):
        self.load({'prefs': {'showBoot': False}})
        # A shared cadence can deliver through either the staff or private channel.
        self.page.evaluate('window.commCount=()=>{const s=NERV_TEST.getState();return (s.personnel.messages||[]).length+Object.values(s.personalMessages?.threads||{}).reduce((n,t)=>n+(Array.isArray(t?.messages)?t.messages.length:0),0)}')
        self.page.clock.install()
        self.page.evaluate("document.dispatchEvent(new Event('visibilitychange'))")
        self.page.clock.fast_forward(900001)
        self.page.wait_for_function('commCount()===1')
        self.view('tools','communications');self.page.locator('#staffCommsToggle').click()
        self.page.wait_for_function('NERV_TEST.getState().prefs.staffComms===false')
        self.page.clock.fast_forward(500000)
        self.assertEqual(self.page.evaluate('commCount()'),1)
        self.page.locator('#staffCommsToggle').click()
        self.page.wait_for_function('NERV_TEST.getState().prefs.staffComms===true')
        self.page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
        self.page.clock.fast_forward(500000)
        self.assertEqual(self.page.evaluate('commCount()'),1)
        self.page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
        self.page.clock.fast_forward(89000)
        self.assertEqual(self.page.evaluate('commCount()'),1)
        self.page.clock.fast_forward(91001)
        self.page.wait_for_function('commCount()===2')

    def test_drilldown_does_not_spend_before_confirm_and_uses_original_handlers(self):
        self.load({'prefs': {'showBoot': False}})
        before=self.state()
        self.choose('recon','detect')
        self.assertEqual(self.state(),before)
        self.page.locator('#staffCommandBack').click()
        self.assertEqual(self.page.locator('[data-dispatch-choice]').count(),2)
        self.page.locator('#staffCommandBack').click()
        self.assertEqual(self.page.locator('[data-dispatch-choice]').count(),4)
        self.assertEqual(self.state(),before)
        self.page.locator('[data-dispatch-choice="recon"]').click()
        self.page.locator('[data-dispatch-choice="detect"]').click()
        self.page.locator('#staffCommandExecute').click()
        self.assertEqual(self.state()['defense']['caseNo'],before['defense']['caseNo']+1)
        self.choose('recon','scan');energy=self.state()['defense']['energy']
        self.page.locator('#staffCommandExecute').click()
        self.assertEqual(self.state()['defense']['energy'],energy-12)
        self.assertEqual(self.state()['defense']['scans'],34)
        self.choose('facility','repair')
        self.assertTrue(self.page.locator('#staffCommandExecute').is_disabled())
        self.assertIn('健全',self.page.locator('#staffCommandCondition').inner_text())

    def test_dispatch_rechecks_changed_state_and_routes_to_existing_sections(self):
        self.load({'prefs': {'showBoot': False}})
        self.choose('sequence','next')
        self.page.locator('#missionAction').evaluate('(b)=>b.click()')
        before=self.state()
        self.page.locator('#staffCommandExecute').click()
        self.assertEqual(self.state(),before)
        self.assertIn('状況が変わりました',self.page.locator('#staffCommandCondition').inner_text())
        self.page.locator('#staffCommandExecute').click()
        self.assertEqual(self.state()['mission']['phase'],2)
        self.assertTrue(self.state()['infra']['armor'])
        for command,route in [('eva','#eva/control'),('magi','#magi/request'),('map','#infra/map')]:
            self.choose('coordination',command);self.page.locator('#staffCommandExecute').click()
            self.assertEqual(self.page.evaluate('location.hash'),route)
            self.page.reload(wait_until='domcontentloaded')
            self.assertEqual(self.page.evaluate('location.hash'),route)

    def test_missing_button_cues_play_once_without_doubling_dedicated_or_submit_sounds(self):
        self.page.add_init_script('''window.toneStarts=0;const C=window.AudioContext||window.webkitAudioContext;
          const create=C.prototype.createOscillator;C.prototype.createOscillator=function(){const o=create.call(this),start=o.start.bind(o);o.start=(...args)=>{window.toneStarts++;return start(...args)};return o;};''')
        self.load({'prefs': {'showBoot': False}})
        self.open('settings');self.page.locator('#soundSwitch').click()
        self.view('tools','identity');self.page.wait_for_timeout(90)
        before=self.page.evaluate('toneStarts');self.page.locator('#staffIdOpen').click()
        self.page.wait_for_function('(before)=>toneStarts>=before+2',arg=before)
        self.assertEqual(self.page.evaluate('toneStarts')-before,2)
        self.page.keyboard.press('Escape')
        self.view('tools','duty');self.page.wait_for_timeout(90)
        before=self.page.evaluate('toneStarts');self.page.locator('#dutyStart').click();self.page.wait_for_timeout(30)
        self.assertEqual(self.page.evaluate('toneStarts')-before,3)
        self.view('tools','tasks');self.page.wait_for_timeout(90)
        self.page.locator('#taskInput').fill('電子音の重複確認')
        before=self.page.evaluate('toneStarts');self.page.locator('#taskForm button').click();self.page.wait_for_timeout(30)
        self.assertEqual(self.page.evaluate('toneStarts')-before,3)
        self.open('settings');self.page.locator('#soundSwitch').click()
        self.view('tools','identity');self.page.wait_for_timeout(90)
        before=self.page.evaluate('toneStarts');self.page.locator('#staffIdOpen').click();self.page.wait_for_timeout(50)
        self.assertEqual(self.page.evaluate('toneStarts'),before)


if __name__=='__main__': unittest.main(verbosity=2)
