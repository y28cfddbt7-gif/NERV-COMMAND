"""Repaired sprites, committed state-driven radio/records and shared bounded effects."""
import unittest
from browser_support import BrowserCase, RESULTS
import qa_v219_browser as console_helpers


class V221Tests(BrowserCase):
    boot=console_helpers.V219Tests.boot
    cmd=console_helpers.V219Tests.cmd
    b=console_helpers.V219Tests.b
    m=console_helpers.V219Tests.m
    snap=console_helpers.V219Tests.snap
    idle=console_helpers.V219Tests.idle
    click=console_helpers.V219Tests.click
    start=console_helpers.V219Tests.start
    aim=console_helpers.V219Tests.aim
    move=console_helpers.V219Tests.move
    win=console_helpers.V219Tests.win

    def journal(self):return self.page.evaluate('NERV_CHRONICLE.snapshot()')
    def beats(self):return [r['beat'] for r in self.journal()['scenes']]

    def test_public_sortie_records_personalized_real_readiness_and_identification(self):
        self.boot();self.assertNotIn('chronicle',self.state());self.start()
        self.assertEqual(self.beats(),['deployed','approved','ready','detected'])
        self.assertTrue(all(r['unit']==1 for r in self.journal()['scenes']))
        self.assertEqual(self.journal()['scenes'][0]['speaker'],'shinji')
        self.assertNotIn('identified',self.beats());self.b('scan')
        self.assertIn('identified',self.beats());self.assertIn('PATTERN BLUE',self.page.locator('#storyTitle').inner_text())
        self.assertEqual(self.state()['defense']['scans'],34)
        before=self.journal();self.page.evaluate('NERV_TEST.open("battle")');self.assertEqual(self.journal(),before)

    def test_failed_persist_rolls_back_journal_and_emits_no_drama(self):
        self.boot();self.start();before=self.journal()
        self.page.evaluate('()=>{window.storySignals=0;addEventListener("nerv-chronicle",()=>storySignals++);window.savedSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="nerv-command-v2")throw Error("disk-full");return savedSet.call(this,k,v)}}')
        self.b('scan',ok=False);self.assertEqual(self.journal(),before);self.assertEqual(self.page.evaluate('storySignals'),0)
        self.assertEqual(self.state()['defense']['scans'],0)
        self.page.evaluate('()=>{Storage.prototype.setItem=savedSet}');self.b('scan');self.assertEqual(self.page.evaluate('storySignals'),1)

    def test_denied_approval_creates_no_false_approval_story(self):
        self.boot();self.b('start',{'angel':'sachiel'});self.b('prepare')
        self.page.locator('#powerToggle').evaluate('(b)=>b.click()');self.idle();self.b('approve')
        self.assertNotIn('approved',self.beats());self.assertIsNone(self.state()['magi']['approvedFor'])
        self.assertEqual(self.state()['evas'][1]['state'],'READY')

    def test_miss_and_successful_hit_are_distinct_and_victory_survives_reload(self):
        self.boot();self.start();self.b('scan');self.b('scan');self.move(0,2);self.move(0,1);self.b('at');self.b('neutralize');self.b('weapon',{'weapon':'rifle'})
        self.aim(.04,.08);self.click('#tacticalFire');self.assertIn('miss',self.beats());self.assertNotIn('hit',self.beats())
        for _ in range(5):
            if self.state()['defense']['status']!='active':break
            if self.state()['evaCombat']['exposedUntil']<=self.state()['defense']['round']:self.b('neutralize')
            self.aim();self.click('#tacticalFire')
        self.assertEqual(self.state()['defense']['status'],'victory');self.assertIn('hit',self.beats());self.assertEqual(self.beats().count('victory'),1)
        before=self.journal();self.save_and_reload();self.assertEqual(self.journal(),before)
        self.assertIsNone(self.page.evaluate('NERV_DRAMA.snapshot().effect'))
        self.view('mission','dossier');self.page.locator('#angelJournal > summary').click();self.assertIn('CASE',self.page.locator('#chronicleCase').inner_text())
        self.assertGreater(int(self.page.locator('#chroniclePage').inner_text().split('/')[1]),5)

    def test_ramiel_charge_and_shamshel_identity_have_specific_records(self):
        self.boot();self.start('ramiel','positron');self.b('scan');self.b('scan');self.move(0,3);self.b('charge');self.b('charge')
        self.assertIn('charged',self.beats());self.assertEqual(self.page.evaluate('NERV_DRAMA.snapshot().effect.beat'),'charged')
        self.assertEqual(self.journal()['scenes'][0]['angel'],'ramiel')
        self.view('mission','dossier');self.page.locator('[data-dossier-angel="ramiel"]').click();self.assertIn('ヤシマ作戦',self.page.locator('#dossierLore').inner_text());self.assertIn('単機演習',self.page.locator('#dossierSimulation').inner_text())
        self.boot();self.start('shamshel');self.b('scan');self.assertEqual(self.journal()['scenes'][0]['angel'],'shamshel');self.assertIn('シャムシェル',self.page.locator('#storyText').inner_text())

    def test_dossier_is_read_only_and_uses_independent_accordion_and_named_pilot_contact(self):
        self.boot();self.start();before=self.state();self.view('mission','dossier')
        for angel in ['sachiel','shamshel','ramiel']:
            self.page.locator('[data-dossier-angel="'+angel+'"]').click()
            self.assertEqual(self.page.locator('#dossierPortrait').get_attribute('data-angel'),angel)
        self.assertEqual(self.state()['defense'],before['defense']);self.assertEqual(self.journal(),{'schema':1,'scenes':before['chronicle']['scenes'],'error':''})
        self.page.locator('#angelJournal > summary').click();self.assertFalse(self.page.locator('#angelReference').get_attribute('open'))
        self.page.locator('#chronicleNextScene').click();self.page.locator('#chronicleContact').click();self.assertEqual(self.page.evaluate('NERV_MESSAGES.snapshot().contact'),'shinji')

    def test_future_and_corrupt_journals_are_preserved_without_blocking_combat(self):
        for raw in [{'schema':8,'opaque':'keep'}, {'schema':1,'scenes':[{'not':'a scene'}],'opaque':'keep'}]:
            self.boot({'chronicle':raw});self.start();self.b('scan')
            self.assertEqual(self.state()['chronicle'],raw);self.assertEqual(self.state()['defense']['scans'],34)
            self.assertTrue(self.journal()['error']);self.view('mission','dossier');self.assertTrue(self.page.locator('#chronicleError').is_visible())

    def test_repeated_analysis_is_not_repeated_radio_and_old_cases_are_bounded(self):
        self.boot();self.start();self.b('scan');self.b('scan');self.assertEqual(self.beats().count('identified'),1)
        scene=self.journal()['scenes'][0]
        # Preserve a valid unknown extension, while testing capacity with recorded-case shapes.
        seed=self.state();seed['chronicle']['opaque']={'keep':True};seed['chronicle']['scenes']=[{**scene,'id':str(i)+':detected','caseKey':'old-'+str(i),'caseNo':i} for i in range(1,8)]
        self.boot(seed);self.b('at');records=self.journal()['scenes'];self.assertLessEqual(len(set(r['caseKey'] for r in records)),6);self.assertEqual(self.state()['chronicle']['opaque'],{'keep':True})

    def test_repaired_atlas_is_used_and_roster_and_field_keep_correct_aspect(self):
        self.boot();self.view('battle','setup')
        for el in self.page.locator('#consoleTargets .angel-art').all():
            box=el.bounding_box();self.assertAlmostEqual(box['width']/box['height'],.5,delta=.015)
        result=self.page.locator('#consoleTargets .angel-art').first.evaluate('''async el=>{const im=new Image();im.src=getComputedStyle(el).backgroundImage.slice(5,-2);await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);return {size:[im.width,im.height],corner:x.getImageData(0,0,1,1).data[3],mask:x.getImageData(270,245,1,1).data[3]};}''')
        self.assertEqual(result['size'],[1536,1024]);self.assertEqual(result['corner'],0);self.assertGreater(result['mask'],240)
        self.start();box=self.page.locator('#battleAngelSprite').bounding_box();self.assertAlmostEqual(box['width']/box['height'],.5,delta=.015)
        self.view('mission','dossier');self.page.evaluate('window.scrollTo(0,0)');self.page.screenshot(path=str(RESULTS/'v221-dossier.png'),full_page=True)

    def test_mobile_dossier_and_new_radio_leave_buttons_accessible_in_three_widths(self):
        self.boot();self.start();self.b('scan')
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for page,view in [('battle','engage'),('mission','dossier')]:
                self.view(page,view);self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1,(page,width));self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1250,(page,width))
            self.page.locator('#angelJournal > summary').click();self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1250);self.page.locator('#angelReference summary').click()
        self.view('battle','engage');self.assertTrue(self.page.locator('#battleStory').is_visible());self.page.evaluate('window.scrollTo(0,0)');self.page.screenshot(path=str(RESULTS/'v221-radio.png'),full_page=True)
        self.view('mission','dossier');self.page.locator('#angelJournal > summary').click();self.page.evaluate('window.scrollTo(0,0)');self.page.screenshot(path=str(RESULTS/'v221-journal.png'),full_page=True)

    def test_shared_effect_draws_statically_and_can_be_disabled_without_erasing_records(self):
        self.boot();self.start();self.b('scan');snap=self.page.evaluate('NERV_DRAMA.snapshot()');self.assertGreater(snap['frames'],0);self.assertTrue(snap['effect']['finished']);self.assertFalse(snap['ownRAF']);self.assertFalse(self.page.evaluate('NERV_FX.snapshot().scheduled'))
        before=self.journal();self.view('settings','effects');self.assertFalse(self.page.locator('#fxMode').is_visible());self.page.locator('.chronicle-diagnostics > summary').click();self.assertTrue(self.page.locator('#fxMode').is_visible());self.assertEqual(self.journal(),before);self.click('#storyEffects');self.assertFalse(self.state()['prefs']['storyCinematics']);self.assertEqual(self.journal(),before)
        self.view('battle','engage');self.assertFalse(self.page.locator('#battleStory').is_visible());self.assertIsNone(self.page.evaluate('NERV_DRAMA.snapshot().effect'))
        self.b('scan');self.assertEqual(self.beats().count('identified'),1)

    def test_defeat_and_explicit_recovery_keep_the_received_record(self):
        self.boot({'evas':[{}, {'tacticalIntegrity':2}, {}]});self.start();self.move(1,2);self.b('wait')
        self.assertEqual(self.state()['defense']['status'],'defeat');self.assertIn('defeat',self.beats());self.assertNotIn('victory',self.beats())
        before=self.journal();self.click('#battleAlertReview');self.click('#alertClear');self.page.wait_for_function('NERV_TEST.getState().defense.status==="idle"')
        self.assertEqual(self.journal(),before)
        self.b('start',{'angel':'shamshel'});self.assertIn('defeat',self.beats());self.assertEqual(self.journal()['scenes'][0]['angel'],'shamshel')

    def test_motion_effect_expires_on_the_shared_hook_and_stops_offscreen(self):
        self.boot({'prefs':{'showBoot':False,'motion':True,'staffComms':False,'securityAuto':False,'magiFaultAuto':False}});self.page.emulate_media(reduced_motion='no-preference');self.start()
        before=self.page.evaluate('NERV_DRAMA.snapshot().frames');self.b('scan')
        self.page.wait_for_function('(n)=>NERV_DRAMA.snapshot().frames>n+2',arg=before)
        self.page.wait_for_function('NERV_DRAMA.snapshot().effect.finished',timeout=4000)
        self.open('home');frames=self.page.evaluate('NERV_DRAMA.snapshot().frames');self.page.wait_for_timeout(180)
        self.assertEqual(self.page.evaluate('NERV_DRAMA.snapshot().frames'),frames);self.assertFalse(self.page.evaluate('NERV_DRAMA.snapshot().ownRAF'))


if __name__=='__main__':unittest.main(verbosity=2)
