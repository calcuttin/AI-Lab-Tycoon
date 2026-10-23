"""Download this shot's CC0 source assets. Powered by Poly Haven.
Run again to verify existing files and fetch missing ones. Never loads scripts.
"""
import concurrent.futures, hashlib, json, pathlib, urllib.request, urllib.parse
ROOT = pathlib.Path(__file__).resolve().parents[2] / 'art/garage-proof/assets'
SELECTION = {
 'garage_floor': ('material','2k'), 'painted_plaster_wall': ('material','2k'),
 'grey_roof_01': ('material','2k'), 'golden_gate_hills': ('hdri','2k'),
 'tree_small_02': ('model','1k'), 'shrub_01': ('model','1k'),
 'metal_office_desk': ('model','2k'), 'plastic_monobloc_chair_01': ('model','2k'),
}
ALLOWED_HOSTS = {'api.polyhaven.com', 'dl.polyhaven.org'}
def validate_url(url):
 parsed = urllib.parse.urlsplit(url)
 if parsed.scheme != 'https' or parsed.hostname not in ALLOWED_HOSTS or parsed.username or parsed.password or parsed.port not in (None, 443):
  raise ValueError('Asset URL must use an approved HTTPS host')
 return url
class SafeRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self, req, fp, code, msg, headers, newurl):
  validate_url(newurl)
  return super().redirect_request(req, fp, code, msg, headers, newurl)
def safe_destination(folder, relative):
 relative = pathlib.Path(relative)
 if relative.is_absolute() or '..' in relative.parts:
  raise ValueError('Asset path must remain inside its asset folder')
 base = folder.resolve()
 target = (base / relative).resolve()
 if base not in target.parents:
  raise ValueError('Asset path escapes its asset folder')
 return target
def request(url):
 return urllib.request.build_opener(SafeRedirect()).open(urllib.request.Request(validate_url(url), headers={'User-Agent':'AILabTycoonAssetPrep/1.0 (Powered by Poly Haven)'}),timeout=120)
def json_get(url):
 with request(url) as r: return json.load(r)
def fetch(asset):
 folder=ROOT/asset; folder.mkdir(parents=True,exist_ok=True)
 metadata_path=folder/'files.json'
 metadata=json.loads(metadata_path.read_text()) if metadata_path.exists() else json_get(f'https://api.polyhaven.com/files/{asset}')
 metadata_path.write_text(json.dumps(metadata,indent=2))
 kind,resolution=SELECTION[asset]
 files=[]
 if kind=='material':
  for channel in ['Diffuse','nor_gl','Rough']:
   key='col_1' if channel=='Diffuse' and 'Diffuse' not in metadata and 'col_1' in metadata else channel
   item=metadata[key][resolution]['jpg']; files.append((pathlib.Path(item['url']).name,item))
 elif kind=='hdri':
  item=metadata['hdri'][resolution]['hdr']; files.append((pathlib.Path(item['url']).name,item))
 else:
  item=metadata['blend'][resolution]['blend']; files.append((pathlib.Path(item['url']).name,item))
  files.extend(item.get('include',{}).items())
 # Validate the complete manifest before downloading or writing any asset.
 for relative,item in files:
  safe_destination(folder, relative)
  validate_url(item['url'])
 manifest=[]
 for relative,item in files:
  path=safe_destination(folder, relative); path.parent.mkdir(parents=True,exist_ok=True)
  if not path.exists() or hashlib.md5(path.read_bytes()).hexdigest()!=item['md5']:
   temporary=safe_destination(folder, str(path.relative_to(folder.resolve()))+'.part')
   with request(item['url']) as source,open(temporary,'wb') as target:
    while block:=source.read(1024*1024): target.write(block)
   if hashlib.md5(temporary.read_bytes()).hexdigest()!=item['md5']:
    temporary.unlink()
    raise ValueError(f'Checksum mismatch: {path}')
   temporary.replace(path)
  manifest.append({'file':str(path.relative_to(ROOT)), 'url':item['url'],'md5':item['md5'],'bytes':path.stat().st_size})
 info=json_get(f'https://api.polyhaven.com/info/{asset}')
 print(f'{asset}: {len(files)} files verified, {sum(f["bytes"] for f in manifest)/1048576:.1f} MB',flush=True)
 return {'id':asset,'source':f'https://polyhaven.com/a/{asset}','license':'CC0-1.0','authors':info.get('authors',{}),'resolution':resolution,'files':manifest}
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: manifest=list(pool.map(fetch,SELECTION))
 (ROOT.parent/'asset-manifest.json').write_text(json.dumps({'credit':'Powered by Poly Haven','assets':manifest},indent=2)+'\n')
