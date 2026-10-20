"""Real decoded artwork, shared raster deployment states and mobile rendering."""
from browser_support import BrowserCase
class V218Tests(BrowserCase):
    def boot(self,state=None,no_gl=False):
        if getattr(self,'booted',False):self.assertEqual(self.errors,[]);self.context.close();self.setUp()
        self.booted=True;self.page.add_init_script('Date.now=()=>1800000000000')
        if no_gl:self.page.add_init_script("const prior=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.startsWith('webgl')?null:prior.call(this,t,...a)}")
        seed={'prefs':{'showBoot':False,'motion':False,'staffComms':False}}
        if state:seed.update(state)
        self.load(seed);self.page.wait_for_function('NERV_CITY_ART.snapshot().ready && NERV_MESSAGES.snapshot().ready')
    def art(self):return self.page.evaluate('NERV_CITY_ART.snapshot()')
    def pixels(self,selector):return self.page.locator(selector).evaluate('async c=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",c.getContext("2d").getImageData(0,0,c.width,c.height).data))).map(x=>x.toString(16).padStart(2,"0")).join("")')
    def test_three_original_atlases_decode_and_are_used_by_all_city_views(self):
        self.boot();a=self.art();self.assertEqual(a['revision'],3);self.assertEqual(a['failed'],[]);self.assertTrue(all(x['loaded'] and x['width']==1254 and x['height']==1254 for x in a['images'].values()))
        for p,v,selector,mode in [('infra','streets','#tokyoStreetCanvas','street'),('infra','map','#tokyoCityCanvas','map'),('battle','engage','.battle-city-fallback canvas','battle')]:
            self.view(p,v);self.assertTrue(self.page.locator(selector).is_visible());self.assertEqual(self.page.locator(selector).get_attribute('data-artwork'),'raster');self.assertEqual(self.page.locator(selector).get_attribute('data-art-mode'),mode)
            colors=self.page.locator(selector).evaluate('c=>{const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data,s=new Set();for(let i=0;i<d.length;i+=256)s.add((d[i]>>4)+":"+(d[i+1]>>4)+":"+(d[i+2]>>4));return s.size}')
            self.assertGreater(colors,120);self.assertEqual(self.page.locator('.page.active svg:visible').count(),0)
    def test_roof_battery_and_shelter_switch_actual_bitmap_pixels_per_district(self):
        self.boot();self.view('infra','streets');normal=self.pixels('#tokyoStreetCanvas');self.defense('sector',0);self.defense('turret');armed=self.pixels('#tokyoStreetCanvas');self.assertNotEqual(armed,normal);self.assertEqual(self.art()['lastPaint']['street']['states'],['armed','normal','normal']);self.defense('armor');sheltered=self.pixels('#tokyoStreetCanvas');self.assertNotEqual(sheltered,armed);self.assertEqual(self.art()['lastPaint']['street']['states'],['sheltered','normal','normal']);self.view('infra','map');self.assertEqual(self.art()['lastPaint']['map']['states'],['sheltered','normal','normal'])
    def test_damage_and_power_status_repaint_the_same_shared_city(self):
        self.boot({'defense':{'city':[{'hp':35},{'hp':100},{'hp':100},{'hp':100}]}});self.view('infra','streets');before=self.pixels('#tokyoStreetCanvas');self.view('infra','systems');self.page.locator('#powerToggle').click();self.view('infra','streets');self.assertFalse(self.art()['lastPaint']['street']['power']);self.assertEqual(self.art()['lastPaint']['street']['health'][0],35);self.assertNotEqual(self.pixels('#tokyoStreetCanvas'),before)
    def test_webgl_is_a_transparent_control_layer_over_the_painted_scene(self):
        self.boot();self.view('battle','engage');self.page.wait_for_function('NERV_BATTLE.snapshot().stage.frames>0');s=self.page.evaluate('NERV_BATTLE.snapshot().stage');self.assertEqual(s['renderer'],'webgl');self.assertTrue(self.page.locator('.battle-city-fallback').is_visible());self.assertTrue(self.page.locator('.battle-city-webgl').is_visible());self.assertEqual(s['instances'],207);self.assertLessEqual(s['drawCalls'],7);self.assertFalse(s['ownRAF'])
    def test_no_webgl_and_low_quality_still_show_the_original_art(self):
        for no_gl,quality in [(True,'high'),(False,'low')]:
            self.boot({'prefs':{'showBoot':False,'motion':False,'fxQuality':quality}},no_gl=no_gl);self.view('battle','engage');self.assertEqual(self.page.locator('.battle-city-fallback canvas').get_attribute('data-artwork'),'raster');self.assertEqual(self.page.evaluate('NERV_BATTLE.snapshot().stage.renderer'),'canvas');self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
    def test_decoding_is_shared_and_idle_images_have_no_redraw_loop(self):
        self.boot();self.view('battle','engage');self.page.evaluate('NERV_MOTION.stopAll();NERV_FX.refresh()');before=self.art();self.page.wait_for_timeout(300);self.assertEqual(self.art()['paints'],before['paints']);self.assertEqual(self.art()['revision'],3);self.assertFalse(self.art()['ownRAF']);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
    def test_phone_layout_and_reload_keep_artwork_and_city_state(self):
        self.boot();self.defense('sector',1);self.defense('armor');
        for p,v in [('infra','streets'),('infra','map'),('battle','engage')]:
            self.view(p,v)
            for width in [320,390,430]:
                self.page.set_viewport_size({'width':width,'height':844});self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1);self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)
        self.save_and_reload();self.page.wait_for_function('NERV_CITY_ART.snapshot().ready');self.assertEqual(self.page.evaluate('location.hash'),'#battle/engage');self.assertEqual(self.art()['lastPaint']['battle']['states'][1],'sheltered')
