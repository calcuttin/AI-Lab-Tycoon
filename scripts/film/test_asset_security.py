import pathlib, tempfile, unittest
from unittest.mock import patch
import fetch_assets as assets

class AssetSecurityTests(unittest.TestCase):
 def test_rejects_unsafe_destinations(self):
  with tempfile.TemporaryDirectory() as tmp:
   base = pathlib.Path(tmp) / 'asset'
   base.mkdir()
   (base / 'link').symlink_to(pathlib.Path(tmp), target_is_directory=True)
   for path in ['../escape', '/tmp/escape', 'textures/../../escape', 'link/escape', '.']:
    with self.subTest(path=path), self.assertRaises(ValueError):
     assets.safe_destination(base, path)
   self.assertEqual(assets.safe_destination(base, 'textures/diffuse.jpg'), base.resolve() / 'textures/diffuse.jpg')
 def test_rejects_untrusted_urls_and_redirects(self):
  for url in ['file:///etc/passwd', 'http://dl.polyhaven.org/a', 'https://dl.polyhaven.org.evil.test/a', 'https://127.0.0.1/a', 'https://user@dl.polyhaven.org/a', 'https://dl.polyhaven.org:444/a']:
   with self.subTest(url=url), self.assertRaises(ValueError):
    assets.validate_url(url)
  self.assertEqual(assets.validate_url('https://dl.polyhaven.org/file.jpg'), 'https://dl.polyhaven.org/file.jpg')
  with self.assertRaises(ValueError):
   assets.SafeRedirect().redirect_request(None, None, 302, '', {}, 'http://127.0.0.1/private')
 def test_malicious_metadata_cannot_write_outside_folder(self):
  with tempfile.TemporaryDirectory() as tmp:
   root = pathlib.Path(tmp) / 'assets'
   folder = root / 'model'
   folder.mkdir(parents=True)
   import json
   folder.joinpath('files.json').write_text(json.dumps({'blend': {'1k': {'blend': {'url': 'https://dl.polyhaven.org/model.blend', 'md5': '', 'include': {'../../escape': {'url': 'https://dl.polyhaven.org/evil', 'md5': ''}}}}}}))
   with patch.object(assets, 'ROOT', root), patch.object(assets, 'SELECTION', {'model': ('model', '1k')}), patch.object(assets, 'request') as request:
    with self.assertRaises(ValueError): assets.fetch('model')
    request.assert_not_called()
   self.assertFalse((pathlib.Path(tmp) / 'escape').exists())

if __name__ == '__main__': unittest.main()
