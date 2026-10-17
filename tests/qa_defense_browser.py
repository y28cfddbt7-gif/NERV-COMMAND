"""v2.7 city combat, resource economy, MAGI isolation and save compatibility."""
import json
import unittest
from browser_support import BrowserCase, ROOT


class DefenseTests(BrowserCase):
    def test_defense_economy_victory_and_turn_vote_expiry(self):
        self.load()
        self.open('infra')
        self.page.locator('#v27Detect').click()
        d = self.state()['defense']
        self.assertEqual((d['status'], d['caseNo'], d['energy']), ('active', 1, 90))
        for sector in range(3):
            self.defense('sector', sector)
            self.page.locator('#v27Turret').click()
        self.assertEqual(self.state()['defense']['parts'], 60)
        for _ in range(2):
            self.page.locator('#v27Scan').click()
        self.assertEqual(self.state()['defense']['scans'], 68)
        self.assertEqual(self.state()['defense']['energy'], 66)
        self.open('magi')
        self.defense('judge')
        self.assertEqual(self.state()['defense']['magivote'], [True, True, True])
        self.open('infra')
        self.page.locator('#v27Advance').click()
        d = self.state()['defense']
        self.assertEqual(d['round'], 1)
        self.assertIsNone(d['magivote'])
        self.assertEqual(d['magiround'], -1)
        self.assertLess(d['enemy']['hp'], 115)
        self.assertEqual(d['energy'], 58)
        self.page.locator('#v27Advance').click()
        self.assertEqual(self.state()['defense']['status'], 'victory')
        self.assertEqual(self.state()['defense']['wins'], 1)
        self.assertGreater(self.state()['ops']['xp'], 0)
        self.page.locator('#v27Detect').click()
        self.assertEqual(self.state()['defense']['caseNo'], 2)
        self.assertEqual(self.state()['defense']['enemy']['hp'], 145)

    def test_damage_repair_supply_defeat_and_persistence(self):
        self.load()
        self.defense('detect')
        for _ in range(14):
            if self.state()['defense']['status'] != 'active':
                break
            self.defense('advance')
        d = self.state()['defense']
        self.assertEqual(d['status'], 'defeat')
        self.assertEqual(d['losses'], 1)
        self.assertLess(d['city'][1]['hp'], 100)
        damaged = d['city']
        self.defense('detect')
        self.assertEqual(self.state()['defense']['city'], damaged, 'Damage must survive the next case')
        self.defense('sector', 1)
        old = self.state()['defense']
        self.defense('repair')
        repaired = self.state()['defense']
        self.assertEqual(repaired['parts'], old['parts'] - 18)
        self.assertEqual(repaired['city'][1]['hp'], min(100, old['city'][1]['hp'] + 27))
        self.defense('armor')
        self.assertTrue(self.state()['defense']['city'][1]['armor'])
        self.defense('scan')
        old = self.state()['defense']
        self.defense('energy')
        self.assertEqual(self.state()['defense']['spares'], old['spares']-1)
        self.assertEqual(self.state()['defense']['energy'], min(100, old['energy']+38))
        saved = self.save_and_reload()
        self.assertEqual(self.state()['defense'], saved['defense'])

    def test_simple_magi_rejects_unprepared_interception(self):
        self.load()
        self.open('magi')
        self.page.locator('#magiPurpose').select_option('intercept')
        self.page.locator('#magiVote').click()
        self.assertFalse(self.state()['magi']['vote']['approved'])
        self.assertIn('未達条件', self.page.locator('#magiDecision').inner_text())
        self.assertEqual(self.page.locator('.magi-consensus article').count(), 3)
        self.assertEqual(self.page.locator('[data-v27isolate], #nxMagiCheck, #v27SecDetect').count(), 0)

    def test_legacy_save_keeps_progress_and_initializes_missing_systems(self):
        old = json.loads((ROOT / 'tests/fixtures/legacy_v26_state.json').read_text())
        self.load(old)
        s = self.state()
        for field in ['tasks', 'selectedEva', 'legacyExtension']:
            self.assertEqual(s[field], old[field])
        self.assertEqual(s['ops']['xp'], 135)
        self.assertEqual(s['ops']['missions'], 3)
        self.assertEqual(s['mission']['phase'], 5)
        self.assertEqual(s['evas'][1]['power'], 197, 'No retroactive debit without legacy timestamp')
        self.assertEqual(s['evas'][2]['state'], 'MAINTENANCE')
        self.assertEqual(s['tactics']['charge'], 80, 'Existing v2.5 advanced-mission migration')
        self.assertEqual(s['defense']['status'], 'idle')
        self.assertEqual(len(s['defense']['city']), 4)
        self.save_and_reload()
        reloaded = self.state()
        self.assertEqual(reloaded['tasks'], old['tasks'])
        self.assertEqual(reloaded['ops']['xp'], 135)
        self.assertEqual(reloaded['legacyExtension'], old['legacyExtension'])

    def test_support_shot_prerequisites_and_umbilical_power(self):
        self.load({'prefs':{'motion':False}, 'mission':{'phase':4},
                   'evas':[{'state':'HANGAR','power':300,'sync':75,'at':False},
                           {'state':'DEPLOYED','power':300,'sync':85,'at':False},
                           {'state':'HANGAR','power':300,'sync':75,'at':False}],
                   'magi':{'approvedFor':1}, 'ops':{'currentMissionLocks':1},
                   'tactics':{'charge':88,'heat':20,'attacker':1,'defender':0}})
        self.defense('detect')
        self.defense('scan')
        self.defense('scan')
        initial = self.state()
        self.defense('shoot')
        self.assertEqual(self.state()['defense']['enemy']['hp'], initial['defense']['enemy']['hp'],
                         'Current-turn tactical MAGI approval is required')
        self.defense('judge')
        self.open('infra')
        self.page.locator('#v27Cable').click()
        self.assertTrue(self.state()['defense']['connected'])
        before = self.state()['evas'][1]['power']
        self.defense('advance')
        self.assertGreater(self.state()['evas'][1]['power'], before-5, 'Cable prevents the 32-second turn debit')
        self.page.locator('#v27Cable').click()
        before = self.state()['evas'][1]['power']
        self.defense('advance')
        self.assertLessEqual(self.state()['evas'][1]['power'], before-32)
        self.defense('shoot')
        self.assertEqual(self.state()['tactics']['charge'], 88, 'Expired vote must block firing')
        self.defense('judge')
        old_hp = self.state()['defense']['enemy']['hp']
        self.defense('shoot')
        self.assertEqual(self.state()['defense']['enemy']['hp'], old_hp-round(60+68*.33))
        self.assertEqual(self.state()['tactics']['charge'], 0)
        hp = self.state()['defense']['enemy']['hp']
        self.defense('shoot')
        self.assertEqual(self.state()['defense']['enemy']['hp'], hp, 'A second uncharged shot must be blocked')


if __name__ == '__main__':
    unittest.main(verbosity=2)
