"""Mobile task sections, staff records, mechanical effects and power/resource rules."""
import unittest
from browser_support import BrowserCase, RESULTS


class MobileOperationsTests(BrowserCase):
    def test_every_subscreen_is_independent_addressable_and_fits_mobile_widths(self):
        self.load({'prefs': {'showBoot': False}})
        for width in [320, 390, 430]:
            self.page.set_viewport_size({'width': width, 'height': 844})
            for page in ['tools', 'eva', 'magi', 'mission', 'infra', 'weather', 'settings']:
                self.open(page)
                routes = self.page.locator('.page.active [data-mobile-tab]').evaluate_all('(bs)=>bs.map(b=>b.dataset.mobileTab)')
                for route in routes:
                    with self.subTest(width=width, route=route):
                        self.page.locator(f'[data-mobile-tab="{route}"]').evaluate('(b)=>b.click()')
                        self.assertEqual(self.page.locator('.page.active .mobile-view:visible').count(), 1)
                        self.assertEqual(self.page.evaluate('location.hash'), '#'+route)
                        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'), 3)
                        # Individual task sections may scroll, but never recreate the old multi-screen stack.
                        self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'), 1150)
        self.open('tools')
        self.page.locator('[data-mobile-go="tools/device"]').click()
        self.assertTrue(self.page.locator('#deviceBatteryMeter').is_visible())
        self.page.reload(wait_until='domcontentloaded')
        self.assertEqual(self.page.evaluate("NERV_MOBILE.view('tools')"), 'device')
        self.page.go_back(wait_until='domcontentloaded')
        self.assertEqual(self.page.evaluate("NERV_MOBILE.view('tools')"), 'desk')

    def test_battery_bar_uses_real_values_and_stays_inside_its_frame(self):
        self.page.add_init_script('''Object.defineProperty(navigator,'getBattery',{value:undefined});
          const v=new URL(location).searchParams.get('fixtureBattery');
          window.__BOOT__={battery:v==='unknown'?null:Number(v),charging:false};''')
        for value, expected in [('60',60),('-9',0),('140',100),('unknown',None)]:
            self.page.goto(self.url+'?fixtureBattery='+value, wait_until='domcontentloaded')
            if self.page.locator('#bootSkip').is_visible(): self.page.locator('#bootSkip').click()
            self.view('tools','device')
            for width in [320,390,430]:
                self.page.set_viewport_size({'width':width,'height':844})
                frame=self.page.locator('#deviceBatteryMeter').bounding_box()
                fill=self.page.locator('#batteryFill').bounding_box()
                self.assertGreaterEqual(fill['x'],frame['x'])
                self.assertLessEqual(fill['x']+fill['width'],frame['x']+frame['width'])
                self.assertGreaterEqual(fill['y'],frame['y'])
                self.assertLessEqual(fill['y']+fill['height'],frame['y']+frame['height'])
                self.assertAlmostEqual(fill['width'],(frame['width']-6)*(expected or 0)/100,delta=1)
            self.assertEqual(self.page.locator('#deviceBatteryMeter').get_attribute('aria-valuenow'), None if expected is None else str(expected))
            self.assertEqual(self.page.locator('#homeBattery').inner_text(), '--%' if expected is None else str(expected)+'%')
        self.page.screenshot(path=str(RESULTS/'staff-device-430.png'),full_page=True)

    def test_staff_records_survive_reload_export_and_alert_clear(self):
        self.page.add_init_script("Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedHandover=text;}}});")
        self.load({'prefs':{'showBoot':False},'personnel':{'extension':'preserved'}})
        self.view('tools','duty'); self.page.locator('#dutyStart').click()
        start=self.state()['personnel']['shift']['startedAt']
        self.assertGreater(start,0)
        self.assertTrue(self.page.locator('#dutyStart').is_disabled())
        self.view('tools','inspection'); self.page.locator('[data-inspection="2"]').check()
        self.view('tools','handover')
        for i in range(7):
            self.page.locator('#handoverText').fill('<img src=x onerror=alert(1)> / 連絡 '+str(i))
            self.page.locator('#handoverForm button[type=submit]').click()
        self.assertEqual(self.page.locator('#handoverList article').count(),5)
        self.assertEqual(self.page.locator('#handoverList img').count(),0)
        self.page.locator('#handoverNext').click()
        self.assertEqual(self.page.locator('#handoverList article').count(),2)
        self.page.locator('#handoverExport').click()
        self.page.wait_for_function('!!window.copiedHandover')
        self.assertIn('連絡 6',self.page.evaluate('window.copiedHandover'))
        saved=self.save_and_reload()
        self.assertEqual(self.state()['personnel'],saved['personnel'])
        self.view('tools','duty'); self.page.locator('#dutyEnd').click()
        personnel=self.state()['personnel']
        self.assertEqual(personnel['shift']['startedAt'],start)
        self.assertGreaterEqual(personnel['shift']['endedAt'],start)
        self.view('infra','systems');self.page.locator('#powerToggle').click()
        self.page.locator('#commandAlertOpen').click();self.page.locator('#alertClear').click()
        self.page.wait_for_function('window.NERV_TEST.getState().infra.power')
        self.assertEqual(self.state()['personnel'],personnel)

    def test_magi_three_personas_have_a_triangular_panel_and_individual_decisions(self):
        self.load({'prefs':{'showBoot':False},'evas':[{'state':'READY'},{},{}]})
        self.open('magi');self.page.locator('#magiVote').click()
        self.assertEqual(self.page.evaluate("NERV_MOBILE.view('magi')"),'consensus')
        self.assertEqual(self.page.locator('.page.active h1').inner_text(),'MAGIシステム / MAGI SYSTEM')
        self.assertEqual(self.state()['magi']['vote']['count'],2)
        self.assertTrue(self.state()['magi']['vote']['approved'])
        top=self.page.locator('.core-melchior').bounding_box()
        left=self.page.locator('.core-balthasar').bounding_box()
        right=self.page.locator('.core-casper').bounding_box()
        self.assertLess(top['y'],left['y']);self.assertAlmostEqual(left['y'],right['y'])
        self.assertLess(left['x'],right['x'])
        self.assertEqual(self.page.locator('.magi-triptych [data-vote="approved"]').count(),2)
        self.assertEqual(self.page.locator('#magiReasons li').count(),3)
        self.page.screenshot(path=str(RESULTS/'magi-consensus-390.png'),full_page=True)

    def test_magi_sequence_shows_actual_persona_votes_before_committing(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.load({'prefs':{'showBoot':False},'evas':[{'state':'READY'},{},{}]})
        self.open('magi');self.page.locator('#magiVote').click()
        self.assertTrue(self.page.locator('#sequenceOverlay').is_visible())
        self.assertIsNone(self.state()['magi']['vote'])
        self.page.wait_for_function("document.querySelector('.sequence-magi-core[data-core=CASPER]').dataset.vote === 'denied'")
        self.assertEqual(self.page.locator('.sequence-magi-core[data-vote="approved"]').count(),2)
        self.assertEqual(self.page.locator('.sequence-magi-core[data-vote="denied"]').count(),1)
        for core in self.page.locator('.sequence-magi-core').all():
            self.assertTrue(core.is_visible())
            self.assertGreater(core.bounding_box()['height'],50)
        self.page.screenshot(path=str(RESULTS/'magi-voting-390.png'),full_page=True)
        self.page.locator('#seqSkip').click()
        self.assertTrue(self.state()['magi']['vote']['approved'])
        self.assertFalse(self.page.locator('#sequenceOverlay').is_visible())

    def test_armor_animation_tracks_state_and_respects_reduced_motion(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.load({'prefs':{'showBoot':False}})
        self.view('infra','systems')
        self.page.locator('#armorToggle').click()
        self.assertTrue(self.state()['infra']['armor'])
        self.assertEqual(self.page.locator('#citySystemsVisual').get_attribute('data-closed'),'true')
        self.assertEqual(self.page.locator('#operationVisual').get_attribute('data-operation'),'armor-close')
        self.assertEqual(self.page.locator('#operationVisual .op-gate-left').evaluate('(e)=>getComputedStyle(e).animationName'),'gateCloseLeft')
        self.page.wait_for_timeout(850)
        self.assertEqual(self.page.locator('#citySystemsVisual .op-gate-left').evaluate('(e)=>getComputedStyle(e).transform'),'matrix(1, 0, 0, 1, 0, 0)')
        self.page.emulate_media(reduced_motion='reduce')
        self.page.locator('#armorToggle').click()
        self.assertFalse(self.state()['infra']['armor'])
        self.assertEqual(self.page.locator('#citySystemsVisual').get_attribute('data-closed'),'false')
        self.assertEqual(self.page.locator('#operationVisual .op-gate-left').evaluate('(e)=>getComputedStyle(e).animationName'),'none')
        self.assertEqual(self.page.locator('#citySystemsVisual .op-gate-left').evaluate('(e)=>getComputedStyle(e).transform'),'matrix(1, 0, 0, 1, -145, 0)')

    def test_external_power_pauses_internal_power_per_unit_and_supply_loss_resumes_it(self):
        self.page.add_init_script("window.fixtureNow=Number(sessionStorage.getItem('fixtureNow'))||1800000000000;Date.now=()=>window.fixtureNow;")
        self.load({'prefs':{'showBoot':False},'evas':[{'state':'DEPLOYED','umbilical':True,'power':240,'powerUpdatedAt':1800000000000}, {'state':'DEPLOYED','umbilical':False,'power':240,'powerUpdatedAt':1800000000000},{}]})
        self.page.evaluate('window.fixtureNow+=10000;NERV_TEST.clock()')
        self.assertEqual([e['power'] for e in self.state()['evas'][:2]],[240,230])
        self.view('eva','readiness');self.page.locator('#evaCable').click()
        self.assertFalse(self.state()['evas'][0]['umbilical'])
        self.page.evaluate('window.fixtureNow+=10000;NERV_TEST.clock()')
        self.assertEqual([e['power'] for e in self.state()['evas'][:2]],[230,220])
        self.page.locator('#evaCable').click()
        self.view('infra','systems');self.page.locator('#powerToggle').click()
        self.page.evaluate('window.fixtureNow+=10000;NERV_TEST.clock()')
        self.assertEqual([e['power'] for e in self.state()['evas'][:2]],[220,210])
        self.page.locator('#powerToggle').click()
        self.page.evaluate('window.fixtureNow+=10000;NERV_TEST.clock()')
        self.assertEqual([e['power'] for e in self.state()['evas'][:2]],[220,200])
        self.page.evaluate("sessionStorage.setItem('fixtureNow',String(window.fixtureNow))")
        saved=self.save_and_reload()
        self.assertEqual(self.state()['evas'],saved['evas'])

    def test_doctrines_change_real_cost_damage_and_loss_with_matching_forecasts(self):
        self.load({'prefs':{'showBoot':False}})
        self.defense('detect');self.defense('scan')
        self.defense('sector',0);self.defense('turret')
        self.defense('sector',1);self.defense('turret')
        seed=self.state();seed['defense']['enemy']['hp']=300;seed['defense']['enemy']['dist']=1
        results={}
        for doctrine in ['defense','balanced','assault']:
            self.page.evaluate('(s)=>localStorage.setItem("nerv-command-v2",JSON.stringify(s))',seed)
            self.page.reload(wait_until='domcontentloaded')
            self.view('mission','strategy')
            self.page.locator(f'[data-doctrine="{doctrine}"]').click()
            forecast=self.page.locator('#strategyForecast').inner_text()
            self.assertIn('被害見込み',forecast)
            self.page.locator('#strategyAdvance').click()
            d=self.state()['defense'];before=seed['defense']
            damage=before['enemy']['hp']-d['enemy']['hp']
            loss=before['city'][1]['hp']-d['city'][1]['hp']
            self.assertIn('予測損耗 '+str(damage),forecast)
            self.assertIn('迎撃後電力（報酬前） '+str(d['energy'])+'%',forecast)
            self.assertIn('被害見込み '+str(loss),forecast)
            self.assertGreaterEqual(d['energy'],0)
            results[doctrine]=(damage,loss,d['energy'])
        a,b,c=[results[k] for k in ['defense','balanced','assault']]
        self.assertLess(a[0],b[0]);self.assertLess(b[0],c[0])
        self.assertLess(a[1],b[1]);self.assertLess(b[1],c[1])
        self.assertGreater(a[2],b[2]);self.assertGreater(b[2],c[2])

    def test_ground_victory_finishes_an_active_mission_once(self):
        self.load({'prefs':{'showBoot':False},'mission':{'phase':2}})
        self.defense('detect')
        for sector in range(3): self.defense('sector',sector);self.defense('turret')
        for _ in range(5):
            if self.state()['defense']['status']!='active':break
            self.defense('advance')
        self.assertEqual(self.state()['defense']['status'],'victory')
        self.assertEqual(self.state()['mission']['phase'],6)
        self.assertEqual(self.state()['ops']['missions'],1)
        self.defense('advance')
        self.assertEqual(self.state()['ops']['missions'],1)


if __name__ == '__main__':
    unittest.main(verbosity=2)
