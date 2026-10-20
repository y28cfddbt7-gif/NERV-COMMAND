"""Current public console: real AP combat, diagnosis puzzles, rollback and migration.
Earlier UI layouts remain historical; these tests exercise v2.19 public controls.
"""
from browser_support import BrowserCase, RESULTS

class V219Tests(BrowserCase):
    def boot(self, state=None):
        if getattr(self,'booted',False):self.assertEqual(self.errors,[]);self.context.close();self.setUp()
        self.booted=True;self.page.add_init_script('window.consoleNow=1800000000000;Date.now=()=>consoleNow')
        seed={'prefs':{'showBoot':False,'motion':False,'staffComms':False,'securityAuto':False,'magiFaultAuto':False}}
        if state:seed.update(state)
        self.load(seed);self.page.wait_for_function('NERV_WORLD.snapshot().ready && NERV_CITY_ART.snapshot().ready && NERV_MESSAGES.snapshot().ready')
    def cmd(self,system,action,payload=None,ok=True):
        r=self.page.evaluate('([s,a,p])=>NERV_CONSOLE[s](a,p)',[system,action,payload or {}]);self.assertEqual(r['ok'],ok,r);return r
    def b(self,a,p=None,ok=True):return self.cmd('battle',a,p,ok)
    def m(self,a,p=None,ok=True):return self.cmd('magi',a,p,ok)
    def snap(self):return self.page.evaluate('NERV_CONSOLE.snapshot()')
    def idle(self):self.page.wait_for_function('!document.getElementById("shell").inert')
    def click(self,selector):self.page.locator(selector).click();self.idle()
    def start(self,angel='sachiel',weapon='knife',cable=True):
        self.view('battle','setup');self.click('[data-battle-target="'+angel+'"]');self.click('#battleStart');self.click('[data-console-battle="prepare"]');self.click('[data-console-battle="approve"]');self.click('#consoleToMap');self.assertEqual(self.page.evaluate('location.hash'),'#battle/deploy');self.click('[data-console-weapon="'+weapon+'"]')
        if not cable:self.page.locator('#consoleDeployCable').uncheck();self.idle()
        self.click('#consoleDeploy');self.assertEqual(self.page.evaluate('location.hash'),'#battle/engage')
    def observe(self):
        for i in range(3):self.m('observe',{'index':i})
    def step(self):
        self.page.evaluate('consoleNow+=30000');r=self.page.evaluate('NERV_WORLD.advance(consoleNow)');self.assertTrue(r['ok'],r)
    def patch(self,kind):
        c=self.snap()['magi']['context'];d=c['data'];key=c['key'];bad=d['damagedBus'] if kind=='power' else (d['caseNo']+d['hold'])%3 if kind=='external' else sum(ord(x) for x in key)%3
        if kind in ['power','cooling']:
            good=[i for i in range(3) if i!=bad];routes={bad:2,good[0]:0,good[1]:1}
        else:routes={i:1 if i==bad else 0 for i in range(3)}
        for i,out in routes.items():self.m('route',{'index':i,'value':out})
        return bad
    def aim(self,x=.5,y=.19):
        self.b('mode',{'mode':'attack'});box=self.page.locator('#battleTacticalCanvas').bounding_box();self.page.mouse.click(box['x']+box['width']*x,box['y']+box['height']*y);self.idle()
    def move(self,col,row):
        self.b('mode',{'mode':'move'});box=self.page.locator('#battleTacticalCanvas').bounding_box();self.page.mouse.click(box['x']+box['width']*(.5+(col-1)*(.17+row*.045)),box['y']+box['height']*(.34+row*.17));self.idle()
    def win(self,weapon):
        self.b('scan');self.b('scan')
        if weapon=='positron':
            self.move(0,3);self.b('charge');self.b('charge')
            if self.state()['defense']['energy']<40:self.b('supply')
            self.aim();self.click('#tacticalFire');return
        self.move(0,2);self.move(0,1);self.b('at');self.b('neutralize')
        for _ in range(5):
            if self.state()['defense']['status']!='active':return
            if self.state()['evaCombat']['exposedUntil']<=self.state()['defense']['round']:self.b('neutralize')
            self.aim();self.click('#tacticalFire')
    def test_approval_deployment_and_aim_are_enforced_and_three_public_tabs_remain(self):
        self.boot();self.view('battle','engage');self.assertEqual(self.page.evaluate('location.hash'),'#battle/setup');self.b('start',{'angel':'sachiel'});before=self.state();self.b('deploy',ok=False);self.b('fire',ok=False);self.assertEqual(self.state()['defense'],before['defense']);self.assertEqual(self.page.locator('.battle-page .mobile-tabs button').count(),3)
        self.b('prepare');self.b('approve');self.b('placement');self.b('weapon',{'weapon':'positron'});self.b('deploymentCable',{'connected':False});self.b('deploy',ok=False);self.assertEqual(self.state()['evas'][1]['state'],'READY');self.b('deploymentCable',{'connected':True});self.b('deploy');self.b('fire',ok=False)
    def test_all_three_weapons_win_using_eva_and_city_guns_stay_held(self):
        for angel,weapon in [('sachiel','knife'),('sachiel','rifle'),('shamshel','knife'),('ramiel','positron')]:
            with self.subTest(angel=angel,weapon=weapon):
                self.boot({'defense':{'city':[{'hp':100,'turret':True,'armor':False} for _ in range(4)]}});self.start(angel,weapon);self.assertEqual(self.page.evaluate('NERV_OPERATIONS.forecast().damage'),0);self.win(weapon);s=self.state();self.assertEqual(s['defense']['status'],'victory');self.assertEqual(s['defense']['victoryCause'],'eva-'+weapon);self.assertFalse(any('地上迎撃 ' in x['txt'] for x in s['defense']['history']));self.assertGreater(s['evaCombat']['tactical']['stats']['hits'],0)
    def test_two_ap_lock_telegraph_and_one_enemy_phase_per_turn(self):
        self.boot();self.start('ramiel','positron');before=self.state();plan=before['evaCombat']['tactical']['enemyPlan'];self.move(0,2);mid=self.state();self.assertEqual(mid['defense']['round'],0);self.assertEqual(self.snap()['battle']['ap'],1);self.assertEqual(mid['evaCombat']['tactical']['enemyPlan'],plan);self.b('scan');after=self.state();self.assertEqual(after['defense']['round'],1);self.assertEqual(self.snap()['battle']['ap'],2);self.assertFalse(after['evaCombat']['tactical']['lastTurn']['threat']);self.assertEqual(after['evas'][1]['tacticalIntegrity'],100)
    def test_internal_and_zero_internal_external_power_both_allow_victory(self):
        self.boot();self.start(cable=False);self.win('knife');self.assertEqual(self.state()['defense']['victoryCause'],'eva-knife');self.assertGreater(self.state()['evas'][1]['power'],0)
        self.boot({'evas':[{}, {'state':'DEPLOYED','power':0,'umbilical':True},{}]});self.b('start',{'angel':'sachiel'});self.b('adopt');self.b('deploy');self.view('battle','engage');self.win('knife');self.assertEqual(self.state()['defense']['victoryCause'],'eva-knife');self.assertEqual(self.state()['evas'][1]['power'],0)
    def test_missed_aim_costs_ammo_and_guard_resolves_real_enemy_damage(self):
        self.boot();self.start(weapon='rifle');self.b('scan');self.b('scan');self.move(0,2);self.move(0,1);self.b('at');self.b('neutralize');before=self.state();self.aim(.8,.1);self.click('#tacticalFire');after=self.state();self.assertEqual(after['defense']['enemy']['hp'],before['defense']['enemy']['hp']);self.assertEqual(after['evaCombat']['ammo'],before['evaCombat']['ammo']-1);self.assertEqual(after['evaCombat']['tactical']['stats']['misses'],1)
        self.b('guard');self.assertTrue(self.state()['evaCombat']['tactical']['lastTurn']['guard']);self.assertLessEqual(self.state()['evaCombat']['tactical']['lastTurn']['loss'],5)
    def test_save_failure_rolls_back_ap_position_and_fires_no_effect(self):
        self.boot();self.start();before=self.state();self.page.evaluate("()=>{window.consoleSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('disk full');return consoleSet.call(this,k,v)}}");self.b('move',{'col':0,'row':2},False);self.assertEqual(self.state()['operatorConsole'],before['operatorConsole']);self.assertEqual(self.state()['evaCombat'],before['evaCombat']);self.assertIsNone(self.page.evaluate('NERV_BATTLE.snapshot().tactical.effect'))
    def test_reload_keeps_ap_position_and_magi_context_while_old_routes_redirect(self):
        self.boot();self.start();self.move(0,2);before=self.snap()['battle'];self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.snap()['battle'],before);self.assertEqual(self.page.evaluate('location.hash'),'#battle/engage')
        self.m('start',{'kind':'power'});self.observe();self.patch('power');m=self.snap()['magi'];self.view('magi','maintenance-tools');self.assertEqual(self.page.evaluate('location.hash'),'#magi/main');self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.snap()['magi'],m);self.assertEqual(self.page.locator('.page[data-page="magi"]>.mobile-tabs button').count(),3)
    def test_clock_checksum_and_bus_require_different_real_adjustments(self):
        for kind in ['clock','checksum','power']:
            with self.subTest(kind=kind):
                self.boot();self.m('start',{'kind':kind});self.m('diagnose',ok=False);self.observe();self.m('diagnose');self.assertEqual(self.snap()['magi']['context']['stage'],'diagnosing');self.step();self.m('validate',ok=kind!='power');self.assertEqual(self.snap()['magi']['context']['stage'],'work')
                if kind=='clock':
                    for i,n in enumerate(self.snap()['magi']['context']['data']['offsets']):self.m('adjust',{'index':i,'value':-n})
                elif kind=='checksum':
                    self.m('copy',{'index':2});self.m('validate');self.assertEqual(self.snap()['magi']['context']['stage'],'work');self.m('copy',{'index':0})
                else:self.patch(kind)
                self.m('validate');self.assertEqual(self.snap()['magi']['context']['stage'],'validated');self.m('report');self.assertEqual(self.snap()['magi']['context']['stage'],'reported');self.step();self.assertEqual(self.snap()['magi']['context']['kind'],'normal');self.assertEqual(len(self.state()['world']['magiOps']['archive']),1)
    def test_adaptive_intrusion_requires_routing_signature_and_program_order(self):
        self.boot();self.m('start',{'kind':'adaptive'});self.m('isolate',ok=False);self.observe();self.patch('adaptive');self.m('isolate');self.m('analyze',ok=False);self.m('mask',{'bit':1});self.m('mask',{'bit':2});self.m('analyze');self.m('select',{'index':2})
        for token in ['terminate','observe','bound']:self.m('program',{'token':token})
        self.m('compile',ok=False);self.m('program',{'token':'clear'})
        for token in ['bound','observe','terminate']:self.m('program',{'token':token})
        self.m('compile');self.m('execute');self.assertEqual(self.state()['magi']['intrusion']['status'],'contained');self.assertEqual(self.snap()['magi']['context']['kind'],'normal')
    def test_666_requires_independent_traces_allocations_and_repatch_each_pulse(self):
        self.boot();self.view('magi','main');self.m('start',{'kind':'external'});self.observe();self.m('trace');self.m('trace',ok=False);self.m('select',{'index':1});self.m('trace');self.patch('external');self.m('compile',ok=False)
        for i in range(3):self.m('allocation',{'index':i,'value':10})
        self.m('compile');self.assertTrue(self.page.locator('.console-666').is_visible());self.page.screenshot(path=str(RESULTS/'v219-666.png'),full_page=True)
        for hold in range(3):
            if hold:self.m('maintain',ok=False);self.observe();self.patch('external')
            pressure=self.snap()['magi']['context']['data']['pressure'];self.m('select',{'index':pressure.index(max(pressure))});self.m('maintain')
        self.assertEqual(self.state()['magi']['externalDefense']['status'],'contained');self.assertEqual(self.state()['magi']['externalDefense']['hold'],3)
    def test_cooling_needs_two_safe_paths_and_balanced_flows_before_timed_approval(self):
        self.boot();self.m('start',{'kind':'cooling'});self.observe();self.m('accept');self.m('isolate',ok=False);self.patch('cooling');self.m('isolate');self.m('diagnose',ok=False);self.m('flow',{'index':0,'value':50});self.m('flow',{'index':1,'value':50});self.m('diagnose');self.step();self.m('report');self.step();self.assertEqual(self.snap()['magi']['context']['kind'],'normal')
    def test_failed_magi_save_rolls_back_routes_and_unknown_schema_is_preserved(self):
        self.boot();self.m('start',{'kind':'external'});before=self.state();self.page.evaluate("()=>{window.consoleSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('disk full');return consoleSet.call(this,k,v)}}");self.m('route',{'index':0,'value':1},False);self.assertEqual(self.state()['operatorConsole'],before['operatorConsole'])
        self.boot({'operatorConsole':{'schema':99,'opaque':{'keep':True}}});self.m('start',{'kind':'clock'},False);self.b('start',{'angel':'sachiel'},False);self.assertEqual(self.state()['operatorConsole'],{'schema':99,'opaque':{'keep':True}});self.assertTrue(self.snap()['error'])
    def test_fixed_painted_scenes_and_console_controls_fit_three_phone_widths(self):
        self.boot();self.start();
        for mode in ['move','attack','guard']:
            self.b('mode',{'mode':mode});self.view('battle','engage')
            for width in [320,390,430]:
                self.page.set_viewport_size({'width':width,'height':844});self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1);self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1250)
            self.assertEqual(self.page.locator('.battle-city-fallback canvas').get_attribute('data-artwork'),'raster');self.assertEqual(self.page.locator('#battleTacticalCanvas').evaluate('c=>getComputedStyle(c).backgroundColor'),'rgba(0, 0, 0, 0)')
        self.page.screenshot(path=str(RESULTS/'v219-battle.png'),full_page=True);self.view('magi','main');self.m('start',{'kind':'external'});self.observe();
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844});self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1);self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1500);self.assertGreaterEqual(self.page.locator('[data-console-magi="observe"]').bounding_box()['height'],44)
        self.page.screenshot(path=str(RESULTS/'v219-magi.png'),full_page=True);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
    def test_normal_magi_keeps_selected_eva_and_displays_actual_named_votes(self):
        self.boot({'selectedEva':0,'evas':[{'state':'READY','power':300},{},{}]});self.view('magi','main');self.click('[data-console-magi="vote"]');self.assertEqual(self.state()['magi']['approvedFor'],0);self.assertEqual(self.state()['magi']['vote']['count'],2);values=self.page.locator('#consoleMagiBoard .console-core-value').all_text_contents();self.assertEqual(values,['AGREE','AGREE','DENY']);self.assertEqual(self.page.locator('#consoleMagiUnit').input_value(),'0')
        self.page.locator('#consoleMagiUnit').select_option('1');self.idle();self.click('[data-console-magi="vote"]');self.assertFalse(self.state()['magi']['vote']['approved']);self.assertEqual(self.state()['magi']['vote']['eva'],1)
    def test_old_hash_aliases_replace_history_and_back_keeps_forward_entry(self):
        self.boot();self.view('work','brief');self.page.evaluate('location.hash="#work/incidents"');self.page.wait_for_function('location.hash==="#magi/main"');size=self.page.evaluate('history.length');self.view('infra','map');self.assertEqual(self.page.evaluate('history.length'),size+1);self.page.go_back();self.page.wait_for_function('location.hash==="#magi/main"');self.assertEqual(self.page.evaluate('history.length'),size+1);self.page.go_forward();self.page.wait_for_function('location.hash==="#infra/map"');self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),'infra')
    def test_canvas_unavailable_still_has_core_measurements_and_accessible_routes(self):
        self.page.add_init_script("const ctx=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t==='2d'?null:ctx.call(this,t,...a)}");self.boot();self.view('magi','main');self.m('start',{'kind':'external'});self.observe();self.page.locator('.console-routing details').evaluate('d=>d.open=true');self.assertEqual(self.page.locator('[data-console-route]:visible').count(),3);self.assertTrue(self.page.locator('#consoleMagiBoard svg').is_visible());self.assertEqual(self.errors,[])
    def test_explicit_recovery_clears_active_console_only_and_preserves_history(self):
        self.boot({'operatorConsole':{'schema':1,'battle':None,'magi':None,'history':[],'extension':'keep'}});self.view('magi','main');self.m('start',{'kind':'external'});self.observe();history=self.state()['operatorConsole']['history']
        for _ in range(4):self.assertTrue(self.page.evaluate('NERV_OPERATIONS.external("reboot")')['ok'])
        self.click('#consoleRecovery');self.click('#alertClear');self.page.wait_for_function('NERV_OPERATIONS.externalState().status==="idle"');c=self.state()['operatorConsole'];self.assertIsNone(c['battle']);self.assertIsNone(c['magi']);self.assertEqual(c['history'],history);self.assertEqual(c['extension'],'keep')
