"""Real painted inspection, uncropped map labels, fitted sprites and shared Anime motion."""
from browser_support import BrowserCase,RESULTS
import qa_v219_browser as helpers

class V222Tests(BrowserCase):
    boot=helpers.V219Tests.boot
    cmd=helpers.V219Tests.cmd
    b=helpers.V219Tests.b
    idle=helpers.V219Tests.idle
    click=helpers.V219Tests.click

    def test_painted_batteries_replace_only_visible_diagram_and_persist_selection(self):
        self.boot();self.view('infra','weapons')
        self.assertFalse(self.page.locator('.city-weapon-drawing').is_visible())
        size=self.page.locator('#cityBatteryArt').evaluate('''async el=>{const im=new Image();im.src=getComputedStyle(el).backgroundImage.slice(5,-2);await im.decode();return [im.width,im.height]}''')
        self.assertEqual(size,[2172,724]);self.click('[data-city-weapon="missile"]')
        self.assertEqual(self.page.locator('#cityBatteryArt').get_attribute('data-mode'),'missile')
        self.assertEqual(self.state()['cityArmament']['modes'][0],'missile')
        self.assertFalse(self.state()['defense']['city'][0]['turret'])
        self.save_and_reload();self.view('infra','weapons');self.assertEqual(self.page.locator('#cityBatteryArt').get_attribute('data-mode'),'missile')
        self.page.evaluate('scrollTo(0,0)');self.page.screenshot(path=str(RESULTS/'v222-batteries.png'),full_page=True)

    def test_failed_selection_save_keeps_previous_battery_picture_and_mode(self):
        self.boot();self.view('infra','weapons');before=self.state()
        self.page.evaluate('()=>{window.savedSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="nerv-command-v2")throw Error("disk-full");return savedSet.call(this,k,v)}}')
        self.click('[data-city-weapon="missile"]')
        self.assertEqual(self.state().get('cityArmament'),before.get('cityArmament'))
        self.assertEqual(self.page.locator('#cityBatteryArt').get_attribute('data-mode'),'cannon')

    def test_complete_map_labels_and_footer_text_stay_inside_their_regions(self):
        self.page.add_init_script('''window.mapText=[];const originalText=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){if(this.canvas.id==='tokyoCityCanvas')mapText.push({text,x,y,width:this.measureText(text).width});return originalText.call(this,text,x,y,...args)}''')
        self.boot();self.view('infra','map')
        calls=self.page.evaluate('()=>{mapText=[];NERV_CITY_ART.paint(document.getElementById("tokyoCityCanvas"),"map");return mapText}')
        labels=[r for r in calls if r['y']<304];self.assertEqual(len(labels),4)
        for r in labels:self.assertLessEqual(r['y']+8,304);self.assertGreaterEqual(r['x'],0);self.assertLessEqual(r['x']+r['width'],840)
        self.assertTrue(any('GEOFRONT' in r['text'] for r in labels))
        footer=[r for r in calls if r['y']>=304];self.assertEqual(len(footer),6)
        for r in footer:self.assertLessEqual(r['x']%280+r['width'],280);self.assertLessEqual(r['y']+5,360)
        self.page.locator('#v27Facilities button').nth(3).click();self.assertEqual(self.state()['defense']['selected'],3)
        self.page.evaluate('scrollTo(0,0)');self.page.screenshot(path=str(RESULTS/'v222-map.png'),full_page=True)

    def assert_fitted(self):
        rows=self.page.locator('.page.active .mobile-view:visible .weapon-art i').evaluate_all('els=>els.map(e=>({kind:e.dataset.weaponArt,art:e.getBoundingClientRect().toJSON(),box:e.parentElement.getBoundingClientRect().toJSON()}))')
        self.assertTrue(rows)
        for r in rows:
            a,b=r['art'],r['box'];ratio=1774/{'knife':224,'rifle':372,'positron':291}[r['kind']]
            self.assertAlmostEqual(a['width']/a['height'],ratio,delta=.04)
            self.assertGreater(a['width'],20)
            for k in ['left','top']:self.assertGreaterEqual(a[k],b[k]-.5)
            for k in ['right','bottom']:self.assertLessEqual(a[k],b[k]+.5)

    def test_three_weapon_rows_fit_operation_detail_and_deployment_in_three_widths(self):
        self.boot();self.b('start',{'angel':'sachiel'});self.b('prepare');self.b('approve');self.b('placement')
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844});self.view('battle','deploy');self.assert_fitted()
            for kind in ['knife','rifle','positron']:
                for view,selector in [('armament','[data-armament="'),('weapon-detail','[data-detail-weapon="')]:
                    self.view('mission',view);self.page.locator(selector+kind+'"]').click();self.idle();self.assert_fitted()
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width)
        self.view('mission','armament');self.page.evaluate('scrollTo(0,0)');self.page.screenshot(path=str(RESULTS/'v222-equipment.png'),full_page=True)

    def test_explicit_zoom_is_contained_and_fit_restores_default_size(self):
        self.boot();self.view('mission','weapon-detail');before=self.state();self.page.locator('#weaponDetailZoom').fill('2.2')
        self.assertGreater(self.page.locator('.weapon-detail-scroll').evaluate('e=>e.scrollWidth'),self.page.locator('.weapon-detail-scroll').evaluate('e=>e.clientWidth'))
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),390)
        self.page.locator('#weaponFit').click();self.assertEqual(self.page.locator('#weaponDetailZoom').input_value(),'1');self.assert_fitted()
        self.assertEqual(self.state()['defense'],before['defense'])
        self.page.locator('#weaponDetailZoom').fill('2.2');self.view('infra','map');self.view('mission','weapon-detail');self.assertEqual(self.page.locator('#weaponDetailZoom').input_value(),'1')

    def test_real_anime_stagger_and_selection_finish_on_the_shared_engine(self):
        self.page.emulate_media(reduced_motion='no-preference');self.boot({'prefs':{'showBoot':False,'motion':True,'staffComms':False}})
        initial=self.page.evaluate('()=>{NERV_MOBILE.open("infra","weapons");return {active:NERV_MOTION.snapshot().active,opacity:getComputedStyle(document.querySelector("#cityWeaponsPanel .staff-panel")).opacity}}')
        self.assertGreater(initial['active'],0);self.assertLess(float(initial['opacity']),1)
        self.page.wait_for_function('NERV_MOTION.snapshot().active===0',timeout=4000)
        self.page.locator('[data-city-weapon="missile"]').evaluate('(el)=>el.click()');self.idle()
        self.page.wait_for_function('NERV_INTERFACE.snapshot().selections>0 && NERV_INTERFACE.snapshot().swaps>0')
        self.assertLessEqual(self.page.evaluate('NERV_MOTION.snapshot().active'),6)
        self.page.wait_for_function('NERV_MOTION.snapshot().active===0',timeout=4000)
        self.assertEqual(self.page.locator('#cityBatteryArt').evaluate('e=>e.style.transform'),'')
        self.assertFalse(self.page.evaluate('NERV_INTERFACE.snapshot().ownRAF'));self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().ownRAF'),0)

    def test_reduced_motion_and_hidden_documents_finish_visuals_without_state_change(self):
        self.boot({'prefs':{'showBoot':False,'motion':True,'staffComms':False}});self.view('infra','weapons');before=self.state()['defense'];self.view('mission','armament')
        self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().active'),0);self.assertEqual(self.state()['defense'],before)
        self.page.emulate_media(reduced_motion='no-preference');self.page.wait_for_timeout(40);self.view('infra','weapons');self.assertGreater(self.page.evaluate('NERV_MOTION.snapshot().active'),0)
        self.page.evaluate('()=>{Object.defineProperty(document,"hidden",{value:true,configurable:true});document.dispatchEvent(new Event("visibilitychange"))}')
        self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().active'),0)

    def test_updated_views_fit_phone_widths_under_an_emergency_banner(self):
        self.boot();self.page.evaluate('NERV_OPERATIONS.external("start")')
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for p,v in [('infra','weapons'),('infra','map'),('mission','weapon-detail')]:
                self.view(p,v);self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width)
                self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150,(width,p,v))
