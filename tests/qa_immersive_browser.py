"""Real UI/state checks for v2.12 combat, private communication and bounded render work."""
import copy
import unittest
from datetime import datetime,timezone
from browser_support import BrowserCase,RESULTS

NOW=1800000000000
VIEWS=[('messages','contacts'),('messages','thread'),('messages','preferences'),('mission','armament'),('mission','weapon-control'),('eva','neural'),('eva','damage'),('magi','compute'),('magi','streams'),('settings','effects')]

class ImmersiveTests(BrowserCase):
    def boot(self,state=None,moving=False):
        if getattr(self,'_immersiveBooted',False):
            self.assertEqual(self.errors,[]);self.context.close();self.setUp()
        self._immersiveBooted=True
        self.page.add_init_script(f'window.immersiveNow={NOW};Date.now=()=>window.immersiveNow;')
        if moving:self.page.emulate_media(reduced_motion='no-preference')
        seed={'prefs':{'showBoot':False,'motion':moving,'staffComms':False}}
        if state:seed.update(state)
        self.load(seed);self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
    def combat(self,action,ok=True):
        result=self.page.evaluate('(a)=>NERV_OPERATIONS.combat(a)',action);self.assertEqual(result['ok'],ok,result);return result
    def prepare(self,unit=1,case=0):
        self.boot({'selectedEva':unit,'mission':{'phase':1},'tactics':{'attacker':unit},'defense':{'caseNo':case},'evas':[{'state':'DEPLOYED' if i==unit else 'HANGAR','umbilical':True,'at':False,'power':300,'sync':75} for i in range(3)]})
        for action in ['detect','scan','scan']:self.combat(action)
        self.assertEqual(self.state()['tactics']['attacker'],unit);self.assertEqual(self.state()['evas'][unit]['state'],'DEPLOYED')
    def chat(self,id):
        self.page.evaluate('(id)=>NERV_MESSAGES.open(id)',id);self.page.wait_for_function('()=>!document.getElementById("shell").inert')
    def reply(self):
        self.page.evaluate('window.immersiveNow+=2000');self.page.evaluate('NERV_MESSAGES.pulse()')
    def pm(self):return self.page.evaluate('NERV_MESSAGES.snapshot().state')
    def fail_writes(self):
        self.page.evaluate('''()=>{window.immersiveFail=true;const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2'&&window.immersiveFail)throw Error('simulated disk full');return old.call(this,k,v)}}''')

    def test_positron_each_unit_wins_without_city_armament_or_at_neutralization(self):
        for unit in range(3):
            with self.subTest(unit=unit):
                if unit:self.page.evaluate('localStorage.clear()')
                self.prepare(unit,unit);before=self.state()
                for action in ['positronSupply','positronCharge','positronCharge','authorize','positron']:self.combat(action)
                after=self.state();self.assertEqual(after['defense']['status'],'victory')
                self.assertEqual(after['defense']['victoryCause'],'eva-positron');self.assertEqual(after['defense']['wins'],1)
                self.assertEqual(after['evaCombat']['positronCharge'],0);self.assertFalse(after['evas'][unit]['at'])
                self.assertEqual(after['evas'][unit]['power'],300);self.assertEqual(after['defense']['spares'],before['defense']['spares']-1)
                self.assertTrue(all(not c['turret'] for c in after['defense']['city']))
                self.combat('positron',False);self.assertEqual(self.state()['defense']['wins'],1)

    def test_positron_requires_cable_charge_fresh_approval_and_security(self):
        self.prepare();before=self.state()['defense']['enemy']['hp'];self.combat('positron',False)
        self.view('eva','readiness');self.page.locator('#evaCable').click();self.combat('positronCharge',False)
        self.page.locator('#evaCable').click()
        for action in ['positronSupply','positronCharge','positronCharge']:self.combat(action)
        self.combat('positron',False);self.combat('authorize')
        self.page.evaluate('NERV_OPERATIONS.external("start")');self.combat('positron',False)
        self.assertEqual(self.state()['defense']['enemy']['hp'],before)
        self.assertFalse(self.page.locator('#fxHitNotice').is_visible())

    def test_charge_survives_reload_but_does_not_transfer_to_a_new_case(self):
        self.prepare();self.combat('positronCharge');self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        self.assertEqual(self.state()['evaCombat']['positronCharge'],50)
        self.view('mission','armament');self.page.locator('[data-armament="positron"]').click();self.assertIn('50%',self.page.locator('#armamentDescription').inner_text())
        self.page.locator('#commandAlertOpen').click();self.page.locator('#alertClear').click();self.page.wait_for_function('NERV_TEST.getState().defense.status==="idle"')
        self.combat('detect');self.view('mission','armament');self.assertIn('充填 0%',self.page.locator('#armamentDescription').inner_text())

    def test_weapon_ui_hit_feedback_follows_committed_damage_and_contact_report(self):
        self.prepare()
        for action in ['approach','approach','at','neutralize','authorize']:self.combat(action)
        self.assertFalse(self.page.locator('#fxHitNotice').is_visible())
        self.view('mission','armament');self.page.locator('[data-armament="knife"]').click()
        self.page.locator('#armamentPanel [data-ops-route="mission/weapon-control"]').click()
        before=self.state()['defense']['enemy']['hp'];self.page.locator('#armamentFire').click()
        self.page.wait_for_function('NERV_TEST.getState().defense.enemy.hp<'+str(before))
        self.assertTrue(self.page.locator('#fxHitNotice').is_visible());self.assertIn('命中',self.page.locator('#fxHitNotice').inner_text())
        self.assertGreater(self.page.locator('#weaponImpactCanvas').evaluate('c=>c.width'),1)
        self.view('eva','damage');self.assertTrue(any(v>0 for v in self.state()['evas'][1]['damage'].values()))
        self.assertIn('近接戦闘',self.page.locator('#neuralDamageNote').inner_text())

    def test_failed_attack_cannot_show_a_hit_or_consume_charge(self):
        self.prepare()
        for action in ['positronSupply','positronCharge','positronCharge','authorize']:self.combat(action)
        before=self.state();self.fail_writes();self.combat('positron',False)
        self.assertEqual(self.state()['defense'],before['defense']);self.assertEqual(self.state()['evaCombat'],before['evaCombat'])
        self.assertFalse(self.page.locator('#fxHitNotice').is_visible())

    def test_personal_contacts_faces_thread_routes_and_local_input_are_safe(self):
        self.boot();self.open('home');self.page.locator('[data-open="messages"]').click()
        self.assertEqual(self.page.locator('[data-message-contact]').count(),3)
        self.page.locator('[data-personal-group="staff"]').click();self.assertEqual(self.page.locator('[data-message-contact]').count(),7)
        self.page.locator('[data-message-contact="maya"]').click();self.assertEqual(self.page.evaluate('location.hash'),'#messages/thread/maya')
        self.assertEqual(self.page.locator('#messagePersonFace [data-staff]').get_attribute('data-staff'),'2')
        self.page.locator('#messageText').fill('<img src=x onerror=window.chatXSS=1>');self.page.locator('#messageComposer button').click()
        self.page.wait_for_function('NERV_MESSAGES.snapshot().state.pending.length===1');self.reply()
        self.assertIn('<img',self.page.locator('#messageThread').inner_text());self.assertEqual(self.page.locator('#messageThread img').count(),0)
        self.assertFalse(self.page.evaluate('Boolean(window.chatXSS)'));self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        self.assertEqual(self.page.evaluate('location.hash'),'#messages/thread/maya');self.assertEqual(self.page.locator('#messagePersonName').inner_text(),'伊吹マヤ')
        self.page.locator('.page.active [data-ops-route="messages/contacts"]').click();self.page.go_back();self.assertEqual(self.page.evaluate('location.hash'),'#messages/thread/maya')

    def test_pending_reply_survives_restart_and_is_received_exactly_once(self):
        self.boot();self.chat('shinji');self.page.evaluate('NERV_MESSAGES.send("今日はどうだった？","daily")')
        original=copy.deepcopy(self.pm());self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        self.assertEqual(self.pm()['pending'],original['pending']);self.reply();self.reply()
        thread=self.pm()['threads']['shinji'];self.assertEqual(len(thread['messages']),2);self.assertEqual(thread['exchanges'],1)
        self.assertEqual(thread['messages'][1]['replyTo'],thread['messages'][0]['id']);self.assertEqual(self.pm()['pending'],[])
        self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(len(self.pm()['threads']['shinji']['messages']),2)

    def test_personal_close_conversation_develops_without_affecting_game_resources(self):
        self.boot();self.chat('maya');before=self.state()
        replies=[]
        for _ in range(3):
            self.page.locator('[data-message-topic="close"]').click();self.page.wait_for_function('NERV_MESSAGES.snapshot().state.pending.length===1');self.reply();replies.append(self.pm()['threads']['maya']['messages'][-1]['text'])
        self.assertNotEqual(replies[0],replies[-1]);self.assertIn('話し慣れた',self.page.locator('#messagePersonStatus').inner_text())
        for key in ['defense','evas','ops','tasks']:self.assertEqual(self.state()[key],before[key])

    def test_busy_pilot_replies_prioritize_sortie_and_real_comms_stop_sending(self):
        self.prepare();self.chat('asuka');self.page.evaluate('NERV_MESSAGES.send("話そう","close")');self.reply()
        self.chat('shinji');self.page.evaluate('NERV_MESSAGES.send("話そう","close")');self.reply()
        self.assertIn('作戦中',self.pm()['threads']['shinji']['messages'][-1]['text'])
        self.view('infra','systems');self.page.locator('#commsToggle').click();self.chat('rei');before=self.pm()
        self.assertFalse(self.page.evaluate('NERV_MESSAGES.send("こんにちは")')['ok']);self.assertEqual(self.pm(),before)

    def test_incoming_reply_keeps_the_active_message_draft_and_focus(self):
        self.boot();self.chat('maya');self.page.locator('#messageText').fill('こんにちは');self.page.locator('#messageComposer button').click()
        self.page.wait_for_function('NERV_MESSAGES.snapshot().state.pending.length===1')
        self.page.locator('#messageText').fill('書きかけの文章');self.page.locator('#messageText').focus();self.reply()
        self.assertEqual(self.page.locator('#messageText').input_value(),'書きかけの文章')
        self.assertEqual(self.page.evaluate('document.activeElement.id'),'messageText');self.assertEqual(len(self.pm()['threads']['maya']['messages']),2)

    def test_message_write_failure_rolls_back_without_creating_pending_reply(self):
        self.boot();self.chat('rei');before=self.pm();self.fail_writes()
        self.assertFalse(self.page.evaluate('NERV_MESSAGES.send("おつかれさま","care")')['ok']);self.assertEqual(self.pm(),before)
        self.page.evaluate('window.immersiveFail=false');self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("おつかれさま","care")')['ok']);self.reply()
        self.assertEqual(len(self.pm()['threads']['rei']['messages']),2)

    def test_corrupt_private_records_are_quarantined_before_normalization(self):
        raw={'schema':1,'sequence':'bad','selected':'unknown','future':'keep','threads':{'rei':{'messages':[{'id':'pm-4','text':'保存済み','from':'contact','at':NOW},{'id':'pm-4','text':'重複','from':'contact','at':NOW},None]},'future-person':{'opaque':1}},'pending':'bad'}
        self.boot({'personalMessages':raw,'futureTop':{'keep':True}})
        self.assertEqual(len(self.pm()['threads']['rei']['messages']),1);self.assertEqual(self.pm()['future'],'keep');self.assertEqual(self.pm()['threads']['future-person'],{'opaque':1})
        backup=self.page.evaluate('JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith("nerv-command-v2-before-world-v212-messages-repair-"))))')
        self.assertEqual(backup['personalMessages'],raw);self.assertEqual(self.state()['futureTop'],{'keep':True})

    def test_future_private_schema_is_not_overwritten(self):
        raw={'schema':9,'future':{'keep':1}}
        self.page.add_init_script(f'Date.now=()=>{NOW}')
        self.load({'prefs':{'showBoot':False,'staffComms':False},'personalMessages':raw});self.page.wait_for_function('NERV_MESSAGES.snapshot().error.length>0')
        self.assertEqual(self.state()['personalMessages'],raw);self.assertFalse(self.page.evaluate('NERV_MESSAGES.send("test")')['ok'])

    def test_automatic_pilot_radio_respects_hidden_and_disabled_preferences(self):
        self.page.clock.install(time=datetime.fromtimestamp(NOW/1000,timezone.utc));self.page.add_init_script('Math.random=()=>0')
        self.load({'prefs':{'showBoot':False,'motion':False,'staffComms':True}});self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        self.page.clock.fast_forward(95000);self.page.wait_for_function('NERV_MESSAGES.snapshot().state.threads.shinji.messages.length===1')
        self.view('messages','preferences');self.page.locator('#messageAutoToggle').click();self.page.wait_for_function('NERV_TEST.getState().prefs.pilotRadio===false')
        self.page.clock.fast_forward(180000);self.assertEqual(len(self.pm()['threads']['shinji']['messages']),1)
        self.page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"))')
        self.assertFalse(self.page.evaluate('NERV_MESSAGES.snapshot().timer'));self.page.clock.fast_forward(600000)
        self.page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:false});document.dispatchEvent(new Event("visibilitychange"))')
        self.assertEqual(len(self.pm()['threads']['shinji']['messages']),1)

    def test_render_scheduler_stops_offscreen_hidden_and_reduced_motion(self):
        self.boot(moving=True);self.view('eva','neural');self.page.locator('#neuralLive').scroll_into_view_if_needed();self.page.wait_for_timeout(150)
        self.assertTrue(self.page.evaluate('NERV_FX.snapshot().scheduled'));before=self.page.evaluate('NERV_FX.snapshot().paintCount');self.page.wait_for_timeout(200)
        self.assertGreater(self.page.evaluate('NERV_FX.snapshot().paintCount'),before)
        self.open('home');count=self.page.evaluate('NERV_FX.snapshot().paintCount');self.page.wait_for_timeout(200);self.assertEqual(self.page.evaluate('NERV_FX.snapshot().paintCount'),count)
        self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
        self.view('magi','streams');self.page.locator('#computeLive').scroll_into_view_if_needed()
        self.page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"))')
        count=self.page.evaluate('NERV_FX.snapshot().paintCount');self.page.wait_for_timeout(200);self.assertEqual(self.page.evaluate('NERV_FX.snapshot().paintCount'),count)
        self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
        self.page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:false});document.dispatchEvent(new Event("visibilitychange"))')
        self.page.emulate_media(reduced_motion='reduce');self.page.wait_for_timeout(100);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))

    def test_repeated_scroll_notifications_do_not_add_extra_render_cycles(self):
        self.boot(moving=True);self.view('eva','neural');self.page.locator('#neuralLive').scroll_into_view_if_needed();self.page.wait_for_timeout(50)
        delta=self.page.evaluate('()=>{const before=NERV_FX.snapshot().paintCount;for(let i=0;i<100;i++)dispatchEvent(new Event("scroll"));return NERV_FX.snapshot().paintCount-before}')
        self.assertEqual(delta,0)
        self.page.emulate_media(reduced_motion='reduce');self.page.wait_for_timeout(50)
        before=self.page.evaluate('NERV_FX.snapshot().paintCount');self.page.evaluate('()=>{for(let i=0;i<100;i++)dispatchEvent(new Event("scroll"))}')
        self.assertEqual(self.page.evaluate('NERV_FX.snapshot().paintCount'),before);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))

    def test_quality_preference_persists_and_canvas_density_is_bounded(self):
        self.boot(moving=True);self.view('settings','effects');self.page.locator('#fxQuality').select_option('low')
        self.page.wait_for_function('NERV_TEST.getState().prefs.fxQuality==="low"');self.view('eva','neural');self.page.locator('#neuralLive').scroll_into_view_if_needed()
        self.assertEqual(self.page.evaluate('NERV_FX.snapshot().rate'),20)
        dimensions=self.page.locator('#neuralLive').evaluate('c=>({width:c.width,css:c.getBoundingClientRect().width})');self.assertLessEqual(dimensions['width'],dimensions['css']+1)
        self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.page.evaluate('NERV_FX.snapshot().quality'),'low')

    def test_magi_diagram_tracks_real_pressure_selected_core_and_666_protection(self):
        self.boot();self.view('magi','external');self.page.locator('#externalStart').click();self.page.wait_for_function('NERV_OPERATIONS.externalState().status==="detected"')
        self.assertEqual(self.page.locator('.fx-magi-compact [data-fx-core]').count(),3)
        self.page.locator('.fx-magi-compact').click();self.assertEqual(self.page.evaluate('location.hash'),'#magi/compute')
        self.page.locator('#computeDiagram [data-fx-core="2"]').click();self.page.wait_for_function('NERV_OPERATIONS.externalState().selected===2')
        for action in ['trace','trace','compile']:self.assertTrue(self.page.evaluate('(a)=>NERV_OPERATIONS.external(a)',action)['ok'])
        self.assertEqual(self.page.locator('#computeDiagram [data-status="protected"]').count(),3)
        self.assertEqual(self.page.locator('#computeDiagram [data-fx-core="0"] .magi-core-readout').text_content(),str(self.page.evaluate('NERV_OPERATIONS.externalState().pressure[0]'))+'%')

    def test_launch_sequence_uses_fixed_selected_eva_and_real_stage_progress(self):
        self.boot({'evas':[{'state':'READY','power':300,'sync':75} for _ in range(3)],'selectedEva':2},moving=True)
        self.view('magi','request');self.page.locator('#magiVote').click();self.page.locator('#seqSkip').click()
        self.view('eva','control');self.page.locator('#evaLaunch').click()
        self.assertTrue(self.page.locator('.launch-shaft').is_visible());self.assertTrue(self.page.locator('.launch-unit').is_visible());self.assertTrue(self.page.locator('.launch-unit').evaluate('el=>getComputedStyle(el).backgroundImage.startsWith("url(")'));self.assertEqual(self.page.locator('.launch-unit').get_attribute('data-unit'),'2')
        self.assertEqual(self.page.locator('.entry-plug-number').text_content(),'02');self.assertEqual(self.state()['evas'][2]['state'],'READY');self.page.wait_for_function('document.querySelector(".seq-emblem").dataset.stage==="2"')
        self.assertIn('RESTRAINT RELEASE',self.page.locator('.launch-cage-label').inner_text())
        self.page.locator('#seqSkip').click();self.assertEqual(self.state()['evas'][2]['state'],'DEPLOYED');self.assertFalse(self.page.evaluate('NERV_TEST.sequenceBusy()'))

    def test_maintenance_clears_contact_report_only_after_successful_save(self):
        self.boot({'selectedEva':1,'evas':[{}, {'state':'MAINTENANCE','power':90,'damage':{'head':4,'torso':12},'damageSource':'保存済み'},{}]})
        self.view('eva','control');before=copy.deepcopy(self.state()['evas'][1]);self.fail_writes()
        self.page.locator('#evaMaintain').click();self.page.wait_for_function('()=>!document.getElementById("shell").inert')
        self.assertEqual(self.state()['evas'][1],before)
        self.page.evaluate('window.immersiveFail=false');self.page.locator('#evaMaintain').click();self.page.wait_for_function('NERV_TEST.getState().evas[1].state==="HANGAR"')
        self.assertEqual(self.state()['evas'][1]['damage'],{'head':0,'torso':0});self.assertEqual(self.state()['evas'][1]['power'],300)
        self.save_and_reload();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready');self.assertEqual(self.state()['evas'][1]['damage']['torso'],0)

    def test_private_backup_failure_preserves_original_and_ui_retry_works(self):
        raw={'schema':1,'sequence':'damaged','threads':{'rei':{'messages':'bad'}},'keep':7}
        self.page.add_init_script("window.failPersonalBackup=true;const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(window.failPersonalBackup&&k.startsWith('nerv-command-v2-before-world-v212-messages'))throw Error('backup failed');return original.call(this,k,v)}")
        self.load({'prefs':{'showBoot':False,'staffComms':False},'personalMessages':raw})
        self.page.wait_for_function('NERV_MESSAGES.snapshot().error.length>0');self.assertEqual(self.state()['personalMessages'],raw)
        self.view('messages','contacts');self.assertTrue(self.page.locator('#messageRetry').is_visible())
        self.page.evaluate('window.failPersonalBackup=false');self.page.locator('#messageRetry').click();self.page.wait_for_function('NERV_MESSAGES.snapshot().ready')
        self.assertEqual(self.pm()['keep'],7)
        backup=self.page.evaluate('JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith("nerv-command-v2-before-world-v212-messages-repair-"))))')
        self.assertEqual(backup['personalMessages'],raw)

    def test_pending_response_is_held_during_comms_outage_and_resumes_once(self):
        self.boot();self.chat('rei');self.assertTrue(self.page.evaluate('NERV_MESSAGES.send("今日はどう？","daily")')['ok'])
        self.view('infra','systems');self.page.locator('#commsToggle').click();self.reply()
        self.assertEqual(len(self.pm()['pending']),1);self.assertEqual(len(self.pm()['threads']['rei']['messages']),1)
        self.page.locator('#commsToggle').click();self.reply();self.reply()
        self.assertEqual(self.pm()['pending'],[]);self.assertEqual(len(self.pm()['threads']['rei']['messages']),2)

    def test_canvas_unavailable_keeps_svg_state_and_controls_usable(self):
        self.page.add_init_script("const previous=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='2d'?null:previous.call(this,kind,...args)}")
        self.boot();self.view('magi','compute');self.assertTrue(self.page.locator('#computeDiagram svg').is_visible())
        self.view('magi','streams');self.assertIn('三基',self.page.locator('#computeReadout').inner_text());self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
        self.view('eva','neural');self.assertIn('%',self.page.locator('#neuralSync').inner_text())

    def test_long_magi_alarm_and_five_staff_list_fit_new_mobile_views(self):
        self.boot();self.page.evaluate('NERV_OPERATIONS.external("start")')
        self.view('messages','contacts');self.page.locator('[data-personal-group="staff"]').click()
        self.view('mission','armament');self.page.locator('[data-armament="positron"]').click()
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for page,view in VIEWS:
                with self.subTest(width=width,page=page,view=view):
                    self.view(page,view);self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width)
        self.view('messages','contacts');self.page.locator('[data-message-contact="aoba"]').click()
        self.assertEqual(self.page.locator('#messagePersonName').inner_text(),'青葉シゲル')

    def test_all_new_views_fit_iphone_widths_in_normal_and_emergency_states(self):
        self.boot()
        for emergency in [False,True]:
            if emergency:self.view('infra','systems');self.page.locator('#commsToggle').click()
            for width in [320,390,430]:
                self.page.set_viewport_size({'width':width,'height':844})
                for page,view in VIEWS:
                    with self.subTest(emergency=emergency,width=width,view=view):
                        self.view(page,view);self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width)
                        self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)
                self.view('mission','armament');self.page.locator('[data-armament="positron"]').click();self.view('mission','weapon-control')
                self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150)

if __name__=='__main__':unittest.main(verbosity=2)
