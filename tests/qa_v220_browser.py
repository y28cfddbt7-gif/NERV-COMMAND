"""Public directory, focus/navigation, unmodified RGB weapon art with real alpha masking."""
import unittest
from browser_support import BrowserCase, RESULTS


class V220Tests(BrowserCase):
    def boot(self):
        self.load({'prefs': {'showBoot': False, 'motion': False, 'staffComms': False}})
        self.page.wait_for_function('!!window.NERV_TERMINAL_UI')

    def menu(self, page='infra', view='systems'):
        if page == 'home':self.open('home')
        else:self.view(page, view)
        selector = '#commandLauncher [data-terminal-menu]' if page == 'home' else '.console-magi-header [data-terminal-menu]' if page == 'magi' and view == 'main' else '.battle-top [data-terminal-menu]' if page == 'battle' else '#terminalContext [data-terminal-menu]'
        self.page.locator(selector).click()
        self.assertTrue(self.page.locator('#terminalMenu').is_visible())
        return selector

    def test_search_matches_aliases_and_empty_results_and_escape_restores_focus(self):
        self.boot()
        selector = self.menu('home',None)
        self.page.locator('#terminalSearch').fill('666')
        self.assertEqual(self.page.evaluate('NERV_TERMINAL_UI.snapshot().visibleDestinations'), ['magi'])
        self.page.locator('#terminalSearch').fill('存在しない機能')
        self.assertEqual(self.page.locator('[data-terminal-destination]:visible').count(), 0)
        self.assertTrue(self.page.locator('#terminalMenuEmpty').is_visible())
        self.page.locator('#terminalSearch').press('Escape')
        self.assertTrue(self.page.locator(selector).evaluate('(e)=>document.activeElement===e'))
        self.assertEqual(self.page.locator(selector).get_attribute('aria-expanded'), 'false')
        self.assertFalse(self.page.evaluate('NERV_TERMINAL_UI.snapshot().menuOpen'))

    def test_all_destinations_use_real_routes_and_canonical_battle_stage(self):
        self.boot()
        for page in ['work','hq','messages','battle','eva','magi','infra','mission','weather','tools','settings','home']:
            self.menu()
            self.page.locator('[data-terminal-destination="'+page+'"]').click()
            self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),page)
            self.assertFalse(self.page.locator('#terminalMenu').is_visible())
            self.assertNotEqual(self.page.evaluate('document.body.style.overflow'),'hidden')
            self.assertEqual(self.page.locator('.mobile-view:visible').count(), 0 if page == 'home' else 1)
        self.menu()
        self.page.locator('[data-terminal-destination="battle"]').click()
        self.assertEqual(self.page.evaluate('location.hash'),'#battle/setup')

    def test_menu_tab_focus_is_contained_and_opening_does_not_progress_world(self):
        self.boot()
        self.view('infra','systems')
        before=self.state()
        self.page.locator('#terminalContext [data-terminal-menu]').click()
        self.assertEqual(self.state(),before)
        self.page.locator('#terminalMenuClose').press('Shift+Tab')
        self.assertTrue(self.page.locator('[data-terminal-destination="home"]').evaluate('(e)=>document.activeElement===e'))
        self.page.keyboard.press('Tab')
        self.assertTrue(self.page.locator('#terminalMenuClose').evaluate('(e)=>document.activeElement===e'))
        self.page.locator('#terminalSearch').fill('通信')
        self.assertEqual(self.state(),before)
        self.page.locator('#terminalMenuClose').click()
        self.assertEqual(self.state(),before)

    def test_bottom_navigation_has_five_large_destinations_and_current_location(self):
        self.boot()
        self.view('infra','systems')
        buttons=self.page.locator('.bottom-nav [data-nav]')
        self.assertEqual(buttons.count(),5)
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for b in buttons.all():
                bounds=b.bounding_box();self.assertGreaterEqual(bounds['width'],44);self.assertGreaterEqual(bounds['height'],44)
        self.page.locator('.bottom-nav [data-nav="messages"]').click()
        self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),'messages')
        self.assertEqual(self.page.locator('.bottom-nav [aria-current="page"]').get_attribute('data-nav'),'messages')
        self.assertIn('メッセージ',self.page.locator('#terminalSectionName').inner_text())

    def test_history_and_reload_restore_context_without_creating_extra_entries(self):
        self.boot()
        self.menu();self.page.locator('[data-terminal-destination="messages"]').click()
        self.menu('messages','contacts');self.page.locator('[data-terminal-destination="eva"]').click()
        self.page.go_back();self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),'messages')
        self.assertIn('メッセージ',self.page.locator('#terminalSectionName').inner_text())
        self.page.go_forward();self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),'eva')
        self.page.reload(wait_until='domcontentloaded');self.page.wait_for_function('!!window.NERV_TERMINAL_UI')
        self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'),'eva')
        self.assertIn('EVA管理',self.page.locator('#terminalSectionName').inner_text())

    def test_weapon_masks_have_transparent_background_and_cutouts_with_opaque_metal(self):
        self.boot();self.view('mission','weapon-detail')
        result=self.page.evaluate('''async()=>{
          const el=document.querySelector('[data-weapon-art="knife"]');
          const mask=getComputedStyle(el).maskImage,art=getComputedStyle(el).backgroundImage;
          const load=async value=>{const im=new Image();im.src=value.slice(5,-2);await im.decode();return im;};
          const m=await load(mask),a=await load(art),c=document.createElement('canvas');c.width=m.width;c.height=m.height;
          const x=c.getContext('2d');x.drawImage(m,0,0);const p=(u,v)=>[...x.getImageData(u,v,1,1).data];
          return {maskSize:[m.width,m.height],artSize:[a.width,a.height],corner:p(0,0),gap:p(60,200),handle:p(1000,297),trigger:p(725,445),knife:p(1000,100),rifle:p(1150,360),positron:p(1000,690),different:mask!==art};
        }''')
        self.assertEqual(result['maskSize'],[1774,887]);self.assertEqual(result['artSize'],[1774,887]);self.assertTrue(result['different'])
        for name in ['corner','gap','handle','trigger']:self.assertEqual(result[name][3],0,name)
        for name in ['knife','rifle','positron']:self.assertGreater(result[name][3],240,name)
        positions=[]
        for kind in ['knife','rifle','positron']:
            self.page.locator('[data-detail-weapon="'+kind+'"]').click()
            positions.append(self.page.locator('.weapon-detail-scroll [data-weapon-art]').evaluate('(e)=>{const s=getComputedStyle(e);return [s.backgroundPosition,s.maskPosition]}'))
        for background,mask in positions:self.assertEqual(background,mask)
        self.assertEqual(len(set(p[0] for p in positions)),3)
        self.page.screenshot(path=str(RESULTS/'v220-weapon.png'),full_page=True)

    def test_directory_and_key_screens_fit_phone_widths_and_dialog_scrolls(self):
        self.boot()
        for width in [320,390,430]:
            self.page.set_viewport_size({'width':width,'height':844})
            for page,view in [('home',None),('magi','main'),('magi','config'),('battle','setup'),('mission','weapon-detail'),('messages','contacts'),('eva','control'),('infra','systems')]:
                self.page.evaluate('([p,v])=>NERV_MOBILE.open(p,v)',[page,view])
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1,(page,view,width))
                self.assertLess(self.page.evaluate('document.documentElement.scrollHeight'),1150,(page,view,width))
            self.menu()
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
            self.assertLessEqual(self.page.locator('.terminal-menu-panel').bounding_box()['height'],844)
            self.page.locator('[data-terminal-destination="home"]').click()
        self.page.set_viewport_size({'width':390,'height':844})
        self.page.screenshot(path=str(RESULTS/'v220-home.png'),full_page=True)
        self.menu('magi','main');self.page.screenshot(path=str(RESULTS/'v220-menu.png'),full_page=True)
        self.page.locator('#terminalMenuClose').click();self.page.screenshot(path=str(RESULTS/'v220-magi.png'),full_page=True)

    def test_presentation_adds_no_animation_scheduler_and_zoom_is_allowed(self):
        self.boot();self.view('magi','main')
        before=self.page.evaluate('NERV_FX.snapshot()')
        for _ in range(3):
            self.page.locator('.console-magi-header [data-terminal-menu]').click()
            self.page.locator('#terminalMenuClose').click()
        after=self.page.evaluate('NERV_FX.snapshot()')
        self.assertFalse(after['scheduled']);self.assertEqual(before['scheduled'],after['scheduled'])
        self.assertNotIn('maximum-scale=1',self.page.locator('meta[name=viewport]').get_attribute('content'))
        self.assertEqual(self.page.locator('.shell').evaluate('(e)=>getComputedStyle(e,"::before").display'),'none')


if __name__ == '__main__':unittest.main(verbosity=2)
