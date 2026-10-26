"""Regression guard for the production-graph audit (not for runtime equivalence)."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ArchitectureAuditTests(unittest.TestCase):
    def test_audit_is_reproducible_and_respects_reviewed_growth_budget(self):
        with tempfile.TemporaryDirectory() as output:
            command = [
                sys.executable, str(ROOT / "scripts/audit_architecture.py"),
                "--check", "--out-dir", output
            ]
            result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            report = json.loads((Path(output) / "architecture-audit.json").read_text())
            summary = (Path(output) / "architecture-audit.md").read_text()
            self.assertEqual(report["issues"], [])
            self.assertEqual(report["version"], "4.0.4")
            self.assertLessEqual(
                report["loaded"]["browser_modules"],
                report["growth_budget"]["max_browser_modules"]
            )
            self.assertLessEqual(
                report["loaded"]["style_modules"],
                report["growth_budget"]["max_style_modules"]
            )
            self.assertIn("architecture audit", summary.lower())
            self.assertGreater(report["repository_bulk"]["dist_file_count"], 0)

    def test_manifest_exclusion_is_not_claimed_to_be_safe_for_deletion(self):
        with tempfile.TemporaryDirectory() as output:
            subprocess.run(
                [sys.executable, "scripts/audit_architecture.py", "--out-dir", output],
                cwd=ROOT, check=True, capture_output=True
            )
            report = json.loads((Path(output) / "architecture-audit.json").read_text())
            self.assertIn("NOT proof", report["not_in_build_manifest"]["warning"])


if __name__ == "__main__":
    unittest.main()
