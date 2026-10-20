"""Retained historical reducers: sortie/interception and backed-up recovery.
Current public battle interaction is tested in qa_v219_browser.
"""
import unittest
from browser_support import BrowserCase


class MissionTests(BrowserCase):
    def test_guided_mission_from_detection_to_two_approved_shots_and_standby(self):
        self.load()
        self.open('mission')
        for phase in [1,2,3]:
            self.page.locator('#missionAction').evaluate('(b)=>b.click()')
            self.assertEqual(self.state()['mission']['phase'], phase)
        self.assertEqual(self.state()['tactics']['charge'], 80)
        self.page.locator('#missionAction').evaluate('(b)=>b.click()')
        self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'), 'eva')
        self.assertEqual(self.state()['selectedEva'], 1)
        self.page.locator('#evaPrepare').click()
        self.assertTrue(self.page.locator('#evaLaunch').is_disabled())
        self.page.locator('#evaMagiButton').click()
        self.assertEqual(self.page.locator('#magiPurpose').input_value(), 'sortie')
        self.page.locator('#magiVote').evaluate('(b)=>b.click()')
        self.assertEqual(self.state()['magi']['approvedFor'], 1)
        self.page.locator('#magiReturn').evaluate('(b)=>b.click()')
        self.page.locator('#evaLaunch').click()
        self.assertEqual(self.state()['evas'][1]['state'], 'DEPLOYED')
        self.open('mission')
        self.page.locator('#missionAction').evaluate('(b)=>b.click()')
        self.assertEqual(self.state()['mission']['phase'], 4)
        self.page.locator('#missionAction').evaluate('(b)=>b.click()')
        self.assertEqual(self.state()['mission']['phase'], 5)
        self.assertEqual(self.state()['ops']['currentMissionLocks'], 1)
        self.assertEqual(self.state()['defense']['scans'], 68)
        self.assertEqual(self.page.locator('#nxLockButton, #v26Postures, #v26ChargeAction').count(), 0)
        for shot in [1,2]:
            self.page.locator('#missionAction').evaluate('(b)=>b.click()')
            self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'), 'magi')
            self.assertEqual(self.page.locator('#magiPurpose').input_value(), 'intercept')
            self.page.locator('#magiVote').evaluate('(b)=>b.click()')
            self.assertTrue(self.state()['magi']['interceptApproval']['approved'])
            self.page.locator('#magiReturn').evaluate('(b)=>b.click()')
            self.page.locator('#missionAction').evaluate('(b)=>b.click()')
            self.assertEqual(self.state()['tactics']['shots'], shot)
            self.assertEqual(self.state()['tactics']['charge'], 0)
            if shot==1:
                self.assertEqual(self.state()['mission']['phase'], 5)
                self.page.locator('#missionAction').evaluate('(b)=>b.click()')
                self.assertEqual(self.state()['tactics']['charge'], 80)
        self.assertEqual(self.state()['defense']['status'], 'victory')
        self.assertEqual(self.state()['mission']['phase'], 6)
        self.assertEqual(self.state()['ops']['missions'], 1)
        self.page.locator('#missionReset').evaluate('(b)=>b.click()')
        self.page.locator('#alertClear').click()
        self.page.wait_for_function("window.NERV_TEST.getState().mission.phase === 0")
        self.assertTrue(all(e['state']=='HANGAR' for e in self.state()['evas']))
        self.assertFalse(self.page.locator('#commandAlert').is_visible())


if __name__ == '__main__':
    unittest.main(verbosity=2)
