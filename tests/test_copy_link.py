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
    def run_helper(self, remote='a'*40+'\trefs/heads/feature/ui', dirty='', origin='https://github.com/owner/repo.git', starter=False, runtime_dirty='', runtime_ref='feature/ui', runtime_ancestor=True, runtime_matches=True):
        target = copy_link.FILE.replace('_SCRIPTABLE.js', '_STARTER.js') if starter else copy_link.FILE
        responses = {
            ('remote','get-url','origin'):origin,
            ('branch','--show-current'):'feature/ui',
            ('rev-parse','HEAD'):'a'*40,
            ('ls-remote','origin','refs/heads/feature/ui'):remote,
            ('status','--porcelain','--',target):dirty,
            ('cat-file','-e','HEAD:'+target):'',
        }
        if starter:
            responses[('status','--porcelain','--',copy_link.FILE)] = runtime_dirty
            responses[('merge-base',runtime_ref,'a'*40)] = runtime_ref if runtime_ancestor else 'd'*40
            responses[('rev-parse',runtime_ref+':'+copy_link.FILE)] = 'c'*40
            responses[('rev-parse','HEAD:'+copy_link.FILE)] = ('c' if runtime_matches else 'd')*40
        output = io.StringIO()
        with patch.object(copy_link, 'git', side_effect=lambda *args:responses[args]), \
             patch.object(copy_link.json, 'loads', return_value={'scriptable_runtime_ref':runtime_ref}), \
             patch.object(copy_link.subprocess, 'run') as build_check, contextlib.redirect_stdout(output):
            copy_link.main(starter=starter)
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

    def test_small_starter_link_pins_the_published_commit(self):
        self.assertEqual(self.run_helper(starter=True), 'https://github.com/owner/repo/blob/'+'a'*40+'/'+copy_link.FILE.replace('_SCRIPTABLE.js', '_STARTER.js'))

    def test_starter_rejects_runtime_on_another_branch(self):
        with self.assertRaisesRegex(ValueError, 'runtime ref'):
            self.run_helper(starter=True, runtime_ref='main')

    def test_starter_rejects_uncommitted_runtime_even_when_starter_is_clean(self):
        with self.assertRaisesRegex(ValueError, 'runtime has uncommitted'):
            self.run_helper(starter=True, runtime_dirty=' M '+copy_link.FILE)

    def test_starter_accepts_identical_runtime_on_a_published_immutable_ancestor(self):
        self.assertIn('/blob/'+'a'*40+'/',self.run_helper(starter=True,runtime_ref='b'*40))

    def test_starter_rejects_an_unreachable_runtime_commit(self):
        with self.assertRaisesRegex(ValueError,'not an ancestor'):
            self.run_helper(starter=True,runtime_ref='b'*40,runtime_ancestor=False)

    def test_starter_rejects_a_pinned_ancestor_with_different_runtime_bytes(self):
        with self.assertRaisesRegex(ValueError,'differs'):
            self.run_helper(starter=True,runtime_ref='b'*40,runtime_matches=False)


if __name__ == '__main__':
    unittest.main()
