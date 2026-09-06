"""Original beveled game props; compact glTF meshes shared across office instances."""
import bpy, math, pathlib, ast, json
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'public/models';OUT.mkdir(exist_ok=True)
ART=ROOT/'art/game-assets';ART.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
source=ast.parse((ROOT/'scripts/film/render_garage.py').read_text())
exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name in {'rgb','mat','uv_world','cube','cyl','beam'}],type_ignores=[]),'primitives','exec'))
oak=mat('Honey oak','#b9a17f',.6);steel=mat('Brushed alloy','#929e9b',.3,.8);black=mat('Soft graphite','#2a3338',.5,.25);cloth=mat('Woven sage upholstery','#697e71',.92);rubber=mat('Rubber','#202928',.98);ivory=mat('Ivory enamel','#e4dcc6',.4)
light=mat('Warm diffuser','#fff0c7',.5);p=light.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=rgb('#ffda91');p.inputs['Emission Strength'].default_value=1.8
roots=[]
def finish(name,before):
 objects=list(set(scene.objects)-before)
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.object.convert(target='MESH');bpy.ops.object.join()
 o=bpy.context.object;o.name=name
 scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
 roots.append(o);return o
before=set(scene.objects)
for x in [-.72,.72]:
 for y in [-.31,.31]:cube('Desk leg',(x,y,.4),(.048,.048,.8),steel,.008)
 cube('Desk foot',(x,0,.035),(.065,.77,.05),black,.014)
cube('Oak desktop',(0,0,.82),(1.65,.84,.075),oak,.025)
cube('Cable tray',(0,.28,.67),(1.21,.16,.1),black,.012)
for x in [-.66,.66]:cube('End support',(x,0,.75),(.05,.7,.05),steel,.008)
cube('Desk drawer',(-.5,0,.65),(.34,.57,.21),oak,.013)
cube('Recessed pull',(-.5,-.295,.67),(.16,.023,.024),black,.006)
finish('DeskShell',before)
before=set(scene.objects)
cyl('Gas lift',(0,0,.29),.039,.43,steel)
for i in range(5):
 a=i*math.tau/5
 beam('Chair spoke',(0,0,.15),(.3*math.cos(a),.3*math.sin(a),.075),.04,black)
 cyl('Twin castor',(.3*math.cos(a),.3*math.sin(a),.055),.054,.065,rubber,(math.pi/2,0,a),16)
cube('Contoured seat',(0,0,.53),(.54,.5,.13),cloth,.065)
back=cube('Lumbar shell',(0,-.27,.88),(.53,.12,.56),black,.06);back.rotation_euler.x=-.1
cushion=cube('Back cushion',(0,-.195,.89),(.46,.075,.46),cloth,.037);cushion.rotation_euler.x=-.1
for side in [-1,1]:
 cube('Arm support',(side*.31,0,.69),(.037,.06,.27),steel,.008)
 cube('Soft armrest',(side*.31,0,.83),(.09,.32,.045),black,.02)
finish('ChairShell',before)
before=set(scene.objects)
cyl('Lamp base',(0,0,.022),.12,.04,black)
beam('Lamp lower arm',(0,0,.04),(0,.12,.32),.023,steel)
beam('Lamp upper arm',(0,.12,.32),(0,-.02,.53),.023,steel)
cyl('Lamp swivel',(0,.12,.32),.034,.045,black,(0,math.pi/2,0))
cube('Lamp hood',(0,-.055,.54),(.18,.24,.045),black,.016)
cube('Lamp diffuser',(0,-.055,.511),(.15,.2,.01),light,.01)
finish('DeskLamp',before)
before=set(scene.objects)
cyl('Fan base',(0,0,.05),.29,.09,black)
cyl('Fan column',(0,0,.42),.036,.72,steel)
# Front is -Y in Blender, +Z after glTF conversion.
cyl('Motor',(0,.09,.91),.10,.22,black,(math.pi/2,0,0))
for radius in [.12,.2,.29,.34]:
 bpy.ops.mesh.primitive_torus_add(major_segments=40,minor_segments=5,major_radius=radius,minor_radius=.006,location=(0,-.045,.91),rotation=(math.pi/2,0,0));bpy.context.object.data.materials.append(steel)
for i in range(12):
 a=i*math.tau/12
 beam('Fan guard spoke',(0,-.055,.91),(.34*math.cos(a),-.055,.91+.34*math.sin(a)),.007,steel)
finish('FloorFan',before)
before=set(scene.objects)
for i in range(3):
 a=i*math.tau/3
 blade=cube('Fan blade',(.145*math.cos(a),0,.91+.145*math.sin(a)),(.24,.018,.085),ivory,.032);blade.rotation_euler.y=-a
cyl('Fan hub',(0,-.03,.91),.055,.055,black,(math.pi/2,0,0))
rotor=finish('FanRotor',before)
scene.cursor.location=(0,0,.91);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
# All shells export in meters with Y up. One shared binary is under 1 MB.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(OUT/'office-props.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'office-props.blend'))
(ART/'manifest.json').write_text(json.dumps({'source':'Original project models','units':'meters','up':'Y in glTF','file':'public/models/office-props.glb','objects':[o.name for o in roots],'bytes':(OUT/'office-props.glb').stat().st_size},indent=2)+'\n')
print('GAME PROPS EXPORTED', (OUT/'office-props.glb').stat().st_size,flush=True)
