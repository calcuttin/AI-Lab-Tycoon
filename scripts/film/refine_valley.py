"""Landscaping, camera clearance, and final render configuration for the film."""
import bpy, math, pathlib, ast, random
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[2];ART=ROOT/'art/valley-film'
bpy.ops.wm.open_mainfile(filepath=str(ART/'valley-film.blend'));scene=bpy.context.scene
source=ast.parse((ROOT/'scripts/film/render_garage.py').read_text())
exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name in {'rgb','mat','uv_world','cube','cyl','beam'}],type_ignores=[]),'primitives','exec'))
road=bpy.data.materials['District asphalt'];ivory=bpy.data.materials['Faded ivory enamel'];lawn=bpy.data.materials['Dry California lawn'];concrete=bpy.data.materials['Scanned worn concrete'];glass=bpy.data.materials['Blue architectural reflective glass'];dark=bpy.data.materials['Powder-coated graphite']
# Material variation reads at aerial scale as dry-season patches.
for node in lawn.node_tree.nodes:
 if node.type=='TEX_NOISE':node.inputs['Scale'].default_value=100
for y in [67,122]:
 cube('Corporate parking asphalt',(83,y,.01),(88,7,.15),road,.015)
 for x in range(40,125,5):cube('Parking wheel stop',(x+2,y+2,.24),(1.5,.18,.2),concrete,.02)
for x in [36,135]:
 cube('District access road',(x,92,.02),(6,65,.16),road,.01)
 cube('District sidewalk',(x-4,92,.03),(1.8,65,.16),concrete,.01)
 for y in range(62,123,7):cube('Access road dash',(x,y,.12),(.1,2.7,.006),ivory,0)
cube('Campus entry walk',(-7, 63,.06),(7,13,.2),concrete,.01)
# Background hills and low business parks prevent a bare plane at the skyline.
hillmat=mat('Distant oak foothills','#717950',.96)
for i in range(11):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=(-145+i*36,212+(i%3)*12,-1));o=bpy.context.object;o.name='Peninsula foothill';o.scale=(38,44,9+(i%4)*4);o.data.materials.append(hillmat)
 for p in o.data.polygons:p.use_smooth=True
# Window blinds and interior depth break up broad reflected-glass panels.
blinds=mat('Silver interior blinds','#a9b6ad',.7,.2)
for x in range(-45,0,3):
 for z in [1.9,4.6,7.3]:
  if (x+int(z))%4:
   cube('Campus interior blind',(x,72.43,z),(2.75,.06,.55),blinds,.005)
for y in range(80,103,3):
 for z in [1.9,4.6,7.3]:cube('West campus blind',(-49.55,y,z),(.06,2.75,.45),blinds,.005)
# New composition clears foreground towers and includes the crane silhouette.
def camera(name,a,b,t0,t1,focal):
 cam=bpy.data.objects[name+' camera'];target=bpy.data.objects[name+' focus'];cam.animation_data_clear();target.animation_data_clear();cam.data.lens=focal
 index=['THE PENINSULA','THE CAMPUS','THE NEXT BIG THING','THE NEIGHBORHOOD','YOUR HEADQUARTERS','THE FIRST COMMIT'].index(name)
 for f,p,t in [(index*144+1,a,t0),((index+1)*144,b,t1)]:
  cam.location=p;cam.keyframe_insert(data_path='location',frame=f);target.location=t;target.keyframe_insert(data_path='location',frame=f)
camera('THE CAMPUS',(-70,39,24),(-57,45,20),(-22,84,3),(-20,86,3),36)
camera('THE NEXT BIG THING',(154,24,43),(146,34,44),(91,95,17),(93,97,18),38)
camera('THE FIRST COMMIT',(-.45,-2.7,2.25),(-.75,-1.8,2.0),(-1.55,1.4,1.3),(-1.6,1.42,1.3),48)
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.eevee.taa_render_samples=16
scene.frame_set(72);scene.render.filepath=str(ART/'frames/frame-')
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'valley-film.blend'))
if '--stills' in __import__('sys').argv:
 for i in [0,1,2,5]:
  scene.frame_set(i*144+72);scene.render.filepath=str(ART/f'shot-{i+1}.png');bpy.ops.render.render(write_still=True)
