"""Offline browser regressions for the shipped v2.7 UI (legacy filename retained)."""
import unittest
from browser_support import BrowserCase, RESULTS

PAGES = ['home', 'weather', 'infra', 'eva', 'magi', 'mission', 'tools', 'settings']


class LayoutTests(BrowserCase):
    def test_eight_screens_at_three_iphone_widths(self):
        self.load()
        checks = 0
        for width in [320, 390, 430]:
            self.page.set_viewport_size({'width':width, 'height':844})
            for name in PAGES:
                with self.subTest(width=width, screen=name):
                    self.open(name)
                    self.assertTrue(self.page.locator('.page.active').is_visible())
                    overflow = self.page.evaluate('document.documentElement.scrollWidth - innerWidth')
                    self.assertLessEqual(overflow, 3, (width, name, overflow))
                    self.assertEqual(self.page.locator('.page').count(), 8)
                    if name == 'eva':
                        self.page.wait_for_function('Array.from(document.querySelectorAll(".eva-painted")).every(i=>i.complete && i.naturalWidth>0)')
                    if width == 390:
                        self.page.screenshot(path=str(RESULTS / f'{name}-390.png'), full_page=True)
                    checks += 1
        self.assertEqual(checks, 24)

    def test_at_field_tracks_each_unit_during_animation_and_resize(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.load({'evas':[{'state':'DEPLOYED','power':300,'sync':75,'at':True} for _ in range(3)]})
        self.open('eva')
        for width in [320, 390, 430]:
            self.page.set_viewport_size({'width':width, 'height':844})
            for unit in [0, 1, 2]:
                with self.subTest(width=width, unit=unit):
                    self.page.locator(f'[data-eva="{unit}"]').click()
                    self.assertEqual(self.page.locator('#evaArtwork').get_attribute('data-unit'), str(unit))
                    self.assertIn('at-on', self.page.locator('#evaArtwork').get_attribute('class'))
                    for delay in [120, 300]:
                        self.page.wait_for_timeout(delay)  # Sample two actual animation phases.
                        centers = self.page.evaluate('''() => {
                            const x = s => {const r=document.querySelector(s).getBoundingClientRect();return r.x+r.width/2};
                            return [x('.eva-reference-rig'), x('.v26-at-field'), x('.eva-measure-ring')];
                        }''')
                        self.assertLess(max(centers)-min(centers), 1, centers)
        self.page.screenshot(path=str(RESULTS / 'at-field-430.png'), full_page=True)


if __name__ == '__main__':
    unittest.main(verbosity=2)
