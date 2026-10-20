# Historical reducer controls may be hidden by the v2.19 public console.
# Their DOM events below check compatibility; current user interaction is in qa_v219_browser.
"""Staff commands, explicit alert acknowledgement and transactional recovery."""
import unittest
from browser_support import BrowserCase, RESULTS


class StaffRecoveryTests(BrowserCase):
    def faulty_state(self):
        return {'prefs':{'motion':False,'showBoot':False},'infra':{'power':False,'comms':False,'armor':True},
                'evas':[{'state':'POWER_LOST','power':0,'sync':72,'at':False},
                        {'state':'MAINTENANCE','power':15,'sync':84,'at':False},
                        {'state':'READY','power':123,'sync':78,'at':False}],
                'tasks':[{'id':'retain','text':'職員連絡テスト','done':False}],
                'ops':{'xp':125,'missions':4,'currentMissionLocks':1}, 'mission':{'phase':5},
                'tactics':{'charge':83,'heat':90,'shots':3},
                'defense':{'status':'active','caseNo':3,'round':4,'parts':49,'wins':2,'losses':1,
                           'energy':5,'breach':50,'shutdown':True,'security':20,
                           'enemy':{'hp':43,'maxHp':130,'dist':1,'lane':2,'force':33,'code':'SYNTHETIC'},
                           'city':[{'hp':50,'turret':True},{'hp':12},{'hp':0},{'hp':70}]},
                'customExtension':{'preserve':True}}

    def test_continue_keeps_state_and_escape_returns_focus(self):
        self.load(self.faulty_state())
        before=self.state()
        self.page.locator('#commandAlertOpen').click()
        self.assertTrue(self.page.locator('#alertReview').is_visible())
        self.assertTrue(self.page.locator('#alertContinue').evaluate('(e)=>e===document.activeElement'))
        self.page.locator('#alertContinue').click()
        self.assertEqual(self.state(),before)
        self.assertTrue(self.page.locator('#commandAlert').is_visible())
        self.page.locator('#commandAlertOpen').click()
        self.page.keyboard.press('Escape')
        self.assertFalse(self.page.locator('#alertReview').is_visible())
        self.assertTrue(self.page.locator('#commandAlertOpen').evaluate('(e)=>e===document.activeElement'))

    def test_clear_backs_up_and_recovers_all_systems_without_erasing_records(self):
        self.load(self.faulty_state())
        old=self.state()
        self.page.locator('#commandAlertOpen').click()
        self.page.screenshot(path=str(RESULTS/'staff-alert-confirmation.png'),full_page=True)
        self.page.locator('#alertClear').click()
        self.page.wait_for_function("window.NERV_TEST.getState().infra.power && window.NERV_TEST.getState().mission.phase===0")
        self.assertFalse(self.page.locator('#alertReview').is_visible())
        s=self.state()
        self.assertEqual(s['infra'],{'power':True,'comms':True,'armor':False})
        self.assertTrue(all(e['state']=='HANGAR' and e['power']==300 and not e['at'] and e['powerUpdatedAt'] is None for e in s['evas']))
        self.assertEqual([e['sync'] for e in s['evas']],[e['sync'] for e in old['evas']])
        self.assertEqual(s['defense']['status'],'idle')
        self.assertIsNone(s['defense']['enemy'])
        self.assertTrue(all(c['hp']==100 for c in s['defense']['city']))
        for field in ['parts','wins','losses','caseNo']:
            self.assertEqual(s['defense'][field],old['defense'][field])
        self.assertEqual(s['tasks'],old['tasks'])
        self.assertEqual(s['customExtension'],old['customExtension'])
        self.assertEqual(s['ops']['xp'],125)
        self.assertEqual(s['ops']['missions'],4)
        self.assertEqual(s['tactics']['shots'],3)
        backup=self.page.evaluate("JSON.parse(localStorage.getItem('nerv-command-v2-before-alert-clear'))")
        self.assertEqual(backup,old)
        self.assertFalse(self.page.locator('#commandAlert').is_visible())
        self.save_and_reload()
        self.assertEqual(self.state()['infra']['power'],True)
        self.assertEqual(self.state()['defense']['status'],'idle')
        self.assertEqual(self.state()['tasks'],old['tasks'])

    def test_backup_failure_cannot_clear_an_alert(self):
        self.load(self.faulty_state())
        before=self.state()
        self.page.evaluate("() => {const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2-before-alert-clear')throw Error('test quota');return original.call(this,k,v)}}")
        self.page.locator('#commandAlertOpen').click()
        self.page.locator('#alertClear').click()
        self.page.wait_for_function("document.getElementById('alertReviewDescription').textContent.includes('クリアを中止')")
        self.assertEqual(self.state(),before)
        self.assertTrue(self.page.locator('#commandAlert').is_visible())

    def test_persist_failure_rolls_back_recovery(self):
        self.load(self.faulty_state())
        before=self.state()
        self.page.evaluate("() => {const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='nerv-command-v2')throw Error('test write failure');return original.call(this,k,v)}}")
        self.page.locator('#commandAlertOpen').click()
        self.page.locator('#alertClear').click()
        self.page.wait_for_function("document.getElementById('alertReviewDescription').textContent.includes('復旧状態の保存')")
        self.assertEqual(self.state(),before)
        self.assertTrue(self.page.locator('#commandAlert').is_visible())

    def test_clear_cancels_a_pending_eva_sequence(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.load()
        self.view('eva','control')
        self.page.locator('#evaPrepare').click()
        self.assertTrue(self.page.evaluate('window.NERV_TEST.sequenceBusy()'))
        self.page.evaluate("window.NERV_TEST.reviewAlert('end')")
        self.page.locator('#alertClear').click()
        self.page.wait_for_function('!window.NERV_TEST.sequenceBusy()')
        self.page.wait_for_timeout(2900)
        self.assertTrue(all(e['state']=='HANGAR' for e in self.state()['evas']))
        self.assertFalse(self.page.locator('#sequenceOverlay').is_visible())

    def test_intercept_approval_expires_when_turn_advances(self):
        self.load({'infra':{'armor':True},'mission':{'phase':5},'tactics':{'charge':80,'attacker':1},
                   'ops':{'currentMissionLocks':1},'evas':[
                       {'state':'HANGAR','power':300,'sync':72},
                       {'state':'DEPLOYED','power':300,'sync':84},
                       {'state':'HANGAR','power':300,'sync':78}]})
        self.defense('detect');self.defense('scan');self.defense('scan')
        self.open('magi')
        self.page.locator('#magiPurpose').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("change",{bubbles:true}))}', 'intercept')
        self.page.locator('#magiVote').evaluate('(b)=>b.click()')
        self.assertTrue(self.state()['magi']['interceptApproval']['approved'])
        self.defense('advance')
        self.open('magi')
        self.assertIn('失効',self.page.locator('#magiLiveState').inner_text())
        shots=self.state()['tactics']['shots']
        self.open('mission');self.page.locator('#missionAction').evaluate('(b)=>b.click()')
        self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),'magi')
        self.assertEqual(self.state()['tactics']['shots'],shots)

    def test_two_votes_can_approve_when_required_intercept_conditions_hold(self):
        self.load({'infra':{'armor':True},'mission':{'phase':5},'tactics':{'charge':80,'attacker':1},
                   'ops':{'currentMissionLocks':1},'evas':[
                       {'state':'HANGAR','power':300,'sync':72},
                       {'state':'DEPLOYED','power':45,'sync':84},
                       {'state':'HANGAR','power':300,'sync':78}]})
        self.defense('detect');self.defense('scan');self.defense('scan')
        self.open('magi');self.page.locator('#magiPurpose').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("change",{bubbles:true}))}', 'intercept')
        self.page.locator('#magiVote').evaluate('(b)=>b.click()')
        decision=self.state()['magi']['vote']
        self.assertEqual(decision['count'],2)
        self.assertTrue(decision['approved'])
        self.assertIn('2対1',self.page.locator('#magiDecision').inner_text())

    def test_destroyed_city_facility_is_an_alert_and_clear_restores_it(self):
        self.load({'defense':{'city':[{'hp':0},{'hp':100},{'hp':100},{'hp':100}]}})
        self.assertEqual(self.page.locator('#commandAlertTitle').inner_text(),'都市防衛網 損傷')
        self.page.locator('#commandAlertOpen').click();self.page.locator('#alertClear').click()
        self.page.wait_for_function("window.NERV_TEST.getState().defense.city[0].hp===100")
        self.assertFalse(self.page.locator('#commandAlert').is_visible())


if __name__=='__main__':unittest.main(verbosity=2)
