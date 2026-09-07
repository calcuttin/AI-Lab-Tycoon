"""Export the existing CC0 shrub scan as a shared, compact office landscape asset."""
import bpy,pathlib,json
ROOT=pathlib.Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/garage-proof/garage-proof.blend'))
source=next(o for o in bpy.context.scene.objects if o.name.startswith('shrub_01 placement'))
bpy.ops.object.select_all(action='DESELECT')
source.location=(0,0,0);source.rotation_euler=(0,0,0);source.scale=(1,1,1)
source.select_set(True)
for child in source.children_recursive:child.select_set(True)
for image in bpy.data.images:
 if image.filepath:image.filepath=bpy.path.abspath(image.filepath)
 if image.size[0]>512 or image.size[1]>512:
  ratio=512/max(image.size);image.scale(round(image.size[0]*ratio),round(image.size[1]*ratio));image.pack()
source.name='GardenShrub'
out=ROOT/'public/models/office-garden.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
(ROOT/'art/game-assets/garden-manifest.json').write_text(json.dumps({'file':'public/models/office-garden.glb','source':'https://polyhaven.com/a/shrub_01','license':'CC0-1.0','textureLimit':512,'bytes':out.stat().st_size},indent=2)+'\n')
print('GARDEN EXPORTED',out.stat().st_size,flush=True)
