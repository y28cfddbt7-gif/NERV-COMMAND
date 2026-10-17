"""Cross-system sortie/mission regression with real DOM and HTTP storage."""
import unittest
from browser_support import BrowserCase


class MissionTests(BrowserCase):
    def test_sortie_magi_charge_lock_fire_and_empty_charge_guard(self):
        self.load()
        self.open('mission')
        for _ in range(3):
            self.page.locator('#missionAction').click()
        self.assertEqual(self.state()['mission']['phase'], 3)
        # No sortie: mission stays at phase 3 and sends the user to EVA.
        self.page.locator('#missionAction').click()
        self.assertEqual(self.state()['mission']['phase'], 3)
        self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'), 'eva')
        self.page.locator('[data-eva="1"]').click()
        self.page.locator('#evaPrepare').click()
        self.assertEqual(self.state()['evas'][1]['state'], 'READY')
        self.assertTrue(self.page.locator('#evaLaunch').is_disabled())
        self.page.locator('.page.active [data-v26go="magi"]').first.click()
        self.page.locator('#magiVote').click()
        self.assertEqual(self.state()['magi']['approvedFor'], 1)
        self.page.locator('.page.active [data-v26go="eva"]').first.click()
        self.page.locator('#evaLaunch').click()
        self.assertEqual(self.state()['evas'][1]['state'], 'DEPLOYED')
        self.page.locator('.page.active [data-v26go="mission"]').first.click()
        for _ in range(4):
            self.page.locator('#v26ChargeAction').click()
        self.assertEqual(self.state()['tactics']['charge'], 88)
        self.page.locator('#missionAction').click()
        self.assertEqual(self.state()['mission']['phase'], 4)
        self.page.locator('#missionAction').click()
        self.assertEqual(self.state()['mission']['phase'], 4, 'Aim lock is required')
        self.page.locator('#nxLockButton').click()
        self.assertGreaterEqual(self.state()['ops']['currentMissionLocks'], 1)
        self.page.locator('#missionAction').click()
        self.assertEqual(self.state()['mission']['phase'], 5)
        self.page.locator('#missionAction').click()
        self.page.wait_for_function('window.NERV_TEST.getState().tactics.shots === 1')
        self.assertEqual(self.state()['mission']['phase'], 6)
        self.assertEqual(self.state()['tactics']['charge'], 0)
        self.page.locator('#missionReset').click()
        for _ in range(4):
            self.page.locator('#missionAction').click()
        self.page.locator('#nxLockButton').click()
        self.page.locator('#missionAction').click()
        self.assertEqual(self.state()['mission']['phase'], 5)
        self.page.locator('#missionAction').click()
        self.assertEqual(self.state()['mission']['phase'], 5, 'Empty-charge fire must be denied')
        self.assertEqual(self.state()['tactics']['shots'], 1)
        self.open('eva')
        self.page.locator('#evaATButton').click()
        self.assertTrue(self.state()['evas'][1]['at'])
        self.assertIn('at-on', self.page.locator('#evaArtwork').get_attribute('class'))
        self.page.locator('[data-eva="0"]').click()
        self.assertNotIn('at-on', self.page.locator('#evaArtwork').get_attribute('class'))


if __name__ == '__main__':
    unittest.main(verbosity=2)
