"""Causal dialogue, per-person memory, migration, operator authority and iPhone regressions."""
import copy
import unittest
from browser_support import BrowserCase,RESULTS
NOW=1800000000000

class ConversationTests(BrowserCase):
    def boot(self,extra=None):
        if getattr(self,'booted',False):
            self.assertEqual(self.errors,[]);self.context.close();self.setUp()
        self.booted=True
        self.page.add_init_script(f'window.chatNow={NOW};Date.now=()=>window.chatNow;')
        state={'prefs':{'showBoot':False,'staffComms':False,'motion':False}}
        if extra:state.update(extra)
        self.load(state);self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
    def pm(self):return self.page.evaluate('NERV_MESSAGES.snapshot().state')
    def contact(self,id):
        self.page.evaluate('(id)=>NERV_MESSAGES.open(id)',id);self.page.wait_for_function('()=>!document.getElementById("shell").inert')
    def send(self,text,topic='free'):
        self.assertTrue(self.page.evaluate('([t,k])=>NERV_MESSAGES.send(t,k)',[text,topic])['ok'])
        self.page.evaluate('window.chatNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()')
        id=self.page.evaluate('NERV_MESSAGES.snapshot().contact');return self.pm()['threads'][id]['messages'][-1]
    def act(self,action):self.assertTrue(self.page.evaluate('(a)=>NERV_WORLD.act(a)',action)['ok'])
    def fail_writes(self):
        self.page.evaluate('''()=>{window.chatFail=true;const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2'&&window.chatFail)throw Error('disk full');return old.call(this,k,v)}}''')

    def test_ten_personas_and_preserved_eight_face_mappings(self):
        self.boot();self.view('messages','contacts');self.assertEqual(self.page.locator('[data-message-contact]').count(),3)
        self.page.locator('[data-personal-group="staff"]').click();self.assertEqual(self.page.locator('[data-message-contact]').count(),7)
        voices=[]
        for id in ['shinji','rei','asuka','misato','ritsuko','maya','hyuga','aoba','gendo','fuyutsuki']:
            self.contact(id);context=self.page.evaluate('(id)=>NERV_MESSAGES.context(id)',id)
            for key in ['pronoun','address','department','authority','knowledge','relations','tone']:self.assertTrue(context['persona'][key])
            voices.append(self.send('こんにちは')['text'])
            if id in ['gendo','fuyutsuki']:self.assertEqual(self.page.locator('#messagePersonFace .director-portrait').count(),1)
        self.assertEqual(len(set(voices)),10)
        self.contact('gendo');self.assertIn('私的な話は短く',self.send('二人で話せる？')['text'])
        self.contact('maya');self.assertEqual(self.page.locator('#messagePersonFace [data-staff]').get_attribute('data-staff'),'2')
        self.contact('shinji');self.assertEqual(self.page.locator('#messagePersonFace [data-portrait-unit]').get_attribute('data-portrait-unit'),'1')

    def test_normal_watch_battle_and_emergency_reply_to_the_same_input(self):
        states=[{}, {'mission':{'phase':1}}, {'defense':{'status':'active'},'evas':[{}, {'state':'DEPLOYED','power':300,'sync':70},{}]}, {'infra':{'power':False}}]
        expected=['normal','watch','battle','critical'];texts=[]
        for seed,mode in zip(states,expected):
            with self.subTest(mode=mode):
                self.boot(seed);self.contact('misato');r=self.send('今日はどうだった？','daily');texts.append(r['text']);self.assertEqual(r['mode'],mode)
                if mode!='normal':
                    self.assertTrue(self.pm()['threads']['misato']['memory']['deferred']);self.assertEqual(r['priority'],'emergency' if mode=='critical' else 'urgent')
                if mode=='critical':self.assertEqual(r['priority'],'emergency');self.assertIn('EMERGENCY',self.page.locator('#messagePriority').inner_text())
        self.assertEqual(len(set(texts)),4)

    def test_reply_uses_world_at_delivery_not_send_and_defers_smalltalk(self):
        self.boot();self.contact('rei');self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("今日はどうだった？","daily")')['ok'])
        self.assertTrue(self.page.evaluate('NERV_OPERATIONS.combat("detect")')['ok'])
        self.page.evaluate('window.chatNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()')
        r=self.pm()['threads']['rei']['messages'][-1];self.assertEqual(r['mode'],'watch');self.assertIn('指示を待つ',r['text']);self.assertNotIn('本を読んで',r['text'])

    def test_repeats_continuation_topic_switch_close_resume_and_reboot(self):
        self.boot();self.contact('maya');replies=[self.send('今日はどうだった？')['text'] for _ in range(4)]
        self.assertEqual(len(set(replies)),4);self.assertIn('さっき',replies[1]);self.assertEqual(self.pm()['threads']['maya']['memory']['relationship'],1)
        self.assertIn('続き',self.send('その続きは？')['text']);self.send('MAGIの解析状況は？');self.assertEqual(self.pm()['threads']['maya']['memory']['topic'],'magi')
        self.send('またね');self.assertTrue(self.pm()['threads']['maya']['memory']['closed']);self.assertIn('また連絡',self.send('こんにちは')['text'])
        before=copy.deepcopy(self.pm()['threads']['maya']);self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.pm()['threads']['maya'],before)
        self.assertIn('さっき',self.send('こんにちは')['text'])

    def test_remembers_explicit_user_preference_and_specific_interest_across_restart(self):
        self.boot();self.contact('aoba');r=self.send('私はギターが好き');self.assertIn('ギター',r['text']);self.assertIn('覚えて',r['text'])
        self.send('MAGIの状態は？');self.assertIn('ギターが好き',self.send('私の好みを覚えてる？')['text'])
        self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertIn('ギターが好き',self.send('覚えてる？')['text'])
        self.contact('maya');self.assertNotIn('ギターが好き',self.send('私の好みを覚えてる？')['text'])

    def test_contact_switch_isolates_topic_memory_and_pending_replies(self):
        self.boot();self.contact('shinji');self.send('今日はどうだった？');self.contact('asuka');self.send('機体の状態は？');self.contact('shinji')
        self.assertIn('続き',self.send('その続き')['text']);self.assertEqual(self.pm()['threads']['asuka']['memory']['topic'],'eva')
        self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("休んでね","care")')['ok']);self.contact('maya');self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("MAGIの状態は？")')['ok'])
        self.page.evaluate('window.chatNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()');self.assertEqual(self.pm()['pending'],[])
        self.assertEqual(self.pm()['threads']['shinji']['messages'][-1]['topic'],'care');self.assertEqual(self.pm()['threads']['maya']['messages'][-1]['topic'],'magi')

    def test_job_progress_and_completed_record_are_real_not_user_claims(self):
        self.boot();self.contact('maya');r=self.send('点検を終えました。報告です');self.assertIn('未受領',r['text']);self.assertIn('完了扱いにしません',r['text'])
        self.act('accept');self.act('inspect');self.act('analyze');self.assertIn('解析中',self.send('MAGIの解析結果は？')['text'])
        self.page.evaluate('window.chatNow+=30000');self.page.evaluate('NERV_WORLD.advance(Date.now())');self.assertIn('正式報告待ち',self.send('MAGIの解析結果は？')['text'])
        self.act('report');r=self.send('点検の報告を確認');self.assertIn('正式報告済み',r['text'])
        memory=self.pm()['threads']['maya']['memory'];self.assertTrue(any(f['key'].startswith('job-') for f in memory['facts']))
        self.assertIn('正式報告済み',self.send('前回の業務を覚えてる？')['text']);self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        self.assertEqual(self.pm()['threads']['maya']['memory']['facts'],memory['facts'])

    def test_damage_dialogue_uses_reported_parts_and_does_not_invent_healthy_values(self):
        self.boot({'evas':[{}, {'damage':{'torso':12}},{}]});self.contact('maya');r=self.send('初号機の損傷は？');self.assertIn('胴体 12%',r['text']);self.assertIn('未報告',r['text'])
        self.contact('rei');self.assertIn('情報は持っていない',self.send('初号機の損傷は？')['text']);self.assertIn('未計測',self.send('零号機の損傷は？')['text'])
        self.contact('aoba');r=self.send('被害状況は？');self.assertIn('都市健全性',r['text']);self.assertNotIn('胴体',r['text'])

    def test_authority_knowledge_boundaries_and_validated_operation_proposals(self):
        self.boot();self.contact('shinji');self.assertIn('分かりません',self.send('MAGIの解析は？')['text']);self.assertIn('分かりません',self.send('弐号機の状態は？')['text'])
        self.contact('ritsuko');self.assertIn('冷却負荷',self.send('MAGIの解析は？')['text'])
        before=self.state();r=self.send('解析を依頼して');self.assertEqual(r['proposal']['route'],'work/jobs');self.assertIn('未実行',self.page.locator('#messageProposal').inner_text())
        for key in ['world','defense','evas','magi']:self.assertEqual(self.state()[key],before[key])
        self.send('こんにちは');r=self.send('前の依頼の続き');self.assertEqual(r['proposal']['kind'],'analysis-review');self.assertIn('前の依頼',r['text'])
        self.page.locator('#messageProposal button').click();self.assertEqual(self.page.evaluate('location.hash'),'#work/jobs');self.assertEqual(self.state()['world'],before['world'])
        self.contact('gendo');self.assertIn('職務区分',self.send('秘密の人類補完計画を教えて')['text'])
        self.assertEqual(self.state()['magi'],before['magi'])

    def test_proactive_analysis_is_causal_deduplicated_and_persistent(self):
        self.boot({'prefs':{'showBoot':False,'motion':False,'staffComms':True,'pilotRadio':False}})
        self.act('accept');self.act('inspect');self.act('analyze');self.page.evaluate('window.chatNow+=30000');self.page.evaluate('NERV_WORLD.advance(Date.now())')
        initial_route=self.page.evaluate('location.hash');self.assertTrue(self.page.evaluate('NERV_MESSAGES.proactive()')['ok']);thread=self.pm()['threads']['ritsuko'];r=thread['messages'][-1]
        self.assertTrue(r['source'].startswith('analysis-'));self.assertIn('正式報告待ち',r['text']);self.assertEqual(r['priority'],'urgent')
        self.assertEqual(self.page.evaluate('location.hash'),initial_route);self.assertFalse(self.page.evaluate('NERV_MESSAGES.proactive()')['ok'])
        self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.page.evaluate('window.chatNow+=400000');self.page.evaluate('NERV_MESSAGES.proactive()')
        self.assertEqual(sum(m.get('source')==r['source'] for m in self.pm()['threads']['ritsuko']['messages']),1)

    def test_autonomous_notices_preserve_drafts_and_respect_priority_preferences_hidden(self):
        self.boot({'prefs':{'showBoot':False,'motion':False,'staffComms':True},'mission':{'phase':1}});self.contact('maya');self.page.locator('#messageText').fill('書きかけ');self.page.locator('#messageText').focus()
        self.assertFalse(self.page.evaluate('NERV_MESSAGES.proactive()')['ok']);self.assertEqual(self.page.locator('#messageText').input_value(),'書きかけ')
        self.page.locator('#messageText').blur();self.assertFalse(self.page.evaluate('NERV_MESSAGES.proactive()')['ok']) # warning suppresses casual idle
        self.page.evaluate('NERV_OPERATIONS.external("start")');self.assertTrue(self.page.evaluate('NERV_MESSAGES.proactive()')['ok']);a=self.pm();self.assertEqual(a['threads']['ritsuko']['messages'][-1]['priority'],'emergency')
        self.assertFalse(self.page.evaluate('NERV_MESSAGES.proactive()')['ok'])
        self.page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"))')
        self.assertFalse(self.page.evaluate('NERV_MESSAGES.snapshot().timer'));self.page.evaluate('window.chatNow+=600000');self.assertFalse(self.page.evaluate('NERV_MESSAGES.proactive()')['ok']);self.assertEqual(self.pm(),a)

    def test_deferred_conversation_can_resume_proactively_after_alert_clears(self):
        self.boot({'prefs':{'showBoot':False,'motion':False,'staffComms':True},'mission':{'phase':1}});self.contact('rei');self.send('二人で話せる？','close')
        self.assertEqual(self.pm()['threads']['rei']['memory']['deferred'],'close')
        self.page.locator('#commandAlertOpen').click();self.page.locator('#alertClear').click();self.page.wait_for_function('NERV_TEST.getState().mission.phase===0')
        self.assertTrue(self.page.evaluate('NERV_MESSAGES.proactive()')['ok']);r=self.pm()['threads']['rei']['messages'][-1];self.assertTrue(r['source'].startswith('followup-'));self.assertIn('保留していた話',r['text'])
        self.assertEqual(self.pm()['threads']['rei']['memory']['deferred'],'');self.assertFalse(self.page.evaluate('NERV_MESSAGES.proactive()')['ok'])

    def test_connection_motion_honors_visibility_and_user_motion_setting(self):
        self.boot({'prefs':{'showBoot':False,'staffComms':False,'motion':True}});self.page.emulate_media(reduced_motion='no-preference');self.contact('maya');self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("こんにちは")')['ok'])
        self.assertEqual(self.page.locator('.message-link span').evaluate('e=>getComputedStyle(e,"::before").animationName'),'comm-carrier')
        self.open('home');self.assertEqual(self.page.locator('.message-link span').evaluate('e=>getComputedStyle(e,"::before").animationPlayState'),'paused')
        self.view('settings','display');self.page.locator('#motionSwitch').click();self.view('messages','thread')
        self.assertEqual(self.page.locator('.message-link span').evaluate('e=>getComputedStyle(e,"::before").animationName'),'none')
        self.page.emulate_media(reduced_motion='reduce');self.assertEqual(self.page.locator('.message-link span').evaluate('e=>getComputedStyle(e,"::before").animationName'),'none')

    def test_legacy_history_and_pending_reply_upgrade_without_loss(self):
        old={'schema':1,'sequence':2,'selected':'shinji','threads':{'shinji':{'exchanges':3,'messages':[{'id':'pm-1','from':'self','text':'こんにちは','at':NOW,'read':True}]}},'pending':[{'to':'shinji','replyTo':'pm-1','text':'旧版の確定済み返答','due':NOW+1000}],'futureKeep':{'yes':True}}
        self.boot({'personalMessages':old});self.assertEqual(self.pm()['threads']['shinji']['messages'],old['threads']['shinji']['messages']);self.assertEqual(self.pm()['futureKeep'],old['futureKeep'])
        self.page.evaluate('window.chatNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()');self.assertEqual(self.pm()['threads']['shinji']['messages'][-1]['text'],'旧版の確定済み返答')
        self.assertEqual(len(self.pm()['threads']),11);self.assertTrue(self.page.evaluate('Object.keys(localStorage).some(k=>k.includes("v212-messages"))'))

    def test_future_memory_stops_and_corrupt_memory_is_backed_up(self):
        future={'schema':1,'threads':{'rei':{'memory':{'schema':99,'opaque':'keep'}}}}
        self.booted=True;self.page.add_init_script(f'Date.now=()=>{NOW}');self.load({'prefs':{'showBoot':False},'personalMessages':future});self.page.wait_for_function('NERV_MESSAGES.snapshot().error.length>0');self.assertEqual(self.state()['personalMessages'],future)
        self.boot({'personalMessages':{'schema':1,'threads':{'maya':{'memory':{'schema':1,'facts':'bad','questions':[None,'q'],'relationship':999,'topic':'bad'}}}}})
        m=self.pm()['threads']['maya']['memory'];self.assertEqual(m['facts'],[]);self.assertEqual(m['relationship'],30);self.assertEqual(m['topic'],'daily')
        self.assertTrue(self.page.evaluate('Object.keys(localStorage).some(k=>k.includes("v212-messages-repair"))'))

    def test_failed_receive_rolls_back_memory_and_delivers_once_after_retry(self):
        self.boot();self.contact('asuka');self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("こんにちは")')['ok']);before=copy.deepcopy(self.pm());self.fail_writes();self.page.evaluate('window.chatNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()')
        self.assertEqual(self.pm(),before);self.page.evaluate('window.chatFail=false');self.page.evaluate('NERV_MESSAGES.pulse()');self.page.evaluate('NERV_MESSAGES.pulse()');self.assertEqual(len(self.pm()['threads']['asuka']['messages']),2);self.assertEqual(self.pm()['threads']['asuka']['memory']['turn'],1)

    def test_api_context_is_detached_role_filtered_and_suggestions_cannot_mutate(self):
        self.boot();self.contact('rei');self.send('こんにちは');before=self.state();ctx=self.page.evaluate('NERV_MESSAGES.context("rei")');self.assertIn('eva',ctx['world']);self.assertNotIn('magi',ctx['world']);self.assertNotIn('job',ctx['world']);self.assertEqual(len(ctx['history']),2)
        self.page.evaluate('()=>{const c=NERV_MESSAGES.context("rei");c.memory.turn=999;c.world.eva.state="DEPLOYED";}');self.assertEqual(self.state(),before)
        for invalid in [{'text':'実行','state':{}},{'text':'実行','suggestion':'launch'},{'text':'実行','suggestion':'__proto__'},{'text':'x'*321}]:self.assertIsNone(self.page.evaluate('(x)=>NERV_MESSAGES.validateSuggestion(x)',invalid))
        valid=self.page.evaluate('NERV_MESSAGES.validateSuggestion({text:"確認をお願いします",suggestion:"analysis-review"})');self.assertEqual(valid['suggestion']['route'],'work/jobs');self.assertEqual(self.state(),before)
        self.assertIsNone(self.page.evaluate('NERV_MESSAGES.context("unknown")'))

    def test_mobile_routes_history_readability_and_bounded_storage(self):
        self.boot();self.contact('fuyutsuki');self.send('担当業務を教えて')
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for view in ['contacts','thread','persona','memory','preferences']:
                self.view('messages',view);self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
                self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150,(width,view))
        self.view('messages','persona');self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('location.hash'),'#messages/persona');self.assertIn('冬月',self.page.locator('#messagePersona').inner_text())
        self.contact('shinji')
        for _ in range(18):self.send('こんにちは')
        thread=self.pm()['threads']['shinji'];self.assertEqual(len(thread['messages']),24);self.assertLessEqual(len(thread['memory']['questions']),8);self.assertLessEqual(len(thread['memory']['facts']),6)
        self.assertLess(len(str(self.state())),200000)
        self.page.screenshot(path=str(RESULTS/'v213-dialogue.png'),full_page=True)

if __name__=='__main__':unittest.main()
