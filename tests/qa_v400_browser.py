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
        self.assertEqual(self.page.locator('#v400Map #v400Main [data-v400-tab]').count(),4)
        self.assertEqual(self.page.locator('#v400Station > #v400Main').count(),0)
        self.assertTrue(self.page.locator('#v400Map #v400Main').is_visible())
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
        self.assertGreaterEqual(box['height'],320)
        self.assertAlmostEqual(box['width'],box['height'],delta=2.0)
        self.assertEqual(self.page.locator('#v400Svg').get_attribute('preserveAspectRatio'),'xMidYMid meet')
        self.assertGreater(self.page.locator('#v400Svg .v400-district').count(),0)
        dock=self.page.locator('#v400Main').bounding_box()
        taps=self.page.locator('#v400Station .v400-map-taps').bounding_box()
        self.assertTrue(dock and taps)
        # Dock is wholly below the active 3x3 sector hit area.
        self.assertGreaterEqual(dock['y'],taps['y']+taps['height']-1)
        self.assertLessEqual(dock['y']+dock['height'],box['y']+box['height'])
        self.assertLessEqual(taps['y']+taps['height'],box['y']+box['height'])
        for action in ['analysis','move','attack','defense']:
            button=self.page.locator('#v400Main [data-v400-tab="'+action+'"]')
            self.assertGreaterEqual(button.bounding_box()['height'],44)
        for cell in self.page.locator('#v400Map [data-v400-cell]').all():
            rect=cell.bounding_box()
            self.assertTrue(rect and rect['height']>=44)
            x=rect['x']+rect['width']/2
            y=rect['y']+rect['height']/2
            self.assertTrue(self.page.evaluate('([x,y])=>!!document.elementFromPoint(x,y)?.closest("[data-v400-cell]")',[x,y]))

        self.assertLessEqual(panel.bounding_box()['width'],390)
        self.assertNotIn('v310Operations',self.page.locator('#v400Station').inner_html())
        self.assertTrue(self.page.evaluate('window.NERV_V400.snapshot().independent'))
        self.assertEqual(self.page.locator('#v226AlertStrip:visible').count(),0)
        self.assertEqual(self.page.locator('#commandAlert:visible').count(),0)
        self.assertEqual(self.page.locator('#v315SecurityGuide').count(),0)
        self.assertEqual(self.page.locator('#v315CityDesk').count(),0)
        self.assertEqual(self.page.evaluate('window.__NERV_BOOT_STAGE__'), 'src/browser/scope-close.js')
        self.assertTrue(self.page.evaluate('window.__NERV_BOOT_BUNDLE_COMPLETE__'))
        self.assertTrue(self.page.evaluate('window.__NERV_V400_RENDERED__'))

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
