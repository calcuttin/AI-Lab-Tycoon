"""Prepare small, shared web maps from the MD5-verified material sources."""
import bpy,pathlib,json,sys
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'public/textures/office';OUT.mkdir(parents=True,exist_ok=True)
selected=set(sys.argv[sys.argv.index('--')+1:]) if '--' in sys.argv else set()
credits=json.loads((OUT/'credits.json').read_text()) if selected and (OUT/'credits.json').exists() else []
for asset,source,resolution,kinds in [
 ('garage_floor','garage-proof',1024,['diff','nor_gl','rough']),
 ('painted_plaster_wall','garage-proof',1024,['diff','nor_gl','rough']),
 ('wood_table_worn','material-study',512,['diff','nor_gl','rough']),
 ('wood_floor','material-study',512,['diff','nor_gl','rough']),
 ('fabric_pattern_07','material-study',512,['nor_gl','rough']),
 ('brown_leather','material-study',512,['diff','nor_gl','rough']),
]:
 if selected and asset not in selected:continue
 for kind in kinds:
  pattern='albedo' if asset=='brown_leather' and kind=='diff' else kind
  path=next((ROOT/'art'/source/'assets'/asset).glob('*'+pattern+'*jpg'))
  image=bpy.data.images.load(str(path),check_existing=False)
  if kind!='diff':image.colorspace_settings.name='Non-Color'
  limit=1024 if kind=='diff' else resolution
  ratio=limit/max(image.size);image.scale(round(image.size[0]*ratio),round(image.size[1]*ratio))
  target=OUT/f'{asset}-{kind}.jpg';image.filepath_raw=str(target);image.file_format='JPEG';image.save();bpy.data.images.remove(image)
  credits=[c for c in credits if c['file']!=str(target.relative_to(ROOT))]
  credits.append({'file':str(target.relative_to(ROOT)),'source':f'https://polyhaven.com/a/{asset}','license':'CC0-1.0','bytes':target.stat().st_size})
(OUT/'credits.json').write_text(json.dumps(credits,indent=2)+'\n')
print('WEB MATERIALS EXPORTED',sum(c['bytes'] for c in credits),flush=True)
