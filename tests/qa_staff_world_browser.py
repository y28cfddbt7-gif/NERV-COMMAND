# Historical reducer controls may be hidden by the v2.19 public console.
# Their DOM events below check compatibility; current user interaction is in qa_v219_browser.
"""Stage-one staff work: causality, authority, bounded time, recovery and shared state."""
import copy
import unittest
from datetime import datetime,timezone
from browser_support import BrowserCase,RESULTS

BASE=1800000000000

class StaffWorldTests(BrowserCase):
    def boot(self,state=None):
        self.page.add_init_script(f'window.worldNow=Number(sessionStorage.getItem("worldTestNow"))||{BASE};Date.now=()=>window.worldNow;')
        seed={'prefs':{'showBoot':False,'staffComms':False,'motion':False,'eventPace':'exercise','magiFaultAuto':False}}
        if state:seed.update(state)
        self.load(seed);self.page.wait_for_function('NERV_WORLD.snapshot().ready');self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        # Isolate the historical cooling scenarios; new autonomous cases have their own suite.
        if self.page.evaluate('NERV_SECURITY.snapshot().auto'):self.assertTrue(self.page.evaluate('NERV_SECURITY.act("toggle")')['ok'])

    def world(self):return self.page.evaluate('NERV_WORLD.snapshot()')
    def act(self,action,ok=True):
        result=self.page.evaluate('(a)=>NERV_WORLD.act(a)',action)
        self.assertEqual(result['ok'],ok,result);return result
    def advance(self,seconds):
        self.page.evaluate('(s)=>{window.worldNow+=s*1000;sessionStorage.setItem("worldTestNow",String(window.worldNow))}',seconds)
        result=self.page.evaluate('NERV_WORLD.advance()');self.assertTrue(result['ok'],result)
    def fault(self):
        self.advance(360);self.advance(360)
        for _ in range(10):
            if self.world()['observed']['incident']:break
            self.advance(30)
        self.assertEqual(len([e for e in self.world()['world']['events'] if e['status']!='resolved']),1)

    def test_daily_work_can_be_received_checked_analyzed_and_reported_through_ui(self):
        self.boot();self.page.locator('[data-open="work"]').click()
        self.page.locator('.page.active [data-ops-route="work/jobs"]').click()
        for action in ['accept','inspect','analyze']:
            self.page.locator('[data-world-action="'+action+'"]').click()
            self.page.wait_for_function('()=>!document.getElementById("shell").inert')
        self.assertEqual(self.world()['world']['jobs'][0]['status'],'processing')
        self.assertIn('解析中',self.page.locator('#worldJobStatus').inner_text())
        self.act('report',False);self.advance(30)
        self.assertEqual(self.world()['world']['jobs'][0]['status'],'review')
        self.page.locator('[data-world-action="report"]').click()
        self.page.wait_for_function('NERV_WORLD.snapshot().world.jobs[0].status==="complete"')
        xp=self.state()['ops']['xp'];self.act('report',False)
        self.assertEqual(self.state()['ops']['xp'],xp)
        before=self.world()['world']['cooling']['load'];self.advance(30)
        self.assertLess(self.world()['world']['cooling']['load'],before)
        self.assertTrue(any('予防整備' in h['text'] for h in self.world()['world']['history']))

    def test_foreground_time_advances_without_any_user_command(self):
        self.page.clock.install(time=datetime(2027,1,15,tzinfo=timezone.utc))
        self.load({'prefs':{'showBoot':False,'staffComms':False,'motion':False,'eventPace':'exercise','magiFaultAuto':False}})
        self.page.wait_for_function('NERV_WORLD.snapshot().ready')
        before=self.world()['world']['cooling']['load']
        self.page.clock.fast_forward(31000)
        self.page.wait_for_function('NERV_WORLD.snapshot().world.tick>=1')
        self.assertGreater(self.world()['world']['cooling']['load'],before)
        self.assertEqual(self.world()['world']['eventSequence'],0)

    def test_causal_fault_does_not_duplicate_and_requires_technical_authorization(self):
        self.boot();self.fault();event=self.world()['observed']['incident'];self.assertEqual(event['status'],'detected')
        self.assertEqual(self.page.locator('#telemetryAlarm').inner_text(),'TACTICAL')
        self.act('diagnose',False);self.act('incidentReport',False)
        self.act('incidentAccept');self.act('isolate')
        self.assertTrue(self.world()['observed']['magiHold'])
        self.view('magi','request');self.assertTrue(self.page.locator('#magiVote').is_disabled())
        self.assertEqual(self.page.locator('#telemetryAlarm').inner_text(),'CRITICAL')
        self.page.locator('#commandAlertOpen').click();self.assertTrue(self.page.locator('#alertClear').is_disabled())
        self.page.locator('#alertTarget').click();self.assertEqual(self.page.evaluate('location.hash'),'#magi/main')
        self.act('diagnose');self.advance(30);self.assertEqual(self.world()['observed']['incident']['status'],'review')
        self.act('incidentReport');self.assertTrue(self.world()['observed']['magiHold'])
        self.advance(30);world=self.world()['world']
        self.assertIsNone(self.world()['observed']['incident']);self.assertFalse(self.world()['observed']['magiHold'])
        self.assertEqual(world['events'][0]['authorizedBy'],'赤木リツコ / 技術開発部')
        self.assertEqual(world['eventSequence'],1);self.assertEqual(world['cooling']['mode'],'normal')
        self.view('magi','request');self.assertFalse(self.page.locator('#magiVote').is_disabled())
        self.assertEqual(self.page.locator('#telemetryAlarm').inner_text(),'NOMINAL')
        self.assertIsNone(self.state()['magi']['approvedFor'])
        self.act('incidentReport',False);self.advance(30);self.assertEqual(self.world()['world']['eventSequence'],1)

    def test_fault_derives_from_real_magi_load_and_suspends_on_power_loss(self):
        self.boot();self.page.evaluate('NERV_OPERATIONS.external("start")')
        self.advance(30);self.assertEqual(self.world()['world']['cooling']['load'],26)
        self.view('infra','systems');self.page.locator('#powerToggle').click()
        self.advance(30);self.assertEqual(self.world()['world']['cooling']['load'],26)
        self.assertFalse(self.world()['observed']['power'])
        self.act('analyze',False)

    def test_hold_can_be_resumed_and_role_cannot_launch_or_globally_repair(self):
        self.boot();self.act('accept');self.act('inspect');self.act('hold')
        self.assertEqual(self.world()['world']['jobs'][0]['status'],'hold')
        self.act('accept');self.assertEqual(self.world()['world']['jobs'][0]['status'],'checked')
        before=self.state()
        for action in ['launch','setAuthority','repairAll','approveSortie']:self.act(action,False)
        self.assertEqual(self.state()['evas'],before['evas']);self.assertEqual(self.state()['defense'],before['defense'])
        self.assertEqual(self.world()['world']['jobs'][0]['status'],'checked')

    def test_world_and_existing_progress_survive_reload_during_analysis_and_incident(self):
        self.boot({'marker':{'future':True},'tasks':[{'id':'keep','text':'既存業務','done':False}]})
        self.act('accept');self.act('inspect');self.act('analyze')
        before=self.save_and_reload();self.page.wait_for_function('NERV_WORLD.snapshot().ready')
        self.assertEqual(self.world()['world']['jobs'],before['world']['jobs'])
        self.assertEqual(self.state()['marker'],{'future':True});self.assertEqual(self.state()['tasks'],before['tasks'])
        self.advance(30);self.act('report');self.fault();self.act('incidentAccept');self.act('isolate');self.act('diagnose')
        before=self.save_and_reload();self.page.wait_for_function('NERV_WORLD.snapshot().ready')
        self.assertEqual(self.world()['world']['events'],before['world']['events'])
        self.advance(30);self.act('incidentReport');self.advance(30)
        self.assertEqual(self.world()['world']['events'][0]['status'],'resolved')

    def test_long_absence_is_bounded_and_repeated_resume_does_not_replay_time(self):
        self.boot();original_city=self.state()['defense']['city'];self.advance(14*86400)
        world=self.world()['world'];self.assertEqual(world['tick'],12)
        self.assertGreater(world['reconciledSeconds'],1000000)
        before=copy.deepcopy(world);self.save_and_reload();self.page.wait_for_function('NERV_WORLD.snapshot().ready')
        self.assertEqual(self.world()['world']['tick'],before['tick'])
        self.assertEqual(self.world()['world']['eventSequence'],before['eventSequence'])
        self.assertEqual(self.state()['defense']['city'],original_city)

    def test_duplicate_corrupt_world_records_are_quarantined_and_normalized(self):
        self.boot({'futureTop':{'keep':1},'world':{'schema':1,'tick':'bad','lastSimAt':BASE,'cooling':{'load':74,'mode':'normal','future':9},'jobs':'broken','events':[None,{'id':'cooling-anomaly-1','kind':'magi-cooling','status':'diagnosing','diagnosticDue':None},{'id':'cooling-anomaly-1','kind':'magi-cooling','status':'detected'},{'id':'cooling-anomaly-2','kind':'magi-cooling','status':'accepted'}],'history':None,'communications':'bad'}})
        w=self.world()['world'];self.assertEqual(len(w['events']),1);self.assertEqual(w['events'][0]['status'],'isolated')
        self.assertEqual(w['cooling']['mode'],'isolated');self.assertEqual(w['cooling']['future'],9)
        self.assertEqual(self.state()['futureTop'],{'keep':1})
        self.assertTrue(self.page.evaluate('Object.keys(localStorage).some(k=>k.startsWith("nerv-command-v2-before-world-repair-"))'))
        original=self.page.evaluate('JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith("nerv-command-v2-before-world-repair-"))))')
        self.assertEqual(original['world']['events'][1]['status'],'diagnosing')
        self.assertEqual(original['world']['events'][1]['diagnosticDue'],None)
        self.assertTrue(any(h['kind']=='復元' for h in w['history']))

    def test_future_schema_is_preserved_and_cannot_be_downgraded(self):
        future={'schema':99,'unknownFuture':{'keep':5}}
        self.load({'prefs':{'showBoot':False,'staffComms':False},'world':future})
        self.page.wait_for_function('NERV_WORLD.snapshot().error.length>0')
        self.assertFalse(self.world()['ready']);self.assertEqual(self.state()['world'],future)
        self.assertFalse(self.page.evaluate('NERV_WORLD.act("accept")')['ok'])

    def test_full_json_corruption_recovers_last_good_and_preserves_raw_input(self):
        good={'prefs':{'showBoot':False,'staffComms':False},'tasks':[{'id':'retained','text':'控え','done':False}],'future':{'keep':3}}
        import json
        self.page.add_init_script('(function(){if(!sessionStorage.getItem("corruptSeed")){localStorage.setItem("nerv-command-v2","{broken-json");localStorage.setItem("nerv-command-v2-last-good",'+json.dumps(json.dumps(good))+');sessionStorage.setItem("corruptSeed","1")}})()')
        self.load();self.page.wait_for_function('NERV_WORLD.snapshot().ready')
        self.assertEqual(self.state()['future'],{'keep':3});self.assertEqual(self.state()['tasks'],good['tasks'])
        self.assertTrue(self.page.evaluate('Object.keys(localStorage).some(k=>k.includes("-corrupt-")&&localStorage.getItem(k)==="{broken-json")'))
        self.view('work','brief');self.assertIn('直前の正常保存',self.page.locator('#worldRecovery').inner_text())

    def test_failed_quarantine_blocks_overwrite_of_original_corrupt_save(self):
        self.page.add_init_script('localStorage.setItem("nerv-command-v2","{broken-json");const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.includes("-corrupt-"))throw Error("disk-full");return original.call(this,k,v)}')
        self.load();self.page.wait_for_function('NERV_WORLD.snapshot().error.length>0')
        self.assertFalse(self.world()['ready'])
        self.assertEqual(self.page.evaluate('localStorage.getItem("nerv-command-v2")'),'{broken-json')
        self.assertFalse(self.page.evaluate('NERV_WORLD.act("accept")')['ok'])

    def test_world_storage_failure_rolls_back_and_backup_failure_is_retryable(self):
        self.boot();before=self.world()['world']
        self.page.evaluate('()=>{window.previousSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="nerv-command-v2")throw Error("disk-full");return window.previousSet.call(this,k,v)}}')
        self.act('accept',False);self.assertEqual(self.world()['world'],before)
        self.page.evaluate('()=>{Storage.prototype.setItem=window.previousSet}')
        self.act('accept');self.assertEqual(self.world()['world']['jobs'][0]['status'],'accepted')

    def test_initial_world_backup_failure_preserves_state_and_retry_is_safe(self):
        self.page.add_init_script('window.previousSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith("nerv-command-v2-before-world"))throw Error("disk-full");return window.previousSet.call(this,k,v)}')
        self.load({'prefs':{'showBoot':False,'staffComms':False},'future':{'keep':8}})
        self.page.wait_for_function('NERV_WORLD.snapshot().error.length>0')
        self.assertNotIn('world',self.state());self.assertEqual(self.state()['future'],{'keep':8})
        self.page.evaluate('()=>{Storage.prototype.setItem=window.previousSet}')
        self.page.evaluate('NERV_WORLD.retry()');self.page.wait_for_function('NERV_WORLD.snapshot().ready')
        self.assertEqual(len(self.world()['world']['jobs']),1)
        self.assertEqual(self.state()['future'],{'keep':8})

    def test_multiple_views_use_the_same_actual_world_and_legacy_equipment(self):
        self.boot();self.act('accept');self.act('inspect');self.act('analyze')
        self.view('work','brief');a=self.page.locator('.page.active [data-world-readout="magi"]:visible').inner_text()
        self.view('magi','workflow');b=self.page.locator('.page.active [data-world-readout="magi"]:visible').inner_text()
        self.assertEqual(a,b);self.assertIn('解析中',a)
        self.view('infra','systems');self.page.locator('#commsToggle').click()
        self.view('work','departments');self.assertIn('通信 停止',self.page.locator('#worldDepartmentList').inner_text())
        self.assertFalse(self.world()['observed']['comms'])
        self.view('work','brief');self.assertIn('非常',self.page.locator('.page.active .mobile-view:visible [data-world-readout="alert"]:visible').inner_text())

    def test_home_direct_links_faces_666_game_and_projection_are_reachable(self):
        self.boot()
        self.assertTrue(self.page.locator('[data-ops-route="hq/comms"]').first.is_visible())
        self.page.locator('#commandLauncher [data-ops-route="hq/comms"]').click()
        self.assertEqual(self.page.locator('.hq-staff-picker [data-hq-staff]').count(),5)
        self.page.locator('[data-hq-staff="2"]').click();self.page.locator('#hqTalk').click()
        self.page.wait_for_function('NERV_TEST.getState().headquarters.messages[0].staff===2')
        self.open('home');self.page.locator('#commandLauncher [data-ops-route="magi/external"]').click()
        self.assertTrue(self.page.locator('#consoleMagiBoard').is_visible())
        self.page.locator('#externalStart').evaluate('(b)=>b.click()');self.page.wait_for_function('NERV_OPERATIONS.externalState().status==="detected"')
        for action in ['trace','trace','compile']:self.assertTrue(self.page.evaluate('(a)=>NERV_OPERATIONS.external(a)',action)['ok'])
        self.assertEqual(self.page.locator('#external666').get_attribute('data-active'),'true')
        self.view('hq','bridge');self.assertIn('投影',self.page.locator('#hqProjectionState').inner_text())
        self.assertTrue(self.page.locator('.page.active .mobile-view:visible [data-ops-route="hq/damage"]').is_visible())

    def test_legacy_city_failure_and_mission_share_the_world_alert_level(self):
        self.boot({'defense':{'city':[{'hp':0},{'hp':100},{'hp':100},{'hp':100}]}})
        self.assertEqual(self.world()['observed']['alert'],'非常')
        self.view('work','brief');self.assertEqual(self.page.locator('#telemetryAlarm').inner_text(),'CRITICAL')
        self.page.locator('#commandAlertOpen').click();self.page.locator('#alertClear').click()
        self.page.wait_for_function('NERV_WORLD.snapshot().observed.alert==="通常"')
        self.page.wait_for_function('()=>!document.getElementById("shell").inert')
        self.view('mission','orders');self.page.locator('#missionAction').evaluate('(b)=>b.click()')
        self.page.locator('#missionAction').evaluate('(b)=>b.click()')
        self.assertEqual(self.state()['mission']['phase'],2)
        self.save_and_reload();self.page.wait_for_function('NERV_WORLD.snapshot().ready')
        self.assertEqual(self.world()['observed']['alert'],'警戒')
        self.view('magi','workflow');self.assertEqual(self.page.locator('#telemetryAlarm').inner_text(),'TACTICAL')

    def test_all_staff_screens_fit_phone_widths_and_restore_routes(self):
        self.boot()
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for page,view in [('work',v) for v in ['brief','jobs','incidents','departments','communications','history']]+[('magi','workflow')]:
                with self.subTest(width=width,view=view):
                    self.view(page,view);self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),3)
        self.view('work','jobs');self.save_and_reload();self.page.wait_for_function('NERV_WORLD.snapshot().ready')
        self.assertEqual(self.page.evaluate('location.hash'),'#work/jobs');self.assertTrue(self.page.locator('#worldJobActions').is_visible())
        self.view('work','incidents');self.page.go_back();self.assertEqual(self.page.evaluate('location.hash'),'#work/jobs')
        self.page.set_viewport_size({'width':390,'height':844});self.page.screenshot(path=str(RESULTS/'v211-staff-work.png'),full_page=True)


if __name__=='__main__':unittest.main(verbosity=2)
