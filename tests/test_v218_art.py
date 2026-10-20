"""Original city bitmaps remain separate, pinned and bounded for mobile delivery."""
import hashlib,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class V218ArtTests(unittest.TestCase):
    def test_original_city_assets_are_pinned_and_compressed(self):
        fixture=json.loads((ROOT/'tests/fixtures/v2_18_city_art.json').read_text());total=0
        for name,sha in fixture['sha256'].items():
            data=(ROOT/name).read_bytes();self.assertEqual(hashlib.sha256(data).hexdigest(),sha,name);self.assertEqual(data[:4],b'RIFF');self.assertEqual(data[8:12],b'WEBP');total+=len(data)
        self.assertEqual(total,fixture['total_bytes']);self.assertLessEqual(total,1700000)
    def test_city_bitmaps_are_additive_and_do_not_change_old_fixed_sheets(self):
        old=json.loads((ROOT/'tests/fixtures/v2_11_fixed_visuals.json').read_text())['sha256'];new=json.loads((ROOT/'tests/fixtures/v2_18_city_art.json').read_text())['sha256'];self.assertTrue(set(old).isdisjoint(new));manifest=json.loads((ROOT/'src/build.json').read_text());self.assertTrue(set(new)<=set(manifest['assets']))
