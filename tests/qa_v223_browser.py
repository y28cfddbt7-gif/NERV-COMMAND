"""Consolidated routes and actual-state staff consultation, using real transactions."""
import copy
from browser_support import BrowserCase, RESULTS
import qa_conversation_browser as chat
import qa_v219_browser as console
import qa_v214_browser as ai


class V223Tests(BrowserCase):
    boot=chat.ConversationTests.boot
    pm=chat.ConversationTests.pm
    contact=chat.ConversationTests.contact
    send=chat.ConversationTests.send
    act=chat.ConversationTests.act
    fail_writes=chat.ConversationTests.fail_writes

    def liaison(self,domain,id):
        return self.page.evaluate('([d,id])=>NERV_LIAISON.context(d,id)',[domain,id])

    def consult(self,page,view):
        self.view(page,view)
        self.assertTrue(self.page.locator('#dutyContactCard').is_visible())
        self.page.locator('#dutyContactOpen').click()
        self.page.wait_for_function('!document.getElementById("shell").inert')
        self.assertTrue(self.page.locator('#messageDutyContext').is_visible())

    def test_nine_duplicate_routes_use_one_public_tab_and_keep_records(self):
        self.boot()
        aliases=self.page.evaluate('NERV_LIAISON.snapshot().aliases')
        self.assertEqual(len(aliases),9)
        for old,target in aliases.items():
            self.assertEqual(self.page.locator('[data-mobile-tab="'+old+'"]').count(),0)
            self.page.evaluate('(s)=>NERV_MOBILE.open(...s.split("/"))',old)
            expected='#battle/setup' if old=='mission/status' else '#'+target
            self.assertEqual(self.page.evaluate('location.hash'),expected)
            self.assertEqual(self.page.locator('.page.active .mobile-view:visible').count(),1)
        for id in ['missionLog','worldDepartmentList','securityArchive','armoryPanel']:
            self.assertEqual(self.page.locator('#'+id).count(),1)
        self.assertEqual(self.page.locator('.page[data-page="mission"]>.mobile-tabs button').count(),3)

    def test_old_cross_page_deep_link_reload_and_back_remain_canonical(self):
        self.boot();self.view('infra','map');self.view('hq','comms')
        self.assertEqual(self.page.evaluate('location.hash'),'#work/communications')
        self.page.go_back();self.assertEqual(self.page.evaluate('location.hash'),'#infra/map')
        self.page.goto(self.url+'#tools/communications',wait_until='domcontentloaded')
        self.page.reload(wait_until='domcontentloaded');self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        self.assertEqual(self.page.evaluate('location.hash'),'#work/communications')
        self.view('tools','communications');self.assertTrue(self.page.locator('#staffCommsToggle').is_visible())
        self.view('infra','map');self.page.go_back();self.assertEqual(self.page.evaluate('location.hash'),'#work/communications')
        self.assertTrue(self.page.locator('#staffCommsToggle').is_visible())

    def test_job_consultation_has_live_phase_reason_next_and_return(self):
        self.boot();self.consult('work','jobs')
        self.assertEqual(self.page.evaluate('NERV_MESSAGES.snapshot().contact'),'maya')
        texts=[self.send('日常業務の状況を教えてください')['text'] for _ in range(3)]
        self.assertEqual(len(set(texts)),3)
        self.assertIn('先輩',texts[2]);self.assertIn('未受領',texts[0])
        self.act('accept');r=self.send('その件の次の手順は？');self.assertIn('受領済み',r['text']);self.assertEqual(r['context']['domain'],'duty')
        self.page.locator('#messageDutyReturn').click();self.assertEqual(self.page.evaluate('location.hash'),'#work/jobs')
        self.assertIn('受領済み',self.page.locator('#dutyContactBrief').inner_text())

    def test_receiving_context_uses_current_world_not_original_card(self):
        self.boot();self.consult('work','jobs');self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("日常業務の状況は？")')['ok'])
        self.act('accept');self.page.evaluate('chatNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()')
        r=self.pm()['threads']['maya']['messages'][-1];self.assertIn('受領済み',r['text']);self.assertEqual(r['context']['phase'],'accepted')

    def test_security_conversation_tracks_evidence_without_revealing_solution(self):
        self.boot();self.act('security.start.access');self.consult('work','security')
        r=self.send('本部保安の状況は？');self.assertIn('証拠 0/3',r['text']);self.assertEqual(r['context']['domain'],'security')
        self.assertNotIn('variant',r['text']);self.act('security.accept')
        case=self.state()['world']['security']['case'];evidence=self.page.evaluate('NERV_SECURITY.snapshot().case')
        self.view('work','evidence');self.page.locator('#securityEvidence button').first.click();self.page.wait_for_function('!document.getElementById("shell").inert')
        self.contact('hyuga');r=self.send('本部保安の状況は？');self.assertIn('証拠 1/3',r['text'])
        before=copy.deepcopy(self.state()['world']['security']);self.send('本部保安について、判断の理由は？');self.assertEqual(self.state()['world']['security'],before)

    def test_magi_consultation_has_real_fault_and_never_solves_or_approves(self):
        self.boot();self.act('magiops.start.clock');self.consult('magi','main')
        before=copy.deepcopy(self.state()['world']['magiOps']);r=self.send('MAGIの状況を教えてください')
        self.assertEqual(r['context']['domain'],'magi');self.assertIn('独立測定',r['text']);self.assertNotIn('offsets',r['text'])
        self.send('その件について、判断の理由は？');self.assertEqual(self.state()['world']['magiOps'],before)
        self.page.locator('#messageDutyReturn').click();self.assertEqual(self.page.evaluate('location.hash'),'#magi/main')

    def test_pilot_context_respects_own_unit_and_seele_access(self):
        self.boot();self.assertIsNone(self.liaison('security','rei'));self.assertIsNone(self.liaison('magi','asuka'));self.assertIsNone(self.liaison('battle','rei'))
        self.assertIsNone(self.liaison('security','kiel'));self.assertIsNone(self.liaison('duty','kiel'))
        self.contact('asuka');r=self.send('零号機の状態は？');self.assertNotIn('SYNC',r['text'])
        self.contact('kiel');self.assertNotIn('証拠 0/3',self.send('本部保安の状況は？')['text'])

    def test_memory_is_per_person_bounded_and_restored_with_current_work_link(self):
        self.boot();self.consult('work','jobs');self.send('日常業務の状況は？')
        before=copy.deepcopy(self.pm()['threads']['maya']['memory']);self.contact('rei');self.assertIsNone(self.pm()['threads']['rei']['memory']['dutyContext'])
        self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.contact('maya')
        self.assertEqual(self.pm()['threads']['maya']['memory'],before);self.assertTrue(self.page.locator('#messageDutyContext').is_visible())
        self.assertLessEqual(len(before['replyKeys']),12);self.assertLessEqual(len(before['facts']),6)

    def test_focused_reply_keeps_composer_and_failed_save_keeps_pending(self):
        self.boot();self.consult('work','jobs');self.page.locator('#messageText').fill('書きかけの次の相談')
        self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("日常業務の状況は？")')['ok'])
        self.page.locator('#messageText').focus();before=copy.deepcopy(self.pm());self.fail_writes();self.page.evaluate('chatNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()')
        self.assertEqual(self.pm(),before);self.assertEqual(self.page.locator('#messageText').input_value(),'書きかけの次の相談');self.assertEqual(self.page.evaluate('document.activeElement.id'),'messageText')
        self.page.evaluate('chatFail=false');self.page.evaluate('NERV_MESSAGES.pulse()');self.assertEqual(self.pm()['pending'],[])
        replies=[m for m in self.pm()['threads']['maya']['messages'] if m.get('replyTo')];self.assertEqual(len(replies),1)
        self.assertEqual(self.page.locator('#messageText').input_value(),'書きかけの次の相談')

    def test_real_case_proactive_notification_obeys_cooldown_and_automation_switch(self):
        self.boot();self.act('security.start.access');self.act('security.accept');self.page.evaluate('chatNow+=601000')
        self.assertFalse(self.page.evaluate('NERV_MESSAGES.proactive(false)')['ok'])
        self.page.locator('#staffCommsToggle').evaluate('(b)=>b.click()')
        self.page.wait_for_function('!document.getElementById("shell").inert')
        self.assertTrue(self.page.evaluate('NERV_MESSAGES.proactive(false)')['ok'])
        messages=self.pm()['threads']['hyuga']['messages'];self.assertTrue(any(m.get('source','').startswith('consult-') for m in messages))
        before=copy.deepcopy(messages);self.page.evaluate('NERV_MESSAGES.proactive(false)');self.assertEqual(self.pm()['threads']['hyuga']['messages'],before)

    def test_phone_widths_fit_and_context_buttons_use_real_send(self):
        self.boot()
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844});self.consult('work','jobs')
            self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
            for button in self.page.locator('[data-duty-question]').all():self.assertGreaterEqual(button.bounding_box()['height'],44)
        self.page.locator('[data-duty-question="next"]').click();self.page.wait_for_function('NERV_MESSAGES.snapshot().state.pending.length===1')
        self.assertEqual(self.page.evaluate('location.hash'),'#messages/thread/maya')
        self.page.evaluate('chatNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()');self.assertIn('次の確認',self.pm()['threads']['maya']['messages'][-1]['text'])
        self.assertEqual(self.page.evaluate('location.hash'),'#messages/thread/maya')
        self.page.screenshot(path=str(RESULTS/'v223-duty-consultation.png'),full_page=True)

    def test_bad_optional_context_is_bounded_without_erasing_unknown_memory(self):
        memory={'schema':1,'dutyContext':{'domain':'unknown','key':'x'},'replyKeys':[None]+['k'*220]*30,'opaque':{'keep':True}}
        self.boot({'personalMessages':{'schema':1,'threads':{'maya':{'memory':memory}}}})
        m=self.pm()['threads']['maya']['memory'];self.assertIsNone(m['dutyContext']);self.assertEqual(len(m['replyKeys']),12)
        self.assertTrue(all(len(k)==160 for k in m['replyKeys']));self.assertEqual(m['opaque'],{'keep':True})


class V223AITests(BrowserCase):
    boot=ai.V214Tests.boot
    sec=ai.V214Tests.sec
    action=ai.V214Tests.action
    contact=ai.V214Tests.contact
    pm=ai.V214Tests.pm
    send=ai.V214Tests.send
    host=ai.V214Tests.host
    replied=ai.V214Tests.replied

    def test_first_consultation_uses_same_context_signature_and_accepts_valid_ai_reply(self):
        self.boot();self.contact('maya');self.host(reply={'text':'確認しました。点検の記録を一緒に見ましょう。','suggestion':None})
        self.send('日常業務の状況を教えてください');r=self.replied();self.assertEqual(r['transport'],'ai')
        context=self.page.evaluate('aiHost.requests[0].payload.context');self.assertEqual(context['world']['consultation']['domain'],'duty')
        self.assertEqual(context['world']['consultation']['phase'],'available');self.assertEqual(r['context']['phase'],'available')

    def test_context_is_detached_and_contains_no_unobserved_security_solution(self):
        self.boot();self.action('start.access');self.contact('hyuga');self.send('本部保安の状況は？');self.replied()
        before=copy.deepcopy(self.state());context=self.page.evaluate('NERV_MESSAGES.context("hyuga")')
        self.assertEqual(context['world']['consultation']['domain'],'security');self.assertNotIn('variant',str(context['world']['consultation']))
        self.page.evaluate('()=>{const c=NERV_MESSAGES.context("hyuga");c.world.consultation.phase="resolved";c.memory.dutyContext.domain="magi";}')
        self.assertEqual(self.state(),before)


class V223BattleTests(BrowserCase):
    boot=console.V219Tests.boot
    cmd=console.V219Tests.cmd
    b=console.V219Tests.b
    idle=console.V219Tests.idle
    click=console.V219Tests.click
    start=console.V219Tests.start

def battle_communication_test(self):
    self.boot();self.start();self.assertTrue(self.page.locator('#dutyContactCard').is_visible());self.page.locator('#dutyContactOpen').click();self.idle()
    self.assertEqual(self.page.evaluate('NERV_MESSAGES.snapshot().contact'),'shinji')
    before=copy.deepcopy(self.state()['operatorConsole']);self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("作戦の次の手順は？")')['ok'])
    self.page.evaluate('consoleNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()')
    r=self.page.evaluate('NERV_MESSAGES.snapshot().state.threads.shinji.messages.at(-1)')
    self.assertIn(r['mode'],['battle','critical']);self.assertIn('2 AP',r['text']);self.assertIn('僕',r['text']);self.assertEqual(self.state()['operatorConsole'],before)
    self.page.locator('#messageDutyReturn').click();self.assertEqual(self.page.evaluate('location.hash'),'#battle/engage')

V223BattleTests.test_battle_communication_uses_real_phase_ap_and_own_pilot=battle_communication_test
