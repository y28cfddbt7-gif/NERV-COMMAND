"""World artwork, pilot telemetry and cross-screen staff objectives, offline."""
import unittest
from browser_support import BrowserCase, RESULTS


class WorldDutyTests(BrowserCase):
    def request(self, kind='pilot', unit=1):
        return {'id':'fixture-'+kind,'at':1,'kind':'radio','title':'模擬業務依頼','text':'対象画面で確認してください。','read':False,'assignment':{'kind':kind,'unit':unit}}

    def accept(self, kind='pilot', unit=1):
        self.load({'prefs':{'showBoot':False,'staffComms':False},'personnel':{'messages':[self.request(kind,unit)],'extension':'keep'}})
        self.view('tools','communications');self.page.locator('.duty-accept-message').click()
        self.page.wait_for_function('NERV_TEST.getState().personnel.dispatch?.orders.length===1')

    def test_boot_and_world_panels_fit_three_widths_and_use_shared_decoded_art(self):
        self.load({'prefs':{'showBoot':True,'motion':False}})
        # BrowserCase normally skips the boot; explicitly show its real markup.
        self.page.evaluate("document.getElementById('boot').classList.remove('hidden');document.getElementById('shell').classList.add('hidden')")
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),2)
            self.assertTrue(self.page.locator('#bootEnter').is_visible())
            self.page.screenshot(path=str(RESULTS/f'boot-world-{width}.png'),full_page=True)
        self.page.locator('#bootEnter').click()
        for route in [('infra','geofront'),('infra','armory'),('eva','pilots'),('tools','assignments')]:
            for width in [320,390,430]:
                self.page.set_viewport_size({'width':width,'height':844});self.view(*route)
                tab=self.page.locator('.page.active .mobile-tabs [aria-selected="true"]').bounding_box()
                self.assertGreaterEqual(tab['x'],0);self.assertLessEqual(tab['x']+tab['width'],width)
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),3)
                self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)
            self.page.screenshot(path=str(RESULTS/f'{route[1]}-430.png'),full_page=True)
            self.page.reload(wait_until='domcontentloaded');self.assertEqual(self.page.evaluate('location.hash'),'#'+'/'.join(route))
            self.assertEqual(self.page.locator('.page.active .mobile-view:visible').count(),1)
        decoded=self.page.evaluate('''async()=>{const bg=getComputedStyle(document.querySelector('.geofront-scene')).backgroundImage;const i=new Image();i.src=bg.slice(5,-2);await i.decode();return [i.naturalWidth,i.naturalHeight];}''')
        self.assertEqual(decoded,[1536,1024])

    def test_world_readouts_artillery_shutters_and_pilot_status_follow_state(self):
        self.load({'prefs':{'showBoot':False,'motion':False},'evas':[{'state':'POWER_LOST','power':0},{'state':'READY','sync':82},{}]})
        self.view('eva','pilots');self.assertEqual(self.page.locator('#pilotStatus').inner_text(),'緊急回収待機')
        self.page.locator('[data-pilot="1"]').click();self.assertEqual(self.state()['selectedEva'],1)
        self.assertEqual(self.page.locator('#pilotName').inner_text(),'碇シンジ');self.assertEqual(self.page.locator('#pilotSync').inner_text(),'82.0%')
        self.assertEqual(self.page.locator('#pilotEntry').inner_text(),'プラグ接続・待機')
        self.defense('sector',3);self.view('infra','armory');self.assertEqual(self.state()['defense']['selected'],1)
        self.page.locator('[data-armory-sector="0"]').click()
        self.assertEqual(self.page.locator('#armoryPanel').get_attribute('data-deployed'),'false')
        self.defense('turret')
        self.assertEqual(self.page.locator('#armoryPanel').get_attribute('data-deployed'),'true')
        self.assertIn('迎撃待機',self.page.locator('#armoryTurret').inner_text())
        self.assertEqual(self.page.locator('[data-battery="0"]').get_attribute('data-active'),'true')
        self.page.screenshot(path=str(RESULTS/'armory-deployed-390.png'),full_page=True)
        self.view('infra','systems');self.page.locator('#powerToggle').click()
        self.view('infra','geofront');self.assertEqual(self.page.locator('#geofrontPower').inner_text(),'停電')
        self.assertEqual(self.page.locator('#geofrontPanel').get_attribute('data-power'),'false')
        self.view('infra','armory');self.assertEqual(self.page.locator('#armoryTurret').inner_text(),'給電待機')

    def test_requested_signal_reaches_all_eight_pages_without_navigation_or_focus_capture(self):
        self.load({'prefs':{'showBoot':False,'motion':False,'staffComms':False}})
        # Exercise real manual receipt/persistence independently of quiet cadence and unread caps.
        for index,page in enumerate(['home','weather','infra','eva','magi','mission','tools','settings']):
            self.open(page);focus=self.page.locator('button:visible:not(:disabled)').first.element_handle();focus.focus()
            self.assertTrue(focus.evaluate('(e)=>e===document.activeElement'),(page,focus.get_attribute('id'),self.page.evaluate('document.activeElement.outerHTML.slice(0,150)')))
            self.page.evaluate('document.getElementById("staffRadio").click()')
            self.page.wait_for_function('(n)=>NERV_TEST.getState().personnel.messages?.length===n',arg=index+1)
            self.assertTrue(self.page.locator('#staffSignal').is_visible())
            self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),page)
            self.assertTrue(focus.evaluate('(e)=>e===document.activeElement'),(page,focus.get_attribute('id'),self.page.evaluate('document.activeElement.outerHTML.slice(0,150)')))
            self.assertFalse(self.page.locator('#staffSignalBody').is_visible())
            self.page.locator('#staffSignalDismiss').click()
        self.view('tools','communications');ack=self.page.locator('#staffRadioList [data-staff-ack]').first;old=ack.get_attribute('data-staff-ack');ack.focus();self.page.evaluate('document.getElementById("staffRadio").click()')
        self.page.wait_for_function('NERV_TEST.getState().personnel.messages.length===9')
        self.assertEqual(self.page.evaluate('document.activeElement.dataset.staffAck'),old)
        self.page.locator('#staffSignalExpand').click();title=self.page.locator('#staffSignalTitle').inner_text();self.page.locator('#staffSignalAccept').focus();self.page.evaluate('document.getElementById("staffRadio").click()')
        self.page.wait_for_function('NERV_TEST.getState().personnel.messages.length===10')
        self.assertEqual(self.page.locator('#staffSignalTitle').inner_text(),title)
        self.assertTrue(self.page.locator('#staffSignalBody').is_visible());self.assertTrue(self.page.locator('#staffSignalAccept').evaluate('(e)=>e===document.activeElement'))
        self.assertTrue(self.page.locator('#staffSignalPending').is_visible())

    def test_pilot_job_requires_correct_unit_then_reports_once_and_survives_recovery(self):
        self.accept('pilot',1);self.view('tools','assignments')
        self.assertTrue(self.page.locator('#dutyOrderList button').last.is_disabled())
        self.page.locator('#dutyOrderList button').first.click()
        self.assertEqual(self.page.evaluate('location.hash'),'#eva/pilots')
        self.page.locator('[data-pilot="0"]').click();self.page.locator('#pilotConfirm').click()
        self.assertEqual(self.state()['personnel']['dispatch']['orders'][0]['status'],'active')
        self.page.locator('[data-pilot="1"]').click();self.page.locator('#pilotConfirm').click()
        self.page.wait_for_function("NERV_TEST.getState().personnel.dispatch.orders[0].status==='ready'")
        self.view('tools','assignments');self.page.locator('#dutyOrderList button').last.click()
        self.page.wait_for_function('NERV_TEST.getState().personnel.dispatch.merit===10')
        self.assertEqual(self.state()['personnel']['dispatch']['completed'],1)
        saved=self.save_and_reload();self.assertEqual(self.state()['personnel']['dispatch'],saved['personnel']['dispatch'])
        self.assertTrue(self.page.locator('#dutyOrderList button').last.is_disabled())
        self.view('infra','systems');self.page.locator('#powerToggle').click();self.page.locator('#commandAlertOpen').click();self.page.locator('#alertClear').click()
        self.page.wait_for_function('NERV_TEST.getState().infra.power')
        self.assertEqual(self.state()['personnel']['dispatch'],saved['personnel']['dispatch'])
        self.assertEqual(self.state()['personnel']['extension'],'keep')

    def test_inspection_handover_and_headquarters_jobs_require_their_real_actions(self):
        for kind in ['inspection','handover','geofront']:
            with self.subTest(kind=kind):
                # Separate browser storage for each synthetic request.
                if kind!='inspection':
                    self.assertEqual(self.errors,[]);self.page.evaluate('localStorage.clear()');self.page.close();self.page=self.context.new_page();self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
                self.accept(kind);self.view('tools','assignments');self.page.locator('#dutyOrderList button').first.click()
                if kind=='inspection':
                    self.page.locator('#inspectionVerify').click();self.assertEqual(self.state()['personnel']['dispatch']['orders'][0]['status'],'active')
                    for i in range(5):self.page.locator(f'[data-inspection="{i}"]').check()
                    self.page.locator('#inspectionVerify').click()
                elif kind=='handover':
                    self.page.locator('#handoverText').fill('模擬当直の引継ぎ確認');self.page.locator('#handoverForm button').click()
                else:self.page.locator('#geofrontInspect').click()
                self.page.wait_for_function("NERV_TEST.getState().personnel.dispatch.orders[0].status==='ready'")

    def test_three_active_jobs_are_not_dropped_and_failed_save_cannot_award_merit(self):
        orders=[{'id':'old-'+str(i),'kind':'geofront','status':'active','acceptedAt':1} for i in range(3)]
        self.load({'prefs':{'showBoot':False,'staffComms':False},'personnel':{'messages':[self.request('pilot')],'dispatch':{'orders':orders,'merit':20,'completed':2}}})
        self.view('tools','communications');self.assertTrue(self.page.locator('.duty-accept-message').is_disabled())
        self.assertEqual(self.state()['personnel']['dispatch']['orders'],orders)
        self.view('infra','geofront');self.page.locator('#geofrontInspect').click()
        self.page.wait_for_function("NERV_TEST.getState().personnel.dispatch.orders.every(o=>o.status==='ready')")
        self.page.evaluate('''()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('fixture full');return set.call(this,k,v);};}''')
        self.view('tools','assignments');self.page.locator('#dutyOrderList article button').nth(1).click()
        self.page.wait_for_function("document.getElementById('staffCommsResult').textContent.includes('fixture full')")
        self.assertEqual(self.state()['personnel']['dispatch']['merit'],20)
        self.assertTrue(all(o['status']=='ready' for o in self.state()['personnel']['dispatch']['orders']))

    def test_new_motions_respect_os_app_and_hidden_state(self):
        self.page.emulate_media(reduced_motion='no-preference');self.load({'prefs':{'showBoot':False}})
        self.view('infra','geofront');self.assertEqual(self.page.locator('.geofront-scene .world-scan').evaluate('(e)=>getComputedStyle(e).animationName'),'worldScan')
        self.page.emulate_media(reduced_motion='reduce');self.assertEqual(self.page.locator('.geofront-scene .world-scan').evaluate('(e)=>getComputedStyle(e).animationName'),'none')
        self.page.emulate_media(reduced_motion='no-preference');self.open('settings');self.page.locator('#motionSwitch').click();self.view('infra','geofront')
        self.assertEqual(self.page.locator('.geofront-scene .world-scan').evaluate('(e)=>getComputedStyle(e).animationName'),'none')
        self.page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
        self.assertEqual(self.page.locator('.geofront-scene .world-scan').evaluate('(e)=>getComputedStyle(e).animationPlayState'),'paused')


if __name__=='__main__':unittest.main(verbosity=2)
