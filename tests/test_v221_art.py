"""Pin the authorized repaired Angel sheet without changing historical art fixtures."""
import hashlib,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class V221ArtTests(unittest.TestCase):
    def test_repaired_sheet_is_pinned_lossless_bounded_and_additive(self):
        fixture=json.loads((ROOT/'tests/fixtures/v2_21_angel_art.json').read_text())
        manifest=json.loads((ROOT/'src/build.json').read_text())
        for name,sha in fixture['sha256'].items():
            data=(ROOT/name).read_bytes()
            self.assertEqual(hashlib.sha256(data).hexdigest(),sha)
            self.assertEqual(data[:4],b'RIFF');self.assertEqual(data[8:12],b'WEBP')
            self.assertIn(b'VP8L',data[:24]);self.assertEqual(len(data),fixture['total_bytes'])
            self.assertLess(len(data),1000000);self.assertIn(name,manifest['assets'])
        self.assertIn('assets/angels_v215.webp',manifest['assets'])
        self.assertTrue(set(fixture['sha256']).isdisjoint(json.loads((ROOT/'tests/fixtures/v2_15_additions.json').read_text())['sha256']))
