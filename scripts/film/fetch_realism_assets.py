"""Fetch credited physical surface scans for the second material pass."""
import concurrent.futures,json,pathlib
import fetch_assets as source
ROOT=pathlib.Path(__file__).resolve().parents[2]
source.ROOT=ROOT/'art/material-study/assets'
source.SELECTION={name:('material','2k') for name in ['wood_table_worn','wood_floor','fabric_pattern_07','brown_leather','asphalt_02','gravel_ground_01']}
source.ROOT.mkdir(parents=True,exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: assets=list(pool.map(source.fetch,source.SELECTION))
(source.ROOT.parent/'asset-manifest.json').write_text(json.dumps({'credit':'Powered by Poly Haven','assets':assets},indent=2)+'\n')
print("Verified", len(assets), "material scans. Run export_material_maps.py in Blender for web derivatives.", flush=True)
