"""Guard the user's specified equipment independently of the fixed EVA and command artwork."""
import hashlib
import json
from pathlib import Path
import re
import unittest
ROOT=Path(__file__).resolve().parents[1]

class EquipmentTests(unittest.TestCase):
    def test_reference_equipment_and_existing_pallet_shapes_remain_fixed(self):
        source=(ROOT/'src/browser/v212-imagery.js').read_text()
        expected=json.loads((ROOT/'tests/fixtures/v2_13_equipment.json').read_text())['sha256']
        for kind,digest in expected.items():
            with self.subTest(kind=kind):
                shape=re.search(r'<g class="entry-plug-diagram".*?</text></g></g>',source).group() if kind=='entry-plug' else re.search(r"  "+kind+r":'(.*)'",source).group(1)
                self.assertEqual(hashlib.sha256(shape.encode()).hexdigest(),digest)
