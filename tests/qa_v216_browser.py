"""Dedicated battle, shared transactions, actual instancing and bounded Anime effects."""
from browser_support import BrowserCase

ROUTES=[('battle','engage'),('battle','setup'),('battle','targets'),('battle','records'),('infra','streets'),('settings','motion')]
NOW=1800000000000

class V216Tests(BrowserCase):
    def boot(self,state=None,moving=False,no_gl=False):
        if getattr(self,'booted',False):
            self.assertEqual(self.errors,[]);self.context.close();self.setUp()
        self.booted=True
        self.page.add_init_script(f'window.v216Now=Number(sessionStorage.getItem("v216Now"))||{NOW};Date.now=()=>window.v216Now;')
        if moving:self.page.emulate_media(reduced_motion='no-preference')
        if no_gl:self.page.add_init_script("const originalContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return t.startsWith('webgl')?null:originalContext.call(this,t,...args)}")
        seed={'prefs':{'showBoot':False,'motion':moving,'staffComms':False}}
        if state:seed.update(state)
        self.load(seed);self.page.wait_for_function('window.NERV_BATTLE && NERV_MESSAGES.snapshot().ready')
        for name in ['security','magiops','angel']:
            if self.state()['world'][{'security':'security','magiops':'magiOps','angel':'angels'}[name]]['auto']:
                self.assertTrue(self.page.evaluate('(a)=>NERV_WORLD.act(a)',name+'.toggle')['ok'])
    def snapshot(self):return self.page.evaluate('NERV_BATTLE.snapshot()')
    def click_step(self):
        self.page.locator('#battleDo').click();self.page.wait_for_function('!NERV_BATTLE.snapshot().busy && !document.getElementById("shell").inert')
    def start(self,angel='sachiel',weapon='knife'):
        self.view('battle','targets');self.page.locator('[data-battle-target="'+angel+'"]').click();self.page.locator('#battleStart').click();self.page.wait_for_function('NERV_BATTLE.snapshot().view==="engage" && !NERV_BATTLE.snapshot().busy')
        self.page.locator('[data-battle-weapon="'+weapon+'"]').click();self.page.wait_for_function('!document.getElementById("shell").inert')

    def test_home_opens_a_separate_battle_page_without_covering_the_controls(self):
        self.boot();nav_visible=self.page.locator('.bottom-nav').is_visible();self.page.locator('#battleEntrance').click();self.assertEqual(self.snapshot()['page'],'battle')
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            self.assertFalse(self.page.locator('.bottom-nav').is_visible());self.assertFalse(self.page.locator('.sys-header').is_visible());self.assertFalse(self.page.locator('#commandAlert').is_visible())
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
            self.assertLess(self.page.locator('#battleDo').bounding_box()['y']+self.page.locator('#battleDo').bounding_box()['height'],844)
        self.page.locator('.battle-top [data-ops-route="home"]').click();self.assertFalse(self.page.locator('body').evaluate('(b)=>b.classList.contains("battle-active")'));self.assertEqual(self.page.locator('.bottom-nav').is_visible(),nav_visible)
    def test_four_weapon_encounters_run_from_hangar_to_victory_on_one_page(self):
        for angel,weapon in [('sachiel','knife'),('sachiel','rifle'),('shamshel','knife'),('ramiel','positron')]:
            with self.subTest(angel=angel,weapon=weapon):
                self.boot();self.start(angel,weapon);seen=set();hits=[]
                for _ in range(40):
                    d=self.state()['defense'];p=self.snapshot()['plan'];seen.add(p['kind'])
                    if d['status']!='active':break
                    self.assertNotEqual(p['kind'],'route',p);self.assertFalse(p.get('disabled'),p);self.assertEqual(self.page.evaluate('location.hash'),'#battle/engage')
                    before=d['enemy']['hp'];self.click_step()
                    if self.state()['defense']['enemy']['hp']<before:hits.append(before-self.state()['defense']['enemy']['hp'])
                self.assertEqual(self.state()['defense']['status'],'victory');self.assertTrue(hits);self.assertTrue({'prepare','sortie','launch','cable','fire'}<=seen);self.assertTrue(all(not c['turret'] for c in self.state()['defense']['city']))
                hp=self.state()['defense']['enemy']['hp'];self.click_step();self.assertEqual(self.snapshot()['view'],'records');self.assertEqual(self.state()['defense']['enemy']['hp'],hp);self.assertIn('目標沈黙',self.page.locator('#battleResult').inner_text())
    def test_ramiel_guides_an_incompatible_weapon_to_positron(self):
        self.boot();self.start('ramiel','knife')
        for _ in range(12):
            if self.snapshot()['plan']['kind']=='weapon':break
            self.click_step()
        self.assertEqual(self.snapshot()['plan']['weapon'],'positron');self.click_step();self.assertEqual(self.page.evaluate('NERV_ENGAGEMENT.snapshot().weapon'),'positron');self.assertEqual(self.page.locator('[data-battle-weapon="positron"]').get_attribute('aria-pressed'),'true')
    def test_failed_prepare_rolls_back_and_repeated_taps_do_not_skip_a_stage(self):
        self.boot();self.start();before=self.state()
        self.page.evaluate("()=>{window.realSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('disk full');return realSetItem.call(this,k,v)}}")
        self.click_step();self.assertEqual(self.state()['evas'],before['evas']);self.assertEqual(self.snapshot()['plan']['kind'],'prepare');self.assertIn('disk full',self.page.locator('#battleFeedback').inner_text())
        self.page.evaluate('Storage.prototype.setItem=realSetItem;document.getElementById("battleDo").click();document.getElementById("battleDo").click()');self.page.wait_for_function('!NERV_BATTLE.snapshot().busy');self.assertEqual(self.state()['evas'][1]['state'],'READY');self.assertEqual(self.snapshot()['plan']['kind'],'sortie')
    def test_failed_weapon_save_keeps_both_the_selected_picture_and_saved_weapon(self):
        self.boot();self.start();self.page.evaluate("()=>{const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('disk full');return old.call(this,k,v)}}")
        self.page.locator('[data-battle-weapon="positron"]').click();self.page.wait_for_function('!document.getElementById("shell").inert');self.assertEqual(self.page.evaluate('NERV_ENGAGEMENT.snapshot().weapon'),'knife');self.assertEqual(self.page.locator('[data-battle-weapon="knife"]').get_attribute('aria-pressed'),'true');self.assertEqual(self.state()['prefs']['selectedWeapon'],'knife')
    def test_live_power_loss_blocks_combat_and_opens_the_real_system_screen(self):
        self.boot();self.start();hp=self.state()['defense']['enemy']['hp'];self.view('infra','systems');self.page.locator('#powerToggle').click();self.view('battle','engage');self.assertEqual(self.snapshot()['plan']['route'],'infra/systems');self.click_step();self.assertEqual(self.page.evaluate('location.hash'),'#infra/systems');self.assertEqual(self.state()['defense']['enemy']['hp'],hp)
        self.boot();self.start();self.assertTrue(self.page.evaluate('NERV_OPERATIONS.external("start")')['ok']);self.view('battle','engage');self.assertEqual(self.snapshot()['plan']['route'],'magi/firewall');self.click_step();self.assertEqual(self.page.evaluate('location.hash'),'#magi/firewall')
    def test_switching_attacker_and_reload_preserve_shared_state_and_weapon(self):
        self.boot();self.start(weapon='rifle');self.view('battle','setup');self.page.locator('#battleUnit').select_option('2');self.page.wait_for_function('!document.getElementById("shell").inert');self.assertEqual(self.state()['tactics']['attacker'],2);self.assertEqual(self.state()['selectedEva'],2);self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('location.hash'),'#battle/setup');self.assertEqual(self.page.locator('#battleUnit').input_value(),'2');self.assertEqual(self.page.evaluate('NERV_ENGAGEMENT.snapshot().weapon'),'rifle')
        self.boot({'selectedEva':0,'evas':[{'state':'HANGAR','power':300},{'state':'POWER_LOST','power':0},{'state':'HANGAR','power':300}]});self.start();self.assertEqual(self.snapshot()['plan']['route'],'eva/control');self.click_step();self.assertEqual(self.page.evaluate('location.hash'),'#eva/control');self.assertEqual(self.state()['selectedEva'],1)
    def test_all_six_new_routes_fit_three_widths_and_restore_after_reload(self):
        self.boot()
        for p,v in ROUTES:
            self.view(p,v)
            for width in [320,390,430]:
                self.page.set_viewport_size({'width':width,'height':844});self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1,(p,v,width));self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150,(p,v,width))
            self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('location.hash'),'#'+p+'/'+v);self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),p);self.assertEqual(self.page.locator('.page.active .mobile-view:visible').get_attribute('data-view'),v)
    def test_history_back_and_forward_restore_the_major_page(self):
        self.boot();self.view('battle','engage');self.view('battle','setup');self.view('infra','streets');self.page.go_back();self.assertEqual(self.page.evaluate('location.hash'),'#battle/setup');self.assertEqual(self.snapshot()['page'],'battle');self.page.go_back();self.assertEqual(self.snapshot()['view'],'engage');self.page.go_forward();self.assertEqual(self.snapshot()['view'],'setup')
    def test_actual_instanced_meshes_retract_using_the_numeric_adapter(self):
        self.boot();self.view('battle','engage');self.page.wait_for_function('NERV_BATTLE.snapshot().stage.frames>0');a=self.snapshot()['stage'];self.assertEqual(a['renderer'],'webgl');self.assertEqual(a['instances'],207);self.assertEqual(a['batches'],6);self.assertLessEqual(a['drawCalls'],7);self.assertFalse(a['ownRAF']);self.defense('sector',0);self.defense('armor');b=self.snapshot()['stage'];self.assertEqual(b['resizes'],a['resizes']);self.assertAlmostEqual(b['firstMatrix']['height'],a['firstMatrix']['height']*.28,places=3);self.assertAlmostEqual(b['firstMatrix']['y'],a['firstMatrix']['y']*.28,places=3)
    def test_unavailable_webgl_and_low_quality_keep_svg_and_usable_commands(self):
        for no_gl,quality in [(True,'high'),(False,'low')]:
            self.boot({'prefs':{'showBoot':False,'motion':True,'fxQuality':quality}},moving=True,no_gl=no_gl);self.start();self.page.evaluate('NERV_MOTION.stopAll();NERV_FX.refresh()');self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'));self.assertEqual(self.snapshot()['stage']['renderer'],'svg');self.assertEqual(self.snapshot()['stage']['instances'],0);self.assertTrue(self.page.locator('.battle-city-fallback').is_visible());self.click_step();self.assertEqual(self.snapshot()['plan']['kind'],'sortie')
    def test_context_loss_falls_back_and_navigation_stops_gpu_rendering(self):
        self.boot(moving=True);self.view('battle','engage');self.page.wait_for_function('NERV_BATTLE.snapshot().stage.frames>0');self.page.evaluate("document.querySelector('.battle-city-webgl').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()");self.page.wait_for_function('NERV_BATTLE.snapshot().stage.lost');self.assertEqual(self.snapshot()['stage']['renderer'],'svg');self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().active'),0);self.open('home');frames=self.snapshot()['stage']['frames'];self.page.wait_for_timeout(200);self.assertEqual(self.snapshot()['stage']['frames'],frames)
    def test_engine_speed_persists_and_does_not_accelerate_world_time(self):
        self.boot();self.view('settings','motion');before=self.state()['world']['tick'];self.page.locator('[data-motion-speed="1.5"]').click();self.page.wait_for_function('NERV_MOTION.snapshot().speed===1.5');self.assertEqual(self.state()['world']['tick'],before);self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().speed'),1.5);self.page.evaluate('v216Now+=30000');self.assertTrue(self.page.evaluate('NERV_WORLD.advance()')['ok']);self.assertEqual(self.state()['world']['tick'],before+1)
    def test_replace_none_and_blend_are_bounded_and_reduced_motion_completes(self):
        self.boot(moving=True);self.view('battle','engage');self.page.evaluate("window.fxProbe={x:0};for(let i=0;i<8;i++)NERV_MOTION.animate('probe'+i,fxProbe,{x:[5,0],duration:600,ease:'outExpo',composition:'blend'},document.getElementById('battleStage'))")
        self.assertLessEqual(self.page.evaluate('NERV_MOTION.snapshot().active'),6);self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().ownRAF'),0);self.page.emulate_media(reduced_motion='reduce');self.page.wait_for_function('NERV_MOTION.snapshot().active===0');self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().active'),0);self.assertAlmostEqual(self.page.evaluate('fxProbe.x'),0,places=3);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))

