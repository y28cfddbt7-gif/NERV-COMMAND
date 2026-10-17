"""The delivery helper rejects unpublished/stale code instead of inventing a link."""
import contextlib
import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('copy_link', ROOT / 'scripts/copy_link.py')
copy_link = importlib.util.module_from_spec(spec)
spec.loader.exec_module(copy_link)


class CopyLinkTests(unittest.TestCase):
    def run_helper(self, remote='a'*40+'\trefs/heads/feature/ui', dirty='', origin='https://github.com/owner/repo.git'):
        responses = {
            ('remote','get-url','origin'):origin,
            ('branch','--show-current'):'feature/ui',
            ('rev-parse','HEAD'):'a'*40,
            ('ls-remote','origin','refs/heads/feature/ui'):remote,
            ('status','--porcelain','--',copy_link.FILE):dirty,
            ('cat-file','-e','HEAD:'+copy_link.FILE):'',
        }
        output = io.StringIO()
        with patch.object(copy_link, 'git', side_effect=lambda *args:responses[args]), \
             patch.object(copy_link.subprocess, 'run') as build_check, contextlib.redirect_stdout(output):
            copy_link.main()
            build_check.assert_called_once()
        return output.getvalue().strip()

    def test_verified_remote_produces_exact_commit_link(self):
        self.assertEqual(self.run_helper(), 'https://github.com/owner/repo/blob/'+'a'*40+'/'+copy_link.FILE)

    def test_unpublished_branch_has_no_link(self):
        with self.assertRaisesRegex(ValueError, 'not published'):
            self.run_helper(remote='')

    def test_uncommitted_export_has_no_link(self):
        with self.assertRaisesRegex(ValueError, 'uncommitted'):
            self.run_helper(dirty=' M '+copy_link.FILE)

    def test_ssh_origin_is_converted_to_web_link(self):
        self.assertTrue(self.run_helper(origin='git@github.com:owner/repo.git').startswith('https://github.com/owner/repo/'))


if __name__ == '__main__':
    unittest.main()
