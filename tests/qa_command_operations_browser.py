"""EVA-only victories, shared city forecasts, real 666 turns, HQ and safe persistence."""
import json
import unittest
from browser_support import BrowserCase, RESULTS


class CommandOperationsTests(BrowserCase):
    def op(self, kind, action, argument=None):
        return self.page.evaluate('([k,a,v])=>NERV_OPERATIONS[k](a,v)',[kind,action,argument])

    def success(self, kind, action, argument=None):
        result=self.op(kind,action,argument)
        self.assertTrue(result['ok'],result)
        return result

    def ready(self, unit=1, case=0):
        self.page.add_init_script('Date.now=()=>1800000000000')
        self.load({'prefs':{'showBoot':False,'motion':False,'staffComms':False},
                   'mission':{'phase':1}, 'tactics':{'attacker':unit},
                   'defense':{'caseNo':case},
                   'evas':[{'state':'DEPLOYED' if i==unit else 'HANGAR',
                            'umbilical':True,'at':i==unit,'power':300,'sync':75} for i in range(3)]})
        for action in ['detect','scan','scan']:
            self.success('combat',action)

    def test_each_unit_can_win_each_scenario_with_no_city_armament(self):
        for unit in range(3):
            for case in range(3):
                with self.subTest(unit=unit,case=case):
                    if case or unit:
                        self.page.evaluate('localStorage.clear()')
                    self.ready(unit,case)
                    initial=self.state()
                    for action in ['approach','approach','neutralize','authorize','knife','authorize','knife']:
                        self.success('combat',action)
                    if self.state()['defense']['status']=='active':
                        for action in ['neutralize','authorize','knife']:
                            self.success('combat',action)
                    state=self.state()
                    self.assertEqual(state['defense']['status'],'victory')
                    self.assertEqual(state['defense']['wins'],1)
                    self.assertTrue(state['defense']['victoryCause'].startswith('eva-'))
                    self.assertEqual(state['defense']['enemy']['hp'],0)
                    self.assertTrue(all(not c['turret'] for c in state['defense']['city']))
                    self.assertTrue(state['defense']['lastAttackSource'].startswith('eva-'))
                    self.assertEqual(state['mission']['phase'],6)
                    self.assertEqual(state['ops']['missions'],1)
                    self.assertGreater(state['ops']['xp'],initial['ops']['xp'])
                    self.assertEqual(state['evas'][unit]['power'],300,'External power must preserve internal reserve')
                    self.assertFalse(self.op('combat','knife')['ok'])
                    self.assertEqual(self.state()['defense']['wins'],1)

    def test_combat_assignment_uses_existing_per_unit_cable_and_defender_rules(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False},'defense':{'connected':True},
                   'tactics':{'attacker':1,'defender':0},'evas':[
                       {'state':'DEPLOYED','umbilical':False,'power':300},
                       {'state':'DEPLOYED','umbilical':True,'power':300},{}]})
        self.view('mission','combat');self.page.locator('#combatUnit').select_option('0')
        self.page.wait_for_function('NERV_TEST.getState().tactics.attacker===0')
        state=self.state();self.assertEqual(state['selectedEva'],0)
        self.assertEqual(state['tactics']['defender'],1)
        self.assertFalse(state['defense']['connected'])
        self.assertFalse(state['evas'][0]['umbilical']);self.assertTrue(state['evas'][1]['umbilical'])
        self.assertEqual(self.page.locator('#staffAttackUnit').input_value(),'0')

    def test_rifle_requires_at_neutralization_then_wins_with_ammo_and_turn_cost(self):
        self.ready()
        before=self.state()['defense']['enemy']['hp']
        self.success('combat','authorize')
        self.assertFalse(self.op('combat','rifle')['ok'])
        self.assertEqual(self.state()['defense']['enemy']['hp'],before)
        self.assertEqual(self.state()['evaCombat']['ammo'],6)
        self.assertEqual(self.state()['defense']['round'],0)
        for action in ['approach','approach','neutralize','authorize','rifle','authorize','rifle']:
            self.success('combat',action)
        if self.state()['defense']['status']=='active':
            for action in ['neutralize','authorize','rifle']:self.success('combat',action)
        self.assertEqual(self.state()['defense']['status'],'victory')
        self.assertEqual(self.state()['defense']['lastAttackSource'],'eva-rifle')
        self.assertEqual(self.state()['evaCombat']['ammo'],3)
        self.assertEqual(self.state()['defense']['round'],6)

    def test_ordinary_combat_is_reachable_from_home_and_preserves_real_sortie_approval(self):
        self.load({'prefs':{'showBoot':False,'motion':False,'staffComms':False}})
        self.page.locator('[data-open="hq"]').click()
        self.page.locator('.page[data-page="hq"] [data-ops-route="mission/combat"]').click()
        self.page.locator('[data-combat="detect"]').click()
        self.page.wait_for_function('NERV_TEST.getState().defense.status==="active"')
        self.page.locator('[data-combat="scan"]').click()
        self.page.wait_for_function('NERV_TEST.getState().defense.scans>=34')
        self.assertFalse(self.op('combat','knife')['ok'])
        self.page.locator('#combatUnit').select_option('1')
        self.page.locator('#evaCombatPanel [data-ops-route="eva/control"]').click()
        self.page.wait_for_function('NERV_TEST.getState().selectedEva===1')
        self.view('eva','control');self.page.locator('#evaPrepare').click()
        self.view('magi','request');self.page.locator('#magiPurpose').select_option('sortie')
        self.page.locator('#magiVote').click()
        self.page.wait_for_function('NERV_TEST.getState().magi.approvedFor===1')
        self.view('eva','control');self.page.locator('#evaLaunch').click()
        self.page.wait_for_function('NERV_TEST.getState().evas[1].state==="DEPLOYED"')
        self.view('mission','combat');self.page.locator('[data-combat="at"]').click()
        self.page.wait_for_function('NERV_TEST.getState().evas[1].at')
        self.view('mission','engage')
        self.assertIn('EVA通常戦闘',self.page.locator('[data-command-stream="mission"]').inner_text())
        self.assertNotIn('都市防護を展開',self.page.locator('[data-command-stream="mission"]').inner_text())
        for action in ['approach','approach','neutralize','authorize','knife','authorize','knife']:
            self.success('combat',action)
        self.assertEqual(self.state()['defense']['status'],'victory')
        self.assertTrue(all(not c['turret'] for c in self.state()['defense']['city']))

    def test_no_free_attack_when_order_missing_at_not_neutralized_or_systems_offline(self):
        self.ready()
        before=self.state()
        self.assertFalse(self.op('combat','knife')['ok'])
        self.assertEqual(self.state()['defense'],before['defense'])
        self.assertEqual(self.state()['evas'],before['evas'])
        self.success('external','start')
        self.assertFalse(self.op('combat','authorize')['ok'])
        self.assertFalse(self.op('combat','approach')['ok'])
        self.assertTrue(self.page.locator('#magiVote').is_disabled())
        self.view('magi','external')
        stream=self.page.locator('[data-command-stream="magi"]').inner_text()
        self.assertNotIn('通常の出撃・迎撃審議が可能',stream)
        self.assertIn('ハッキング',stream)
        self.view('infra','systems');self.page.locator('#powerToggle').click()
        self.assertFalse(self.op('external','trace')['ok'])
        self.assertFalse(self.op('combat','approach')['ok'])

    def test_saving_mid_combat_preserves_window_ammo_damage_and_unknown_data(self):
        self.ready()
        for action in ['approach','approach','neutralize','authorize','rifle']:self.success('combat',action)
        before=self.save_and_reload()
        self.assertEqual(self.state()['evaCombat'],before['evaCombat'])
        self.assertEqual(self.state()['defense'],before['defense'])
        self.assertEqual(self.state()['evas'],before['evas'])
        self.success('combat','authorize');self.success('combat','knife')
        self.assertEqual(self.state()['defense']['status'],'victory')

    def test_666_requires_analysis_then_maintains_three_turns_and_awards_once(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False}})
        self.success('external','start')
        self.assertFalse(self.op('external','compile')['ok'])
        self.assertFalse(self.op('external','maintain')['ok'])
        self.assertEqual(self.state()['magi']['externalDefense']['turn'],0)
        for action in ['trace','trace','compile','maintain']:self.success('external',action)
        before=self.save_and_reload()
        self.assertEqual(self.state()['magi']['externalDefense'],before['magi']['externalDefense'])
        self.view('magi','external')
        self.assertEqual(self.page.locator('#external666').get_attribute('data-active'),'true')
        self.assertIn('1/3',self.page.locator('#external666Status').inner_text())
        self.success('external','maintain');self.success('external','maintain')
        state=self.state();self.assertEqual(state['magi']['externalDefense']['status'],'contained')
        self.assertEqual(state['magi']['externalDefense']['budget'],22)
        self.assertEqual(state['magi']['externalDefense']['resolved'],1)
        xp=state['ops']['xp'];self.assertFalse(self.op('external','maintain')['ok'])
        self.assertEqual(self.state()['ops']['xp'],xp)
        self.assertFalse(self.page.locator('#magiVote').is_disabled())
        self.assertIsNone(self.state()['magi']['approvedFor'])

    def test_666_commands_are_independent_and_reboot_reopens_external_connections(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False}})
        self.view('magi','external');self.page.locator('#externalStart').click()
        self.page.wait_for_function('NERV_TEST.getState().magi.externalDefense?.status==="detected"')
        self.page.locator('#externalMagiPanel [data-ops-route="magi/firewall"]').click()
        for action in ['trace','trace','compile','maintain']:
            self.page.locator('[data-external-action="'+action+'"]').click()
            self.page.wait_for_function('()=>!document.getElementById("shell").inert')
        self.assertEqual(self.state()['magi']['externalDefense']['hold'],1)
        self.success('external','reboot')
        x=self.state()['magi']['externalDefense']
        self.assertEqual(x['status'],'analyzed');self.assertEqual(x['hold'],0)
        self.assertFalse(self.op('external','maintain')['ok'])
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for route in [('magi','external'),('magi','firewall')]:
                self.view(*route)
                self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)
        self.page.reload(wait_until='domcontentloaded')
        self.assertEqual(self.page.evaluate('location.hash'),'#magi/firewall')
        self.assertTrue(self.page.locator('#externalControlPanel').is_visible())

    def test_partition_is_targeted_and_has_visible_resource_tradeoff(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False}})
        self.success('external','start');self.success('external','select',1)
        self.success('external','partition')
        x=self.state()['magi']['externalDefense']
        self.assertEqual(x['pressure'],[30,0,18]);self.assertEqual(x['budget'],90)
        self.assertEqual(x['turn'],1)
        for action in ['trace','trace','compile','maintain','maintain','maintain']:self.success('external',action)
        self.assertEqual(self.state()['magi']['externalDefense']['status'],'contained')

    def test_external_failure_routes_to_correct_screen_and_recovers_without_erasing_progress(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False},'unknownFuture':{'flag':17},
                   'personnel':{'extraStaffHistory':'retained'},'magi':{'externalDefense':{'resolved':2,'custom':'retained'}}})
        self.success('external','start')
        for _ in range(4):self.success('external','reboot')
        x=self.state()['magi']['externalDefense'];self.assertEqual(x['status'],'failed');self.assertEqual(x['failures'],1)
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844});self.view('magi','external')
            self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)
        self.open('home');self.page.locator('#commandAlertOpen').click();self.page.locator('#alertTarget').click()
        self.assertEqual(self.page.evaluate('location.hash'),'#magi/external')
        self.assertTrue(self.page.locator('#externalMagiPanel').is_visible())
        self.page.locator('#externalStart').click();self.page.locator('#alertContinue').click()
        self.assertEqual(self.state()['magi']['externalDefense']['status'],'failed')
        self.page.locator('#externalStart').click();self.page.locator('#alertClear').click()
        self.page.wait_for_function('NERV_TEST.getState().magi.externalDefense.status==="idle"')
        state=self.state();self.assertEqual(state['magi']['externalDefense']['resolved'],2)
        self.assertEqual(state['magi']['externalDefense']['custom'],'retained')
        self.assertEqual(state['unknownFuture'],{'flag':17})
        self.assertEqual(state['personnel']['extraStaffHistory'],'retained')
        backup=self.page.evaluate('JSON.parse(localStorage.getItem("nerv-command-v2-before-alert-clear"))')
        self.assertEqual(backup['magi']['externalDefense']['status'],'failed')

    def test_external_hacking_interrupts_battle_and_requires_fresh_orders_after_666(self):
        self.ready()
        for action in ['approach','approach','neutralize','authorize']:self.success('combat',action)
        before=self.state()['defense']
        self.success('external','start')
        self.assertFalse(self.op('combat','knife')['ok'])
        for action in ['trace','trace','compile','maintain','maintain','maintain']:self.success('external',action)
        self.assertEqual(self.state()['defense']['round'],before['round'])
        self.assertEqual(self.state()['defense']['enemy'],before['enemy'])
        self.assertFalse(self.op('combat','knife')['ok'],'Intrusion must invalidate old weapon approvals')
        for action in ['authorize','knife','authorize','knife']:self.success('combat',action)
        self.assertEqual(self.state()['defense']['status'],'victory')

    def test_storage_failure_rolls_back_gameplay_and_backup_failure_can_be_retried(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False}})
        self.page.evaluate('()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error("disk-full")};}')
        self.assertFalse(self.op('external','start')['ok'])
        self.assertNotIn('externalDefense',self.state()['magi'])
        self.page.evaluate('()=>{Storage.prototype.setItem=window.originalSet}')
        self.success('external','start')
        before=self.state()
        self.page.evaluate('()=>{Storage.prototype.setItem=function(k,v){if(k==="nerv-command-v2")throw Error("disk-full");return window.originalSet.call(this,k,v)}}')
        self.assertFalse(self.op('external','trace')['ok'])
        self.assertEqual(self.state()['magi'],before['magi'])
        self.assertEqual(self.state()['ops'],before['ops'])
        self.page.evaluate('()=>{Storage.prototype.setItem=window.originalSet}')
        self.success('external','trace')
        backup=self.page.evaluate('JSON.parse(localStorage.getItem("nerv-command-v2-before-visual-upgrade"))')
        self.assertNotIn('externalDefense',backup['magi'])

    def test_missile_and_cannon_forecasts_match_real_turn_cost_damage_and_damage_shutdown(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False}})
        self.defense('detect');self.defense('scan');self.defense('sector',0);self.defense('turret')
        seed=self.state();damage={}
        for mode in ['cannon','missile']:
            self.page.evaluate('(s)=>localStorage.setItem("nerv-command-v2",JSON.stringify(s))',seed)
            self.page.reload(wait_until='domcontentloaded');self.view('infra','weapons')
            self.page.locator('#weaponSector').select_option('0')
            self.page.locator('[data-city-weapon="'+mode+'"]').click()
            self.page.wait_for_function('(m)=>NERV_TEST.getState().cityArmament?.modes?.[0]===m',arg=mode)
            forecast=self.page.evaluate('NERV_OPERATIONS.forecast()')
            self.defense('advance');state=self.state()['defense']
            self.assertEqual(state['energy'],forecast['energy'])
            self.assertEqual(seed['defense']['enemy']['hp']-state['enemy']['hp'],forecast['damage'])
            damage[mode]=(forecast['damage'],forecast['energy'])
        self.assertGreater(damage['missile'][0],damage['cannon'][0]);self.assertEqual(damage['missile'][1],damage['cannon'][1]-2)
        seed['defense']['city'][0]['hp']=20;seed['cityArmament']={'modes':['missile','cannon','cannon']}
        self.page.evaluate('(s)=>localStorage.setItem("nerv-command-v2",JSON.stringify(s))',seed)
        self.page.reload(wait_until='domcontentloaded')
        self.assertEqual(self.page.evaluate('NERV_OPERATIONS.forecast().shots'),0)

    def test_headquarters_damage_faces_dialogue_ack_and_routes_survive_reload(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False},'defense':{'city':[{'hp':40},{'hp':70},{'hp':100},{'hp':30}]}})
        self.view('hq','city');self.assertEqual(self.page.locator('.hq-city').get_attribute('data-damage'),'damaged')
        self.view('hq','geofront');self.assertEqual(self.page.locator('.page[data-page="hq"] [data-view="geofront"] .hq-geofront').get_attribute('data-damage'),'critical')
        self.assertIn('30%',self.page.locator('#hqGeoBrief').inner_text())
        self.view('hq','comms')
        for index,name in enumerate(['葛城ミサト','赤木リツコ','伊吹マヤ','日向マコト','青葉シゲル']):
            self.page.locator('[data-hq-staff="'+str(index)+'"]').click()
            self.page.locator('#hqTalk').click()
            self.page.wait_for_function('(i)=>NERV_TEST.getState().headquarters?.messages?.[0].staff===i',arg=index)
            self.assertEqual(self.page.locator('#hqStaffName').inner_text(),name)
            self.assertEqual(self.page.locator('#hqStaffFace').get_attribute('data-staff'),str(index))
        self.page.locator('#hqAcknowledge').click();self.page.wait_for_function('NERV_TEST.getState().headquarters.messages[0].ack')
        before=self.save_and_reload();self.assertEqual(self.page.evaluate('location.hash'),'#hq/comms')
        self.assertEqual(self.state()['headquarters'],before['headquarters'])
        self.view('hq','damage');self.page.locator('#hqDamageList button').nth(3).click()
        self.assertEqual(self.state()['defense']['selected'],3)
        self.assertEqual(self.page.evaluate('location.hash'),'#infra/facilities')
        self.page.go_back();self.assertEqual(self.page.evaluate('location.hash'),'#hq/damage')

    def test_random_staff_communication_obeys_preference_and_cooldown(self):
        self.page.add_init_script('Math.random=()=>0;window.hqNow=1800000000000;Date.now=()=>hqNow')
        self.load({'prefs':{'showBoot':False,'staffComms':True}})
        self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.view('hq','bridge');self.assertEqual(len(self.state().get('headquarters',{}).get('messages',[])),0)
        self.page.evaluate('hqNow+=600001');self.view('hq','city')
        self.page.wait_for_function('NERV_TEST.getState().headquarters?.messages?.length===1')
        self.view('hq','city');self.view('hq','bridge')
        self.assertEqual(len(self.state()['headquarters']['messages']),1)
        self.view('hq','comms')
        self.assertIn('葛城ミサト',self.page.locator('#hqStaffName').inner_text())
        self.assertNotEqual(self.page.locator('#hqDialogue').inner_text(),'通信待機。')

    def test_webgl_projection_stops_when_hidden_and_when_reduced_motion_is_requested(self):
        self.page.add_init_script('window.projectionDraws=0;const originalDraw=WebGLRenderingContext.prototype.drawArrays;WebGLRenderingContext.prototype.drawArrays=function(...args){window.projectionDraws++;return originalDraw.apply(this,args)}')
        self.page.emulate_media(reduced_motion='no-preference')
        self.load({'prefs':{'showBoot':False,'staffComms':False,'motion':True}})
        self.view('hq','bridge')
        self.assertEqual(self.page.locator('#hqProjection').get_attribute('data-renderer'),'webgl')
        self.page.wait_for_function('window.projectionDraws>2')
        self.open('home');before=self.page.evaluate('window.projectionDraws')
        self.page.wait_for_timeout(160)
        self.assertEqual(self.page.evaluate('window.projectionDraws'),before)
        self.page.emulate_media(reduced_motion='reduce');self.view('hq','bridge')
        before=self.page.evaluate('window.projectionDraws');self.page.wait_for_timeout(160)
        self.assertEqual(self.page.evaluate('window.projectionDraws'),before)

    def test_webgl_unavailable_falls_back_and_all_new_screens_fit_iphone_widths(self):
        self.page.add_init_script('const oldContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...rest){return k==="webgl"?null:oldContext.call(this,k,...rest)}')
        self.load({'prefs':{'showBoot':False,'motion':False,'staffComms':False}})
        self.assertEqual(self.page.locator('#hqProjection').get_attribute('data-renderer'),'css')
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for page,view in [('hq',v) for v in ['bridge','city','geofront','damage','comms']]+[('mission','combat'),('mission','engage'),('magi','external'),('magi','firewall'),('infra','weapons')]:
                with self.subTest(width=width,page=page,view=view):
                    self.view(page,view)
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),3)
                    self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)
            self.view('hq','bridge');self.page.screenshot(path=str(RESULTS/f'v210-hq-{width}.png'),full_page=True)
        self.view('hq','comms');self.page.screenshot(path=str(RESULTS/'v210-command-staff.png'),full_page=True)


if __name__=='__main__':unittest.main(verbosity=2)
