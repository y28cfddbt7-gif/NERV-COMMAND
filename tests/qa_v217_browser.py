"""Power recovery, real manual engagements, persistent tactics and Canvas effects."""
from browser_support import BrowserCase,RESULTS
import tactical_support as field
NOW=1800000000000
class V217Tests(BrowserCase):
    def boot(self,state=None,moving=False):
        if getattr(self,'booted',False):self.assertEqual(self.errors,[]);self.context.close();self.setUp()
        self.booted=True;self.page.add_init_script(f'window.fieldNow={NOW};Date.now=()=>fieldNow;')
        if moving:self.page.emulate_media(reduced_motion='no-preference')
        seed={'prefs':{'showBoot':False,'motion':moving,'staffComms':False}}
        if state:seed.update(state)
        self.load(seed);self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        for name in ['security','magiops','angel']:
            if self.state()['world'][{'security':'security','magiops':'magiOps','angel':'angels'}[name]]['auto']:self.assertTrue(self.page.evaluate('(a)=>NERV_WORLD.act(a)',name+'.toggle')['ok'])
    def start(self,angel='sachiel',weapon='knife',prepare=True):
        self.view('battle','targets');self.page.locator('[data-battle-target="'+angel+'"]').click();self.page.locator('#battleStart').click();field.wait(self)
        self.page.locator('[data-battle-weapon="'+weapon+'"]').click();field.wait(self)
        if prepare:
            for _ in range(3):
                if self.state()['evas'][self.state()['tactics']['attacker']]['state']=='DEPLOYED':break
                self.page.locator('#battleDo').click();field.wait(self)
    def act(self,a,p=None,ok=True):
        r=self.page.evaluate('([a,p])=>NERV_TACTICAL.act(a,p)',[a,p or {}]);self.assertEqual(r['ok'],ok,r);return r
    def test_four_encounters_are_won_by_manual_eva_attacks_without_city_fire(self):
        for angel,weapon in [('sachiel','knife'),('sachiel','rifle'),('shamshel','knife'),('ramiel','positron')]:
            with self.subTest(angel=angel,weapon=weapon):
                self.boot({'defense':{'city':[{'hp':100,'turret':True,'armor':False} for _ in range(4)]}});self.start(angel,weapon);self.assertEqual(self.page.evaluate('NERV_OPERATIONS.forecast().damage'),0);field.win(self,weapon)
                d=self.state()['defense'];self.assertEqual(d['status'],'victory');self.assertEqual(d['victoryCause'],'eva-'+weapon);self.assertFalse(any('地上迎撃 ' in h['txt'] for h in d['history']));self.assertEqual(len(self.state()['world']['angels']['history']),1)
                if weapon!='positron':self.assertFalse(self.state()['evas'][1]['umbilical']);self.assertGreater(self.state()['evas'][1]['power'],0)
    def test_lost_zero_battery_can_connect_and_enable_at_without_free_battery(self):
        self.boot({'evas':[{}, {'state':'POWER_LOST','power':0,'umbilical':False},{}]});self.start(prepare=False);self.assertFalse(self.page.locator('[data-tactical="cable"]').is_disabled());field.control(self,'cable');self.assertEqual(self.state()['evas'][1]['state'],'DEPLOYED');self.assertEqual(self.state()['evas'][1]['power'],0);self.act('scan');self.act('at');self.assertTrue(self.state()['evas'][1]['at']);self.act('cable');self.assertTrue(self.state()['evas'][1]['umbilical'])
    def test_zero_battery_external_power_wins_with_normal_eva_weapon(self):
        self.boot({'evas':[{}, {'state':'POWER_LOST','power':0,'umbilical':False},{}]});self.start(prepare=False);field.control(self,'cable');field.win(self,'knife');self.assertEqual(self.state()['defense']['status'],'victory');self.assertEqual(self.state()['evas'][1]['power'],0);self.assertEqual(self.state()['defense']['victoryCause'],'eva-knife')
    def test_power_or_comms_failure_does_not_create_a_fake_connection(self):
        self.boot({'infra':{'power':False},'evas':[{}, {'state':'POWER_LOST','power':0,'umbilical':False},{}]});self.view('battle','setup');self.assertTrue(self.page.locator('#battleCable').is_disabled());self.act('cable',ok=False);self.assertFalse(self.state()['evas'][1]['umbilical'])
    def test_wrong_aim_misses_and_consumes_ammo_then_correct_aim_hits(self):
        self.boot();self.start(weapon='rifle');self.act('scan');self.act('scan');field.move(self,0,2);field.move(self,1,1);self.act('at');self.act('neutralize');before=self.state();field.aim(self,.8,.1);field.fire(self);after=self.state();self.assertEqual(after['defense']['enemy']['hp'],before['defense']['enemy']['hp']);self.assertEqual(after['evaCombat']['ammo'],before['evaCombat']['ammo']-1);self.assertEqual(after['evaCombat']['tactical']['stats']['misses'],1);field.aim(self);field.fire(self);self.assertLess(self.state()['defense']['enemy']['hp'],before['defense']['enemy']['hp']);self.assertIn('命中',self.page.locator('#tacticalFeedback').inner_text())
    def test_enemy_telegraph_stays_locked_and_movement_evades_it(self):
        self.boot();self.start('ramiel','positron');self.assertEqual(self.page.evaluate('NERV_TACTICAL.snapshot().state.enemyPlan.columns'),[1]);field.move(self,0,2);t=self.page.evaluate('NERV_TACTICAL.snapshot().state');self.assertFalse(t['lastTurn']['threat']);self.assertEqual(t['lastTurn']['loss'],0);self.assertEqual(t['enemyPlan']['columns'],[0]);self.assertEqual(self.state()['evas'][1]['tacticalIntegrity'],100)
    def test_cover_and_guard_reduce_actual_damage(self):
        losses=[]
        for mode in ['exposed','cover','guard']:
            self.boot();self.start('ramiel','positron');
            if mode=='cover':field.move(self,0,2)
            self.act('guard' if mode=='guard' else 'focus');losses.append(self.page.evaluate('NERV_TACTICAL.snapshot().state.lastTurn.loss'))
        self.assertGreater(losses[0],losses[1]);self.assertGreater(losses[1],losses[2]);self.assertGreater(losses[2],0)
    def test_non_adjacent_move_and_unscanned_aim_do_not_spend_resources(self):
        self.boot();self.start();before=self.state();self.act('move',{'col':0,'row':1},False);self.act('aim',{'x':.5,'y':.19},False);self.assertEqual(self.state()['defense']['round'],before['defense']['round']);self.assertEqual(self.state()['evas'],before['evas'])
    def test_planning_clock_is_paused_but_actions_use_internal_power(self):
        self.boot();self.start();self.page.evaluate('fieldNow+=120000');self.page.wait_for_timeout(1100);self.assertEqual(self.state()['evas'][1]['power'],300);field.move(self,0,2);self.assertEqual(self.state()['evas'][1]['power'],282)
    def test_reload_restores_position_aim_and_enemy_plan(self):
        self.boot();self.start();self.act('scan');field.move(self,0,2);field.aim(self);before=self.page.evaluate('NERV_TACTICAL.snapshot().state');self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('NERV_TACTICAL.snapshot().state'),before);self.assertFalse(self.page.locator('#battleDo').is_visible());self.assertEqual(self.page.evaluate('location.hash'),'#battle/engage')
    def test_failed_save_rolls_back_movement_and_emits_no_shot_effect(self):
        self.boot();self.start();self.act('scan');before=self.state();self.page.evaluate("()=>{window.realFieldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('disk full');return realFieldSet.call(this,k,v)}}");self.act('move',{'col':0,'row':2},False);self.assertEqual(self.state()['evaCombat'],before['evaCombat']);self.assertEqual(self.state()['evas'],before['evas']);self.assertIsNone(self.page.evaluate('NERV_BATTLE.snapshot().tactical.effect'))
    def test_city_scenes_and_low_quality_fallback_have_no_visible_svg(self):
        self.boot({'prefs':{'showBoot':False,'motion':False,'fxQuality':'low'}})
        for p,v,canvas in [('infra','map','#tokyoCityCanvas'),('infra','streets','#tokyoStreetCanvas'),('battle','engage','.battle-city-fallback canvas')]:
            self.view(p,v);self.assertTrue(self.page.locator(canvas).is_visible());self.assertEqual(self.page.locator('.page.active svg:visible').count(),0);self.assertGreater(self.page.locator(canvas).evaluate('(c)=>c.getContext("2d").getImageData(10,10,1,1).data[3]'),0)
        self.assertEqual(self.page.evaluate('NERV_BATTLE.snapshot().stage.renderer'),'canvas')
    def test_visible_js_effects_draw_a_beam_and_persist_in_reduced_motion(self):
        self.boot();self.start('ramiel','positron');field.win(self,'positron');snap=self.page.evaluate('NERV_BATTLE.snapshot().tactical');self.assertEqual(snap['effect']['weapon'],'positron');self.assertTrue(snap['effect']['hit']);self.assertGreater(snap['effectFrames'],0);self.assertFalse(snap['ownRAF']);self.page.screenshot(path=str(RESULTS/'v217-positron-static.png'));self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
    def test_active_manual_ui_fits_three_phone_widths(self):
        self.boot();self.start();
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844});self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1);self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150);self.assertGreaterEqual(self.page.locator('[data-tactical="scan"]').bounding_box()['height'],44)
            for selector in ['.battle-stage .battle-eva','#battleAngelSprite']:
                box=self.page.locator(selector).bounding_box();self.assertAlmostEqual(box['width']/box['height'],.5,places=2)
    def test_keyboard_move_and_aim_are_available(self):
        self.boot();self.start();self.act('scan');c=self.page.locator('#battleTacticalCanvas');c.focus();c.press('m');c.press('ArrowUp');c.press('ArrowLeft');c.press('Enter');field.wait(self);self.assertEqual(self.page.evaluate('NERV_TACTICAL.snapshot().state.pos'),{'col':0,'row':2});c.press('a');c.press('Enter');field.wait(self);self.assertEqual(self.page.evaluate('NERV_TACTICAL.snapshot().state.aim.x'),.5)

    def test_failed_shot_persistence_restores_hp_ammo_and_emits_no_new_effect(self):
        self.boot();self.start(weapon='rifle');self.act('scan');self.act('scan');self.act('move',{'col':0,'row':2});self.act('move',{'col':1,'row':1});self.act('at');self.act('neutralize');self.act('aim',{'x':.5,'y':.19});before=self.state();effect=self.page.evaluate('NERV_BATTLE.snapshot().tactical.effect');self.page.evaluate("()=>{const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('disk full');return old.call(this,k,v)}}");self.act('fire',ok=False);self.assertEqual(self.state()['defense'],before['defense']);self.assertEqual(self.state()['evaCombat'],before['evaCombat']);self.assertEqual(self.page.evaluate('NERV_BATTLE.snapshot().tactical.effect'),effect)
    def test_future_tactical_data_is_preserved_and_activation_stops(self):
        self.boot({'evaCombat':{'tactical':{'schema':8,'opaque':'keep'}}});self.act('start',{'angel':'sachiel'},False);self.assertEqual(self.state()['evaCombat']['tactical'],{'schema':8,'opaque':'keep'});self.assertEqual(self.state()['defense']['status'],'idle')
    def test_corrupt_position_blocks_actions_without_crashing_or_resetting(self):
        self.boot();self.start();state=self.state();state['evaCombat']['tactical']['pos']={'col':8,'row':1};self.context.close();self.setUp();self.load(state);self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.act('scan',ok=False);self.assertEqual(self.state()['evaCombat']['tactical']['pos'],{'col':8,'row':1});self.assertEqual(self.errors,[])
    def test_motion_effect_frames_advance_and_stop_when_screen_is_hidden(self):
        self.boot(moving=True);self.start();self.act('scan');self.act('scan');self.act('move',{'col':0,'row':2});self.act('move',{'col':1,'row':1});self.act('at');self.act('neutralize');self.act('aim',{'x':.5,'y':.19});self.act('fire');a=self.page.evaluate('NERV_BATTLE.snapshot().tactical.effectFrames');self.page.wait_for_timeout(100);self.assertGreater(self.page.evaluate('NERV_BATTLE.snapshot().tactical.effectFrames'),a);self.page.screenshot(path=str(RESULTS/'v217-knife-motion.png'));self.open('home');frames=self.page.evaluate('NERV_BATTLE.snapshot().tactical.effectFrames');self.page.wait_for_timeout(120);self.assertEqual(self.page.evaluate('NERV_BATTLE.snapshot().tactical.effectFrames'),frames);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
    def test_classic_controls_cannot_skip_manual_aim_or_desync_position(self):
        self.boot();self.start();before=self.state()['evaCombat']['tactical']['pos'];self.assertFalse(self.page.evaluate('NERV_OPERATIONS.combat("approach")')['ok']);self.assertFalse(self.page.evaluate('NERV_OPERATIONS.combat("knife")')['ok']);self.assertEqual(self.state()['evaCombat']['tactical']['pos'],before)

    def test_holding_city_fire_does_not_hide_the_forecasted_city_damage(self):
        self.boot({'defense':{'status':'active','caseNo':1,'round':0,'scans':100,'enemy':{'hp':1,'maxHp':100,'dist':1,'lane':1,'force':31,'code':'SIM'},'city':[{'hp':100,'turret':True,'armor':False} for _ in range(4)]},'evas':[{}, {'state':'DEPLOYED','power':300,'umbilical':True},{}]});self.act('activate');f=self.page.evaluate('NERV_OPERATIONS.forecast()');self.assertEqual(f['damage'],0);self.assertGreater(f['loss'],0);before=self.state()['defense']['city'][1]['hp'];self.act('wait');self.assertEqual(before-self.state()['defense']['city'][1]['hp'],f['loss']);self.assertEqual(self.state()['defense']['status'],'active')
    def test_switching_case_clears_old_shot_visuals(self):
        self.boot();self.start('ramiel','positron');field.win(self,'positron');self.assertIsNotNone(self.page.evaluate('NERV_BATTLE.snapshot().tactical.effect'));self.view('battle','targets');self.page.locator('[data-battle-target="sachiel"]').click();self.page.locator('#battleStart').click();field.wait(self);self.assertIsNone(self.page.evaluate('NERV_BATTLE.snapshot().tactical.effect'));self.assertEqual(self.state()['defense']['enemy']['hp'],145)

    def test_existing_structural_damage_is_not_erased_on_activation(self):
        self.boot({'evas':[{}, {'state':'DEPLOYED','power':300,'umbilical':True,'damage':{'torso':35}},{}]});self.start(prepare=False);self.assertEqual(self.state()['evas'][1]['tacticalIntegrity'],65);self.assertEqual(self.state()['evas'][1]['damage']['torso'],35)
    def test_internal_clock_resumes_after_battle_victory(self):
        self.boot();self.start();field.win(self,'knife');before=self.state()['evas'][1]['power'];self.page.evaluate('fieldNow+=10000');self.page.wait_for_timeout(1100);self.assertLess(self.state()['evas'][1]['power'],before)
