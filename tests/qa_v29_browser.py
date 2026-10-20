# Historical reducer controls may be hidden by the v2.19 public console.
# Their DOM events below check compatibility; current user interaction is in qa_v219_browser.
"""Additive v2.9 portraits/666 presentation on the unchanged 07f2242 workflow."""
import unittest
from browser_support import BrowserCase, RESULTS


class V29Tests(BrowserCase):
    def test_approved_pilot_faces_keep_unit_mapping_and_existing_confirmation(self):
        self.load({'prefs':{'showBoot':False,'staffComms':False},'evas':[{'sync':71.6},{'sync':83.4},{'sync':79.2}]})
        self.view('eva','pilots')
        self.assertEqual(self.page.locator('.pilot-select [data-pilot]').evaluate_all('(els)=>els.map(e=>e.dataset.pilot)'),['1','2','0'])
        image=self.page.locator('.pilot-portrait').first.evaluate('(e)=>getComputedStyle(e).backgroundImage')
        dimensions=self.page.evaluate('''async src=>{const img=new Image();img.src=src.slice(5,-2);await img.decode();return [img.naturalWidth,img.naturalHeight]}''',image)
        self.assertGreater(dimensions[0],1000)
        for unit,name,sync in [(1,'碇シンジ','83.4%'),(2,'惣流・アスカ・ラングレー','79.2%'),(0,'綾波レイ','71.6%')]:
            self.page.locator(f'[data-pilot="{unit}"]').click()
            self.assertEqual(self.state()['selectedEva'],unit)
            self.assertEqual(self.page.locator('#pilotName').inner_text(),name)
            self.assertEqual(self.page.locator('#pilotSync').inner_text(),sync)
            self.assertEqual(self.page.locator(f'[data-pilot="{unit}"]').get_attribute('aria-pressed'),'true')
        self.page.locator('#pilotConfirm').click()
        self.assertIn('綾波レイ',self.page.locator('#toast').inner_text())
        self.page.screenshot(path=str(RESULTS/'v29-approved-pilot-faces.png'),full_page=True)

    def test_adaptive_intrusion_stays_separate_from_666_external_hacking(self):
        self.load({'prefs':{'showBoot':False,'motion':False}})
        self.view('magi','main')
        self.page.locator('#intrusionStart').evaluate('(b)=>b.click()')
        self.page.wait_for_function("NERV_TEST.getState().magi.intrusion?.status==='detected'")
        self.assertEqual(self.page.locator('#magi666Program').get_attribute('data-active'),'false')
        self.assertNotIn('666',self.page.locator('[data-intrusion-action="isolate"]').inner_text())
        self.assertIn('666',self.page.locator('#external666').inner_text())
        self.page.locator('[data-intrusion-action="isolate"]').evaluate('(b)=>b.click()')
        self.assertEqual(self.page.locator('#magi666Program').get_attribute('data-active'),'true')
        self.assertIn('内部侵食は別途対処',self.page.locator('#magi666State').inner_text())
        self.assertTrue(self.page.locator('#magiVote').is_disabled())
        for action in ('analyze','reverse','execute'):
            self.page.locator(f'[data-intrusion-action="{action}"]').evaluate('(b)=>b.click()')
        self.assertEqual(self.state()['magi']['intrusion']['status'],'contained')
        self.assertEqual(self.page.locator('#magi666Program').get_attribute('data-active'),'false')
        self.assertIsNone(self.state()['magi']['approvedFor'])


if __name__=='__main__':unittest.main(verbosity=2)
