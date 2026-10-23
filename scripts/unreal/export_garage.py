import bpy,pathlib,json,re
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'art/unreal-garage/Source';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/realism-test/garage.blend'))
# Keep the garage building and its interior; the district and distant foliage are unnecessary here.
bpy.ops.object.select_all(action='DESELECT')
keep=[]
for o in list(bpy.context.scene.objects):
 if o.type not in {'MESH','FONT','CURVE'}:continue
 center=o.matrix_world.translation
 if abs(center.x)<3.6 and -3.6<center.y<3.3 and center.z<5.2 and max(o.dimensions)<14:
  o.select_set(True);keep.append(o)
assert keep
bpy.context.view_layer.objects.active=keep[0]
bpy.ops.object.convert(target='MESH');bpy.ops.object.join();obj=bpy.context.object;obj.name='GarageSet'
# Bake world-space geometry to avoid root/pivot ambiguity during interchange.
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
materials=[]
for m in obj.data.materials:
 if not m or not m.use_nodes:continue
 p=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
 if not p:continue
 desc={'name':m.name,'color':list(p.inputs['Base Color'].default_value),'roughness':p.inputs['Roughness'].default_value,'metallic':p.inputs['Metallic'].default_value,'emission':list(p.inputs['Emission Color'].default_value),'emissionStrength':p.inputs['Emission Strength'].default_value,'maps':{}}
 def image_upstream(socket,seen=None):
  seen=seen or set()
  for link in socket.links:
   n=link.from_node
   if n in seen:continue
   seen.add(n)
   if n.type=='TEX_IMAGE' and n.image:return n.image
   for inp in n.inputs:
    im=image_upstream(inp,seen)
    if im:return im
 for socket,label in [('Base Color','color'),('Roughness','roughness'),('Metallic','metallic'),('Normal','normal')]:
  im=image_upstream(p.inputs[socket])
  if im:
   path=pathlib.Path(bpy.path.abspath(im.filepath))
   if path.exists():desc['maps'][label]=str(path)
 materials.append(desc)
(OUT/'materials.json').write_text(json.dumps(materials,indent=2))
bpy.ops.export_scene.fbx(filepath=str(OUT/'GarageSet.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',apply_unit_scale=True,bake_anim=False,path_mode='ABSOLUTE',use_mesh_modifiers=True)
print('EXPORTED',len(obj.data.vertices),'vertices',len(materials),'materials',flush=True)
