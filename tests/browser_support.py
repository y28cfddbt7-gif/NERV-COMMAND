"""Real HTTP origin and offline Chromium fixtures; no disabled web security."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import shutil
from threading import Thread
import unittest
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / 'test-results'


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class BrowserCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
        cls.thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/index.html'
        cls.playwright = sync_playwright().start()
        executable = os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('chromium-browser')
        options = {'executable_path': executable} if executable else {}
        try:
            cls.browser = cls.playwright.chromium.launch(headless=True, args=['--no-sandbox'], **options)
        except Exception:
            cls.playwright.stop()
            cls.server.shutdown()
            cls.server.server_close()
            raise
        RESULTS.mkdir(exist_ok=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width':390, 'height':844}, reduced_motion='reduce')
        self.context.route('**/*', lambda r: r.continue_()
                           if urlsplit(r.request.url).netloc == urlsplit(self.url).netloc else r.abort())
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda e: self.errors.append(str(e)))

    def tearDown(self):
        try:
            self.assertEqual(self.errors, [], 'Uncaught JavaScript errors')
        finally:
            self.context.close()

    def load(self, state=None):
        if state is not None:
            encoded = json.dumps(json.dumps(state))
            self.page.add_init_script("if (!localStorage.getItem('nerv-command-v2')) "
                                      f"localStorage.setItem('nerv-command-v2', {encoded});")
        self.page.goto(self.url, wait_until='domcontentloaded')
        self.page.wait_for_function('!!window.NERV_V27_TEST')
        if self.page.locator('#bootSkip').is_visible():
            self.page.locator('#bootSkip').click()

    def open(self, name):
        self.page.evaluate('(name)=>window.NERV_TEST.open(name)', name)
        self.assertEqual(self.page.locator('.page.active').get_attribute('data-page'), name)

    def state(self):
        return self.page.evaluate('window.NERV_TEST.getState()')

    def defense(self, action, argument=None):
        return self.page.evaluate('([action,arg])=>window.NERV_V27_TEST[action](arg)', [action, argument])

    def save_and_reload(self):
        # persist() intentionally debounces writes by 180 ms. Wait for the actual data.
        self.page.wait_for_function("() => localStorage.getItem('nerv-command-v2') === JSON.stringify(window.NERV_TEST.getState())")
        expected = self.page.evaluate("JSON.parse(localStorage.getItem('nerv-command-v2'))")
        self.page.reload(wait_until='domcontentloaded')
        self.page.wait_for_function('!!window.NERV_V27_TEST')
        return expected
