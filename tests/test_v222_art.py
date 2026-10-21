"""The additional inspection image is pinned separately from every protected asset."""
import hashlib,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class V222ArtTests(unittest.TestCase):
    def test_battery_painting_is_pinned_bounded_and_keeps_original_fixtures(self):
        f=json.loads((ROOT/'tests/fixtures/v2_22_battery_art.json').read_text())
        for name,sha in f['sha256'].items():
            data=(ROOT/name).read_bytes();self.assertEqual(hashlib.sha256(data).hexdigest(),sha)
            self.assertEqual(data[:4],b'RIFF');self.assertEqual(data[8:12],b'WEBP');self.assertEqual(len(data),f['bytes']);self.assertLess(len(data),700000)
            self.assertIn(name,json.loads((ROOT/'src/build.json').read_text())['assets'])
        self.assertTrue(set(f['sha256']).isdisjoint(json.loads((ROOT/'tests/fixtures/v2_11_fixed_visuals.json').read_text())['sha256']))
