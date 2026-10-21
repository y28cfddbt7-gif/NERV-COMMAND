"""Native-AI bridge simulation, causal security cases and named visual effects on real Chromium pages."""
import copy
import unittest
from datetime import datetime,timezone
from browser_support import BrowserCase,RESULTS
NOW=1800000000000

class V214Tests(BrowserCase):
    def boot(self,state=None,auto=False,moving=False):
        if getattr(self,'booted',False):
            self.assertEqual(self.errors,[]);self.context.close();self.setUp()
        self.booted=True
        self.page.add_init_script(f'window.v214Now=Number(sessionStorage.getItem("v214Now"))||{NOW};Date.now=()=>window.v214Now;')
        if moving:self.page.emulate_media(reduced_motion='no-preference')
        seed={'prefs':{'showBoot':False,'staffComms':False,'motion':moving,'eventPace':'exercise','magiFaultAuto':False}}
        if state:seed.update(state)
        self.load(seed);self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        if not auto and self.sec()['auto']:self.action('toggle')
    def sec(self):return self.page.evaluate('NERV_SECURITY.snapshot()')
    def pm(self):return self.page.evaluate('NERV_MESSAGES.snapshot().state')
    def action(self,action,ok=True):
        result=self.page.evaluate('(a)=>NERV_SECURITY.act(a)',action);self.assertEqual(result['ok'],ok,result);return result
    def step(self,seconds=30):
        self.page.evaluate('(n)=>{window.v214Now+=n*1000;sessionStorage.setItem("v214Now",String(window.v214Now))}',seconds)
        self.assertTrue(self.page.evaluate('NERV_WORLD.advance()')['ok'])
    def contact(self,id):
        self.page.evaluate('(id)=>NERV_MESSAGES.open(id)',id);self.page.wait_for_function('()=>!document.getElementById("shell").inert')
    def send(self,text):
        self.assertTrue(self.page.evaluate('(text)=>NERV_MESSAGES.send(text)',text)['ok']);self.page.evaluate('window.v214Now+=2000;sessionStorage.setItem("v214Now",String(window.v214Now))');self.page.evaluate('NERV_MESSAGES.pulse()')
    def host(self,defer=False,error=False,reply=None):
        self.page.evaluate('''(opts)=>{
          window.aiHost={enabled:true,generation:0,defer:opts.defer,error:opts.error,reply:opts.reply||{text:'僕も少し、話してみたいです。',suggestion:null},requests:[],deferred:[],fail:false};window.__SCRIPTABLE__=true;
          const status=()=>({available:true,configured:true,enabled:aiHost.enabled,generation:aiHost.generation,host:'provider.example',model:'mock-model',endpoint:'https://provider.example/v1/responses'});
          const finish=job=>window.__nervDeliver(job.id,aiHost.error?{error:'HTTP 429'}:{ok:true,reply:aiHost.reply,model:'mock-model',generation:aiHost.generation});
          window.releaseAI=()=>{for(const job of aiHost.deferred.splice(0))finish(job);};
          window.__nervQueue.push=function(job){queueMicrotask(()=>{
            if(job.action==='aiReply'){aiHost.requests.push(job);if(aiHost.defer)aiHost.deferred.push(job);else finish(job);return;}
            if(job.action==='aiStatus')return __nervDeliver(job.id,status());
            if(job.action==='aiConfigure'){aiHost.enabled=!aiHost.enabled;aiHost.generation++;return __nervDeliver(job.id,status());}
            if(job.action==='persist'){if(aiHost.fail)return __nervDeliver(job.id,{error:'disk full'});localStorage.setItem('nerv-command-v2',JSON.stringify(job.payload.state));}
            __nervDeliver(job.id,{ok:true});
          });return 1;};
        }''',{'defer':defer,'error':error,'reply':reply})
        self.page.evaluate('NERV_AI.refresh()')
    def replied(self):
        self.page.wait_for_function('NERV_MESSAGES.snapshot().state.pending.length===0',timeout=5000)
        id=self.page.evaluate('NERV_MESSAGES.snapshot().contact');return self.pm()['threads'][id]['messages'][-1]
    def investigate(self,kind='access'):
        self.action('start.'+kind);self.action('accept')
        for key in {'access':['badge','camera','route'],'sabotage':['signature','relay','handover'],'audit':['seal','hash','channel']}[kind]:self.action('evidence.'+key)
        self.action('analyze');self.step();self.assertEqual(self.sec()['case']['stage'],'analyzed')

    def test_api_settings_are_addressable_and_browser_stays_offline_without_keys(self):
        self.boot();self.view('messages','ai');self.assertTrue(self.page.locator('#personnelAIConfigure').is_disabled());self.assertIn('Scriptable',self.page.locator('#personnelAIEndpoint').inner_text());self.assertFalse(self.page.evaluate('NERV_AI.snapshot().status.enabled'))
        self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('location.hash'),'#messages/ai')
    def test_opted_in_ai_receives_only_current_character_context_and_persists_reply(self):
        self.boot();self.contact('shinji');self.host();before=self.state();self.send('今日はどう過ごしたい？');r=self.replied();self.assertEqual(r['transport'],'ai');self.assertIn('mock-model',r['model'])
        requests=self.page.evaluate('aiHost.requests');self.assertEqual(len(requests),1);self.assertEqual(requests[0]['payload']['context']['character']['id'],'shinji');self.assertNotIn('magi',requests[0]['payload']['context']['world']);self.assertEqual(len(requests[0]['payload']['context']['history']),1)
        for key in ['defense','evas','world','magi']:self.assertEqual(self.state()[key],before[key])
        self.assertEqual(self.pm()['threads']['shinji']['memory']['turn'],1);self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.pm()['threads']['shinji']['messages'][-1],r)
    def test_ai_failure_invalid_schema_and_mutation_proposal_fall_back_without_world_writes(self):
        for reply,error in [({'text':'実行','suggestion':'launch'},False),({'text':'x'*321},False),({'text':'拒否','state':{'power':False}},False),(None,True)]:
            with self.subTest(reply=reply,error=error):
                self.boot();self.contact('rei');self.host(error=error,reply=reply);before=self.state();self.send('こんにちは');r=self.replied();self.assertEqual(r['transport'],'offline-fallback');self.assertNotEqual(r['text'],'実行');self.assertEqual(self.state()['world'],before['world']);self.assertEqual(self.state()['evas'],before['evas'])
    def test_ai_suggestion_opens_existing_review_screen_and_never_executes_it(self):
        self.boot();self.contact('maya');self.host(reply={'text':'担当画面で要件を確かめましょう。','suggestion':'analysis-review'});before=self.state()['world'];self.send('今日の予定を考えたい');r=self.replied();self.assertEqual(r['proposal']['route'],'work/jobs');self.assertEqual(self.state()['world'],before)
        self.page.locator('#messageProposal button').click();self.assertEqual(self.page.evaluate('location.hash'),'#work/jobs');self.assertEqual(self.state()['world'],before)
    def test_pending_ai_keeps_controls_and_draft_responsive_and_stale_reply_is_discarded(self):
        self.boot();self.contact('shinji');self.host(defer=True);self.send('こんにちは');self.assertTrue(self.page.evaluate('NERV_AI.snapshot().busy'))
        self.page.locator('#messageText').fill('入力中の下書き');self.page.locator('#messageText').focus();self.assertTrue(self.page.evaluate('NERV_OPERATIONS.external("start")')['ok']);self.page.evaluate('releaseAI()');r=self.replied()
        self.assertEqual(r['transport'],'offline-fallback');self.assertEqual(r['mode'],'critical');self.assertNotIn('少し、話してみたい',r['text']);self.assertEqual(self.page.locator('#messageText').input_value(),'入力中の下書き');self.assertEqual(self.page.evaluate('document.activeElement.id'),'messageText')
    def test_restart_does_not_repeat_a_billable_pending_ai_request(self):
        self.boot();self.contact('shinji');self.host(defer=True);self.send('こんにちは');self.assertTrue(self.pm()['pending'][0]['aiAttempted']);self.assertEqual(self.page.evaluate('aiHost.requests.length'),1)
        self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.page.evaluate('NERV_MESSAGES.pulse()');r=self.replied();self.assertEqual(r['transport'],'offline-fallback');self.assertFalse(self.page.evaluate('NERV_AI.snapshot().busy'))
    def test_api_timeout_falls_back_and_a_late_response_cannot_duplicate_messages(self):
        self.page.clock.install(time=datetime.fromtimestamp(NOW/1000,timezone.utc));self.boot();self.contact('shinji');self.host(defer=True);self.send('こんにちは');self.assertTrue(self.page.evaluate('NERV_AI.snapshot().busy'))
        self.page.clock.fast_forward(16000);r=self.replied();self.assertEqual(r['transport'],'offline-fallback');self.page.evaluate('releaseAI()');self.page.evaluate('NERV_MESSAGES.pulse()');self.assertEqual(len(self.pm()['threads']['shinji']['messages']),2)

    def test_api_off_during_request_immediately_returns_to_offline(self):
        self.boot();self.contact('shinji');self.host(defer=True);self.send('こんにちは');self.view('messages','ai');self.page.locator('#personnelAIConfigure').click();self.page.wait_for_function('!NERV_AI.snapshot().status.enabled');self.page.evaluate('NERV_MESSAGES.pulse()');self.assertEqual(self.pm()['threads']['shinji']['messages'][-1]['transport'],'offline-fallback');self.page.evaluate('releaseAI()');self.assertEqual(len(self.pm()['threads']['shinji']['messages']),2)
    def test_emergency_and_operation_requests_do_not_use_ai(self):
        self.boot({'mission':{'phase':1}});self.contact('maya');self.host();self.send('こんにちは');self.assertEqual(self.replied()['mode'],'watch');self.assertEqual(self.page.evaluate('aiHost.requests.length'),0)
        self.send('解析を依頼して');self.replied();self.assertEqual(self.page.evaluate('aiHost.requests.length'),0)
    def test_ai_receive_failure_keeps_cached_reply_for_exactly_once_retry(self):
        self.boot();self.contact('shinji');self.host(defer=True);self.send('こんにちは');before=copy.deepcopy(self.pm());self.page.evaluate('aiHost.fail=true;releaseAI()');self.page.wait_for_function('!NERV_AI.snapshot().busy');self.assertEqual(self.pm(),before)
        self.page.evaluate('aiHost.fail=false');self.page.evaluate('NERV_MESSAGES.pulse()');r=self.replied();self.assertEqual(r['transport'],'ai');self.page.evaluate('NERV_MESSAGES.pulse()');self.assertEqual(len(self.pm()['threads']['shinji']['messages']),2);self.assertEqual(self.page.evaluate('aiHost.requests.length'),1)
    def test_autonomous_security_trigger_and_all_three_case_families_are_causal(self):
        self.boot({'world':{'schema':1,'cooling':{'load':0}}},auto=True);self.step(180);self.assertEqual(self.sec()['case']['kind'],'access');self.assertEqual(self.sec()['sequence'],1);self.page.evaluate('NERV_WORLD.advance()');self.assertEqual(self.sec()['sequence'],1);self.assertEqual(self.page.locator('#telemetryAlarm').inner_text(),'TACTICAL')
        self.action('accept');self.action('camera');self.action('escalate');self.action('report');self.step();self.assertIsNone(self.sec()['case']);self.step(300);self.assertEqual(self.sec()['case']['kind'],'sabotage')
        self.action('accept');self.action('camera');self.action('escalate');self.action('report');self.step();self.step(300);self.assertEqual(self.sec()['case']['kind'],'audit')
    def test_intruder_evidence_decision_and_authorized_resolution_are_operable(self):
        self.boot();self.investigate();self.view('work','evidence');self.assertIn('一致しません',self.page.locator('#securityEvidence').inner_text());self.action('evidence.badge',False);self.action('hold');self.action('report');self.assertEqual(self.sec()['case']['stage'],'reported');self.step();self.assertIsNone(self.sec()['case']);self.assertEqual(self.sec()['archive'][0]['assessment'],'証拠と対応が整合');self.assertIn('冬月',self.sec()['archive'][0]['authorizedBy'])
    def test_valid_escort_is_distinguished_from_intrusion(self):
        self.boot({'world':{'security':{'schema':1,'auto':False,'sequence':3}}});self.investigate();self.assertEqual(self.sec()['case']['variant'],1);self.view('work','evidence');self.assertIn('同行担当者',self.page.locator('#securityEvidence').inner_text());self.action('release');self.action('report');self.step();self.assertEqual(self.sec()['archive'][0]['assessment'],'証拠と対応が整合')
    def test_wrong_release_has_one_real_resource_consequence_and_recovery_requires_report(self):
        self.boot();self.investigate();before=self.state()['defense']['spares'];self.action('release');self.assertEqual(self.sec()['case']['stage'],'failed');self.assertEqual(self.state()['defense']['spares'],before-1);self.assertEqual(self.sec()['integrity'],82)
        self.step(60);self.assertEqual(self.state()['defense']['spares'],before-1);self.page.locator('#commandAlertOpen').click();self.assertTrue(self.page.locator('#alertClear').is_disabled());self.page.locator('#alertTarget').click();self.assertEqual(self.page.evaluate('location.hash'),'#work/security')
        self.action('recover');self.step(60);self.assertIsNone(self.sec()['case']);self.assertEqual(len(self.sec()['archive']),1)
    def test_deadline_failure_is_bounded_and_survives_restart(self):
        self.boot();self.action('start.audit');self.step(360);self.assertEqual(self.sec()['case']['stage'],'failed');before=copy.deepcopy(self.sec());self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.sec(),before);self.page.evaluate('NERV_WORLD.advance()');self.assertEqual(self.sec(),before)
    def test_security_analysis_holds_on_magi_attack_and_power_loss(self):
        self.boot();self.action('start.sabotage');self.action('accept');self.action('evidence.signature');self.action('evidence.relay');self.page.evaluate('NERV_OPERATIONS.external("start")');self.action('analyze',False)
        # A fresh, independent case verifies analysis cannot complete without actual power.
        self.boot();self.action('start.sabotage');self.action('accept');self.action('evidence.signature');self.action('evidence.relay');self.action('analyze');self.view('infra','systems');self.page.locator('#powerToggle').click();self.step();self.assertEqual(self.sec()['case']['stage'],'analyzing');self.page.locator('#powerToggle').click();self.step();self.assertEqual(self.sec()['case']['stage'],'analyzed');self.assertIsNone(self.state()['magi']['approvedFor'])
        # The same cooling hold used by ordinary jobs also blocks security analysis.
        for during in [False,True]:
            self.boot({'world':{'schema':1,'cooling':{'load':75},'events':[{'id':'cooling-anomaly-1','kind':'magi-cooling','status':'detected','severity':'watch','createdTick':0}]}})
            self.action('start.access');self.action('accept');self.action('evidence.badge');self.action('evidence.camera')
            if during:self.action('analyze')
            self.assertTrue(self.page.evaluate('NERV_WORLD.act("incidentAccept")')['ok']);self.assertTrue(self.page.evaluate('NERV_WORLD.act("isolate")')['ok'])
            if during:self.step();self.assertEqual(self.sec()['case']['stage'],'analyzing')
            else:self.action('analyze',False)
    def test_security_persistence_failure_rolls_back_evidence_and_metrics(self):
        self.boot();self.action('start.access');self.action('accept');before=copy.deepcopy(self.sec());self.page.evaluate('''()=>{const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('disk full');return old.call(this,k,v)}}''');self.action('evidence.badge',False);self.assertEqual(self.sec(),before)
    def test_evidence_tabs_are_touch_operable_and_keep_all_three_findings(self):
        self.boot();self.action('start.access');self.view('work','security');self.page.locator('#securityAccept').click();self.view('work','evidence')
        for i,key in enumerate(['badge','camera','route']):
            self.page.locator('[data-security-clue="'+str(i)+'"]').click();self.assertEqual(self.page.locator('#securityEvidence article:visible').count(),1)
            self.page.locator('#securityEvidence article:visible button').click();self.page.wait_for_function('(key)=>NERV_SECURITY.snapshot().case.evidence.includes(key)',arg=key)
        self.assertEqual(len(self.sec()['case']['evidence']),3);self.page.locator('#securityAnalyze').click();self.assertEqual(self.sec()['case']['stage'],'analyzing')
    def test_future_security_schema_is_preserved_and_blocks_world_migration(self):
        self.page.add_init_script(f'Date.now=()=>{NOW}');self.load({'prefs':{'showBoot':False},'world':{'schema':1,'security':{'schema':9,'opaque':'keep'}}});self.page.wait_for_function('NERV_WORLD.snapshot().error.length>0');self.assertEqual(self.state()['world']['security'],{'schema':9,'opaque':'keep'})
    def test_security_dialogue_and_proactive_notice_share_the_actual_case(self):
        self.boot({'prefs':{'showBoot':False,'staffComms':True,'motion':False}});self.action('start.audit');self.contact('fuyutsuki');self.send('監査文書の改ざん疑惑は？');r=self.replied();self.assertIn('監査回線',r['text']);self.assertIn(self.sec()['case']['id'],r['text']);self.assertEqual(r['mode'],'watch');self.assertIn('security',self.page.evaluate('NERV_MESSAGES.context("fuyutsuki").world'))
        self.assertFalse(self.page.evaluate('NERV_MESSAGES.proactive()')['ok']);self.assertTrue(any(m.get('source','').startswith('security-') for m in self.pm()['threads']['fuyutsuki']['messages']));self.assertNotIn('variant',self.page.evaluate('NERV_MESSAGES.context("fuyutsuki").world.security'))
    def test_all_new_routes_restore_and_fit_phone_widths_in_normal_and_emergency(self):
        self.boot();routes=[('messages','ai'),('work','security'),('work','security-settings'),('work','evidence'),('work','decision'),('work','security-history'),('magi','main'),('mission','weapon-detail'),('hq','directorate'),('hq','seele'),('hq','observatory'),('settings','visual-index')]
        for emergency in [False,True]:
            if emergency:
                self.investigate();self.page.evaluate('NERV_OPERATIONS.external("start")')
            for width in [320,390,430]:
                self.page.set_viewport_size({'width':width,'height':844})
                for page,view in routes:
                    self.view(page,view);self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1,(page,view,width));self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150,(page,view,width,emergency))
        self.view('hq','seele');self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('location.hash'),'#hq/seele');self.assertTrue(self.page.locator('.seele-monolith').is_visible())
    def test_new_portraits_preserve_existing_faces_and_kiel_uses_external_group(self):
        self.boot();self.view('messages','contacts');self.page.locator('[data-personal-group="staff"]').click();self.assertEqual(self.page.locator('[data-message-contact]').count(),7)
        self.page.locator('[data-personal-group="seele"]').click();self.assertEqual(self.page.locator('[data-message-contact]').count(),1);self.page.locator('[data-message-contact="kiel"]').click();self.assertEqual(self.page.locator('#messagePersonFace [data-director]').get_attribute('data-director'),'2');self.send('二人で話してもいい？');self.assertIn('監査',self.replied()['text'])
        self.contact('maya');self.assertEqual(self.page.locator('#messagePersonFace [data-staff]').get_attribute('data-staff'),'2');self.contact('gendo');self.assertEqual(self.page.locator('#messagePersonFace [data-director]').get_attribute('data-director'),'0')
    def test_every_added_deep_link_survives_a_fresh_reload(self):
        self.boot()
        for page,view in [('messages','ai'),('work','security'),('work','security-settings'),('work','evidence'),('work','decision'),('work','security-history'),('magi','main'),('mission','weapon-detail'),('hq','directorate'),('hq','seele'),('hq','observatory'),('settings','visual-index')]:
            with self.subTest(page=page,view=view):
                self.view(page,view);self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');canonical='history' if page=='work' and view=='security-history' else view;self.assertEqual(self.page.evaluate('location.hash'),'#'+page+'/'+canonical);self.assertEqual(self.page.locator('.page.active .mobile-view:visible').get_attribute('data-view'),canonical)
    def test_equipment_art_is_separate_and_zoom_remains_inside_scroll_area(self):
        self.boot();self.view('mission','armament')
        for kind in ['knife','rifle','positron']:
            self.page.locator('[data-armament="'+kind+'"]').click();self.assertEqual(self.page.locator('#armamentPlate [data-weapon-art]').get_attribute('data-weapon-art'),kind);self.assertTrue(self.page.locator('#armamentPlate .weapon-art i').evaluate('e=>getComputedStyle(e).backgroundImage.includes("data:image/webp")'))
        self.view('mission','weapon-detail');self.page.locator('#weaponDetailZoom').fill('2.2');self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),390);self.assertGreater(self.page.locator('.weapon-detail-scroll').evaluate('e=>e.scrollWidth'),self.page.locator('.weapon-detail-scroll').evaluate('e=>e.clientWidth'))
    def test_named_fx_share_scheduler_and_suspend_offscreen_and_in_reduced_motion(self):
        self.boot(moving=True);self.view('hq','observatory');self.page.locator('#spatialGrid').scroll_into_view_if_needed();self.page.wait_for_timeout(100);self.assertTrue(self.page.evaluate('NERV_FX.snapshot().scheduled'));before=self.page.evaluate('NERV_FX.snapshot().paintCount');self.page.wait_for_timeout(150);self.assertGreater(self.page.evaluate('NERV_FX.snapshot().paintCount'),before)
        self.open('home');before=self.page.evaluate('NERV_FX.snapshot().paintCount');self.page.wait_for_timeout(120);self.assertEqual(self.page.evaluate('NERV_FX.snapshot().paintCount'),before);self.page.wait_for_function('!NERV_FX.snapshot().scheduled',timeout=4000);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
        self.view('magi','main');self.page.emulate_media(reduced_motion='reduce');self.page.wait_for_timeout(80);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
        self.assertEqual(set(self.page.evaluate('NERV_VISUALS.snapshot().effects')),{'Spatial Grid','Conic Portal','Wave Field','Layered Parallax'})
    def test_magi_new_graphic_reports_three_actual_core_states(self):
        self.boot();self.view('magi','main');self.assertEqual(self.page.locator('#consoleMagiBoard [data-console-core]').count(),3);self.assertIn('MAGI SYSTEM',self.page.locator('#consoleMagiTitle').inner_text());self.page.evaluate('NERV_OPERATIONS.external("start")');self.assertIn('666',self.page.locator('#consoleMagiTitle').inner_text());self.assertEqual(self.page.locator('#consoleMagiBoard .console-core-value').all_text_contents(),['20% / 100 CU','12% / 100 CU','8% / 100 CU'])

if __name__=='__main__':unittest.main()
