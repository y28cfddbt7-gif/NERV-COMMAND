import hashlib,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class V216VendorTests(unittest.TestCase):
    def test_offline_three_distribution_and_license_are_pinned(self):
        for name,sha in json.loads((ROOT/'tests/fixtures/v2_16_vendor.json').read_text())['sha256'].items():
            self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),sha,name)
        self.assertIn('Copyright © 2010-2023 three.js authors',(ROOT/'app.js').read_text())
        self.assertNotIn('src="https://threejs.org',(ROOT/'index.html').read_text())
    def test_numeric_instance_port_credits_the_official_source(self):
        s=(ROOT/'src/browser/v216-three-instances.js').read_text();self.assertIn('MIT three/instance.js',s);self.assertIn('getInstances',s);self.assertIn('commitChanges',s);self.assertNotIn('requestAnimationFrame',s)
