"""Operational city, named Angels, maintenance repairs, field investigation and quiet cadence."""
import copy
from datetime import datetime,timezone
from browser_support import BrowserCase
NOW=1800000000000
ROUTES=[('magi','maintenance'),('magi','maintenance-tools'),('magi','maintenance-settings'),('magi','maintenance-history'),('work','case-library'),('work','fieldwork'),('work','field-records'),('work','security-control'),('work','security-response'),('mission','angels'),('mission','engagement'),('settings','cadence')]

class V215Tests(BrowserCase):
    def boot(self,state=None,auto=False,moving=False):
        if getattr(self,'booted',False):self.assertEqual(self.errors,[]);self.context.close();self.setUp()
        self.booted=True
        self.page.add_init_script(f'window.v215Now=Number(sessionStorage.getItem("v215Now"))||{NOW};Date.now=()=>window.v215Now;')
        if moving:self.page.emulate_media(reduced_motion='no-preference')
        seed={'prefs':{'showBoot':False,'motion':moving,'staffComms':False}}
        if state:seed.update(state)
        self.load(seed);self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        if not auto:
            if self.sec()['auto']:self.act('security.toggle')
            if self.maintenance()['auto']:self.act('magiops.toggle')
            if self.state()['world']['angels']['auto']:self.act('angel.toggle')
    def act(self,a,ok=True):
        r=self.page.evaluate('(a)=>NERV_WORLD.act(a)',a);self.assertEqual(r['ok'],ok,r);return r
    def sec(self):return self.page.evaluate('NERV_SECURITY.snapshot()')
    def maintenance(self):return self.page.evaluate('NERV_V215.maintenance()')
    def step(self,seconds=30):
        self.page.evaluate('(n)=>{v215Now+=n*1000;sessionStorage.setItem("v215Now",String(v215Now))}',seconds);self.assertTrue(self.page.evaluate('NERV_WORLD.advance()')['ok'])
    def field(self,kind='access'):
        self.act('security.operation.'+kind);self.act('security.accept');self.act('security.camera')
        first=self.sec()['case']['fieldwork']['records'][-1]['text'];hub=2 if '整備通路' in first else 1
        self.act('security.node.'+str(hub));self.act('security.trace');second=self.sec()['case']['fieldwork']['records'][-1]['text'];goal=5 if '送電区画' in second else 4
        self.act('security.node.'+str(goal));self.act('security.patrol');self.step()
        for n in [0,hub,goal]:self.act('security.route.'+str(n))
        self.act('security.verify');self.assertTrue(self.sec()['case']['fieldwork']['verified']);self.act('security.analyze');self.step();return goal

    def test_default_idle_is_calm_and_security_is_not_generated_after_three_minutes(self):
        self.boot(auto=True);self.assertEqual(self.page.evaluate('NERV_V215.pacing().mode'),'balanced');self.step(360)
        w=self.state()['world'];self.assertIsNone(w['security']['case']);self.assertIsNone(w['magiOps']['active']);self.assertLess(w['cooling']['load'],20);self.assertGreaterEqual(w['security']['nextDueTick'],40)
    def test_cadence_choices_persist_and_never_remove_an_active_case(self):
        self.boot();self.act('security.operation.access');case=copy.deepcopy(self.sec()['case']);self.act('pace.quiet');self.assertEqual(self.sec()['case'],case);self.assertEqual(self.page.evaluate('NERV_V215.pacing().mode'),'quiet');self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('NERV_V215.pacing().mode'),'quiet')
    def test_automatic_cases_wait_for_the_configured_interval_and_do_not_stack(self):
        self.boot(auto=True)
        for _ in range(4):self.step(300)
        self.assertEqual(self.sec()['case']['kind'],'access');self.assertIn('fieldwork',self.sec()['case']);self.assertIsNone(self.maintenance()['active'])
        self.act('security.accept');self.act('security.camera');self.act('security.escalate');self.act('security.report');self.step();self.assertIsNone(self.sec()['case']);self.assertEqual(self.sec()['nextDueTick'],self.state()['world']['tick']+60)
    def test_three_maintenance_faults_require_real_adjustments_and_upper_approval(self):
        for kind in ['clock','checksum','power']:
            with self.subTest(kind=kind):
                self.boot();self.act('magiops.start.'+kind);self.assertTrue(self.page.evaluate('NERV_WORLD.snapshot().observed.magiHold'));self.act('magiops.validate',False);self.act('magiops.diagnose');self.step();a=self.maintenance()['active'];self.assertEqual(a['stage'],'work')
                if kind=='clock':
                    for i,n in enumerate(a['offsets']):self.act('magiops.adjust.'+str(i)+'.'+str(-n))
                elif kind=='power':self.act('magiops.feed.'+str(a['damagedBus']))
                else:
                    for i in range(3):self.act('magiops.inspect.'+str(i))
                    self.act('magiops.copy.0')
                self.act('magiops.validate');self.assertEqual(self.maintenance()['active']['stage'],'validated');self.act('magiops.report');self.assertIsNotNone(self.maintenance()['active']);self.step();self.assertIsNone(self.maintenance()['active']);self.assertEqual(self.maintenance()['archive'][0]['authorizedBy'],'赤木リツコ / 技術開発部');self.assertFalse(self.page.evaluate('NERV_WORLD.snapshot().observed.magiHold'))
    def test_incorrect_clock_and_stale_copy_cannot_be_certified(self):
        self.boot();self.act('magiops.start.clock');self.act('magiops.diagnose');self.step();self.act('magiops.validate');self.assertEqual(self.maintenance()['active']['stage'],'work');self.act('magiops.report',False)
        self.boot();self.act('magiops.start.checksum');self.act('magiops.diagnose');self.step()
        for i in range(3):self.act('magiops.inspect.'+str(i))
        self.act('magiops.copy.2');self.act('magiops.validate');self.assertEqual(self.maintenance()['active']['stage'],'work')
    def test_redundant_power_requires_two_healthy_feeds(self):
        self.boot();self.act('magiops.start.power');self.act('magiops.diagnose');self.step();bad=self.maintenance()['active']['damagedBus'];self.act('magiops.feed.'+str(bad));self.act('magiops.feed.'+str((bad+1)%3));self.act('magiops.validate');self.assertEqual(self.maintenance()['active']['stage'],'work')
    def test_power_loss_pauses_diagnosis_and_progress_survives_restart(self):
        self.boot();self.act('magiops.start.clock');self.act('magiops.diagnose');self.view('infra','systems');self.page.locator('#powerToggle').click();self.step();self.assertEqual(self.maintenance()['active']['stage'],'diagnosing');before=self.maintenance();self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.maintenance(),before);self.page.locator('#powerToggle').click();self.step();self.assertEqual(self.maintenance()['active']['stage'],'work')
    def test_future_magi_schema_is_kept_and_migration_stops(self):
        self.load({'prefs':{'showBoot':False},'world':{'schema':1,'magiOps':{'schema':8,'opaque':'keep'}}});self.page.wait_for_function('NERV_WORLD.snapshot().error.length>0');self.assertEqual(self.state()['world']['magiOps'],{'schema':8,'opaque':'keep'})
    def test_maintenance_save_failure_rolls_back_controls(self):
        self.boot();self.act('magiops.start.clock');self.act('magiops.diagnose');self.step();before=self.maintenance();self.page.evaluate('''()=>{const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('disk full');return old.call(this,k,v)}}''');self.act('magiops.adjust.1.-4',False);self.assertEqual(self.maintenance(),before)
    def test_six_field_scenarios_can_be_solved_using_records_route_and_gates(self):
        for kind in ['access','sabotage','audit','relay','cargo','decoy']:
            with self.subTest(kind=kind):
                self.boot();goal=self.field(kind);self.act('security.gate.'+str(goal));self.act('security.seal');self.act('security.hold');self.act('security.report');self.step();self.assertIsNone(self.sec()['case']);self.assertEqual(self.sec()['archive'][0]['fieldwork']['method'],'local-sector-hold')
    def test_records_are_required_and_a_wrong_route_is_not_verified(self):
        self.boot();self.act('security.operation.access');self.act('security.accept');self.act('security.evidence.badge',False);self.act('security.analyze',False)
        for n in [0,2,5]:self.act('security.route.'+str(n))
        self.act('security.verify');self.assertFalse(self.sec()['case']['fieldwork']['verified']);self.act('security.gate.3',False)
    def test_independent_record_quarantine_has_exactly_one_power_cost(self):
        self.boot();self.field('audit');energy=self.state()['defense']['energy'];self.act('security.quarantine');self.assertEqual(self.state()['defense']['energy'],energy-6);self.act('security.quarantine',False);self.assertEqual(self.state()['defense']['energy'],energy-6);self.act('security.report');self.step();self.assertEqual(self.sec()['archive'][0]['fieldwork']['method'],'independent-record-quarantine')
    def test_legitimate_passage_can_be_escorted_after_independent_verification(self):
        self.boot({'world':{'schema':1,'security':{'schema':1,'sequence':3}}});self.field('access');self.assertEqual(self.sec()['case']['variant'],1);self.act('security.escort');self.assertIsNotNone(self.sec()['case']['fieldwork']['pendingResolution']);self.step();self.assertEqual(self.sec()['case']['decision'],'release');self.act('security.report');self.step();self.assertEqual(self.sec()['archive'][0]['fieldwork']['method'],'supervised-passage')
    def test_security_team_handoff_waits_two_updates(self):
        self.boot();self.field('relay');self.act('security.handoff');self.step();self.assertEqual(self.sec()['case']['stage'],'analyzed');self.step();self.assertEqual(self.sec()['case']['stage'],'decision');self.act('security.report');self.step();self.assertEqual(self.sec()['archive'][0]['fieldwork']['method'],'security-team-handoff')
    def test_a_delayed_patrol_does_not_reopen_a_reported_case(self):
        self.boot();self.act('security.operation.access');self.act('security.accept');self.act('security.camera');self.act('security.node.4');self.act('security.patrol');self.act('security.escalate');self.act('security.report');self.step();self.assertIsNone(self.sec()['case']);self.assertEqual(len(self.sec()['archive']),1)
    def test_field_state_and_drawn_route_restore_without_duplicate_records(self):
        self.boot();self.field();before=self.sec();self.view('work','security-control');self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.sec(),before);self.assertEqual(self.page.evaluate('location.hash'),'#work/security-control')
    def test_named_angels_are_defeatable_with_eva_without_city_weapons(self):
        for angel,weapon in [('sachiel','knife'),('sachiel','rifle'),('shamshel','knife'),('ramiel','positron')]:
            with self.subTest(angel=angel,weapon=weapon):
                self.boot({'evas':[{'state':'DEPLOYED','sync':75,'umbilical':True,'power':300} for _ in range(3)]});self.act('angel.start.'+angel);self.view('mission','engagement');self.page.evaluate('(w)=>NERV_ENGAGEMENT.selectWeapon(w)',weapon)
                for _ in range(30):
                    if self.state()['defense']['status']!='active':break
                    before=self.state()['defense']['round'];n=self.page.evaluate('NERV_ENGAGEMENT.next()')
                    self.assertFalse(n and n.get('route'),n)
                    self.page.locator('#engagementNext' if n else '#engagementFire').evaluate('(b)=>b.click()');self.page.wait_for_function('!document.getElementById("shell").inert')
                d=self.state()['defense'];self.assertEqual(d['status'],'victory');self.assertTrue(all(not c['turret'] for c in d['city']));self.assertEqual(len(self.state()['world']['angels']['history']),1);self.assertEqual(self.state()['world']['angels']['history'][0]['angel'],angel)
    def test_ramiel_prevents_an_unsupported_close_approach_and_city_gun_victory(self):
        self.boot({'evas':[{'state':'DEPLOYED','sync':75,'umbilical':True,'power':300} for _ in range(3)]});self.act('angel.start.ramiel');self.assertIn('ラミエル',str(self.page.evaluate('NERV_OPERATIONS.combatConditions("knife")')));self.assertFalse(self.page.evaluate('NERV_OPERATIONS.combat("approach")')['ok']);self.assertEqual(self.page.evaluate('NERV_OPERATIONS.forecast().damage'),0)
    def test_selected_weapon_remains_visible_and_persists_on_restart(self):
        self.boot();self.view('mission','engagement');self.page.locator('[data-engagement-weapon="positron"]').evaluate('(b)=>b.click()');self.assertIn('ポジトロン',self.page.locator('#engagementSelected').inner_text());self.assertIn('ポジトロン',self.page.locator('#engagementFire').inner_text());self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('NERV_ENGAGEMENT.snapshot().weapon'),'positron')
    def test_city_terrain_has_real_facility_damage_and_unchanged_selection_routes(self):
        self.boot();self.view('infra','defense');self.assertGreater(self.page.evaluate('NERV_CITY.snapshot().buildings'),60)
        for i in range(4):self.page.locator('#v27Facilities [data-v27pick="'+str(i)+'"]').click();self.assertEqual(self.state()['defense']['selected'],i)
        self.assertTrue(self.page.locator('#tokyoCityCanvas').is_visible());self.assertFalse(self.page.locator('#v27IsoMap').is_visible());self.assertEqual(self.page.locator('#mapEva1').count(),1)
    def test_anime_uses_the_shared_scheduler_and_finishes_on_hide_or_reduced_motion(self):
        self.boot(moving=True);self.view('infra','defense');self.page.locator('#tokyoCityCanvas').scroll_into_view_if_needed();self.page.evaluate('NERV_V27_TEST.sector(0)');self.page.evaluate('NERV_V27_TEST.armor()');self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().ownRAF'),0);self.assertFalse(self.page.evaluate('NERV_MOTION.snapshot().defaultMainLoop'));self.assertTrue(self.page.locator('#tokyoCityCanvas').is_visible())
        self.page.evaluate('v215Now+=700');self.page.wait_for_timeout(100);self.assertAlmostEqual(self.page.evaluate('NERV_CITY.snapshot().ratios[0]'),.28,places=2);self.open('home');self.assertEqual(self.page.evaluate('NERV_MOTION.snapshot().active'),0);self.page.emulate_media(reduced_motion='reduce');self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
    def test_new_routes_fit_three_phone_widths_with_real_emergency_content(self):
        self.boot();self.act('magiops.start.clock');self.act('magiops.diagnose');self.step()
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for p,v in ROUTES:
                self.view(p,v);self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1,(p,v,width));self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150,(p,v,width))
    def test_every_new_route_restores_after_a_fresh_reload(self):
        self.boot()
        for p,v in ROUTES:
            with self.subTest(page=p,view=v):
                self.view(p,v);canonical=self.page.evaluate('location.hash');actual=self.page.locator('.page.active .mobile-view:visible').get_attribute('data-view');self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('location.hash'),canonical);self.assertEqual(self.page.locator('.page.active .mobile-view:visible').get_attribute('data-view'),actual)
    def test_shared_communication_cadence_prevents_startup_and_cross_channel_spam(self):
        self.page.clock.install(time=datetime.fromtimestamp(NOW/1000,timezone.utc));self.boot({'prefs':{'showBoot':False,'motion':False,'staffComms':True}})
        self.page.evaluate('v215Now+=95000');self.page.clock.fast_forward(95000)
        state=self.state();self.assertEqual(sum(len(t['messages']) for t in state['personalMessages']['threads'].values() if 'messages' in t),0);self.assertEqual(len(state['personnel'].get('messages',[])),0)
        self.page.evaluate('v215Now+=660000');self.page.clock.fast_forward(660000);self.page.wait_for_timeout(100)
        state=self.state();count=sum(len(t['messages']) for t in state['personalMessages']['threads'].values() if 'messages' in t)+len(state['personnel'].get('messages',[]))+len(state.get('headquarters',{}).get('messages',[]));self.assertEqual(count,1)
    def test_future_fieldwork_schema_stops_migration_without_destroying_the_case(self):
        self.load({'prefs':{'showBoot':False},'world':{'schema':1,'security':{'schema':1,'case':{'id':'SEC-1','kind':'access','stage':'accepted','fieldwork':{'schema':7,'opaque':'keep'}}}}});self.page.wait_for_function('NERV_WORLD.snapshot().error.length>0');self.assertEqual(self.state()['world']['security']['case']['fieldwork'],{'schema':7,'opaque':'keep'})
    def test_field_route_can_be_drawn_by_touch_and_verified_without_hidden_state(self):
        self.boot();self.act('security.operation.access');self.act('security.accept');self.view('work','fieldwork');self.page.locator('[data-security-action="camera"]').click();self.page.wait_for_function('NERV_SECURITY.snapshot().case.evidence.length===1');self.page.locator('#fieldObservationMap [data-field-node="1"]').click();self.page.locator('[data-security-action="trace"]').click();self.page.wait_for_function('NERV_SECURITY.snapshot().case.evidence.length===2');self.page.locator('#fieldObservationMap [data-field-node="4"]').click();self.page.locator('[data-security-action="patrol"]').click();self.page.wait_for_function('!!NERV_SECURITY.snapshot().case.fieldwork.patrol');self.step();self.view('work','security-control')
        for n in [0,1,4]:self.page.locator('#fieldControlMap [data-field-node="'+str(n)+'"]').click();self.page.wait_for_function('!document.getElementById("shell").inert')
        self.page.locator('[data-security-action="verify"]').click();self.page.wait_for_function('NERV_SECURITY.snapshot().case.fieldwork.verified');self.assertIn('経路一致',self.page.locator('#fieldRouteInfo').inner_text())
