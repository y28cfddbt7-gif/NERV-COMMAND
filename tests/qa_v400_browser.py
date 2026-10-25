"""v4 real browser: verify the ACTUAL 390px command terminal rather than static text."""
from browser_support import BrowserCase

class CleanCommandTest(BrowserCase):
    def test_real_tactical_panel_and_standalone_map(self):
        self.load()
        self.open('battle')
        panel=self.page.locator('#v400Station')
        self.assertTrue(panel.is_visible())
        self.assertEqual(self.page.locator('#v323Frame:visible').count(),0)
        self.assertEqual(self.page.locator('#v228SectorGrid:visible').count(),0)
        self.assertEqual(self.page.locator('#v400Station [data-v400-tab]').count(),4)
        self.assertEqual(self.page.locator('#v400Station [data-v400-cell]').count(),9)
        self.assertTrue(self.page.locator('#v400Svg .v400-road').count()>0)
        self.assertTrue(self.page.locator('#v400Svg .v400-gridline path').count()>0)
        self.assertTrue(self.page.locator('#v400Radio').is_visible())
        box=self.page.locator('#v400Map').bounding_box()
        svg=self.page.locator('#v400Svg').bounding_box()
        self.assertTrue(box and svg)
        self.assertAlmostEqual(svg['x'],box['x'],delta=2)
        self.assertAlmostEqual(svg['y'],box['y'],delta=2)
        self.assertAlmostEqual(svg['width'],box['width'],delta=2)
        self.assertGreaterEqual(box['height'],270)
        self.assertLessEqual(panel.bounding_box()['width'],390)
        self.assertNotIn('v310Operations',self.page.locator('#v400Station').inner_html())
        self.assertTrue(self.page.evaluate('window.NERV_V400.snapshot().independent'))
        self.assertEqual(self.page.locator('#v226AlertStrip:visible').count(),0)
        self.assertEqual(self.page.locator('#commandAlert:visible').count(),0)
        self.assertTrue(self.page.locator('#v400Panel').is_visible())
        # The real phase-based panel contains a saved-command workflow.
        self.assertTrue(self.page.locator('#v400PanelBody').inner_text().strip())
        self.page.screenshot(path=str(self.RESULTS/'v400_390px.png') if hasattr(self,'RESULTS') else 'test-results/v400_390px.png',full_page=True)

    def test_offline_webview_boot_does_not_wait_for_maplibre(self):
        # On iPhone 4G the CDN may stall forever. No external request is
        # permitted until the user explicitly opens geographic mapping.
        attempted=[]
        self.page.on('request',lambda req: attempted.append(req.url) if 'unpkg.com' in req.url else None)
        self.context.route('https://unpkg.com/**',lambda route: None)
        self.load()
        self.assertTrue(self.page.locator('#v400Station').count()==1)
        self.assertEqual(attempted,[])
        self.assertEqual(self.page.locator('#nervBootDiagnostics:visible').count(),0)
        self.assertEqual(self.page.locator('head link[href*="maplibre-gl"]').count(),0)

    def test_user_action_never_runs_on_a_fake_map(self):
        self.load()
        self.open('battle')
        self.assertTrue(self.page.locator('#v400Station').is_visible())
        self.assertTrue(self.page.locator('#v400Panel').is_visible())
        self.assertFalse(self.page.locator('#v400Station [data-v400-cell="1,2"]').is_enabled())
        self.page.locator('#v400Station [data-v400-act="alert"]').click()
        self.assertTrue(self.page.locator('#alertReview').is_visible())
        self.assertTrue(self.page.locator('#v400Station').is_visible())
