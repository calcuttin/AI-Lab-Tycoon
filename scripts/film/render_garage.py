"""Build an original garage set and render a six-second Cycles proof shot.
Usage: Blender --background --factory-startup --disable-autoexec --python scripts/film/render_garage.py -- --still
Reproducible source; downloaded CC0 scans are cataloged in asset-manifest.json.
"""
import bpy, math, random, pathlib, sys, argparse
from mathutils import Vector
random.seed(37)
ROOT = pathlib.Path(__file__).resolve().parents[2]
ART = ROOT/'art/garage-proof'; ASSETS = ART/'assets'; OUT = ROOT/'public/intro/realism'
OUT.mkdir(parents=True,exist_ok=True); (ART/'frames').mkdir(exist_ok=True)
args=argparse.ArgumentParser(); args.add_argument('--still',action='store_true'); args.add_argument('--draft',action='store_true'); args.add_argument('--start',type=int,default=1); args.add_argument('--end',type=int,default=144)
args=args.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=32 if args.draft else 64
scene.cycles.use_denoising=True; scene.cycles.adaptive_threshold=0.04
scene.cycles.max_bounces=8; scene.cycles.diffuse_bounces=3; scene.cycles.glossy_bounces=4; scene.cycles.transparent_max_bounces=8
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
 prefs.compute_device_type='METAL'; prefs.get_devices()
 for d in prefs.devices: d.use=d.type=='METAL'
 scene.cycles.device='GPU'
 print('RENDER DEVICE',[(d.name,d.use) for d in prefs.devices],flush=True)
except Exception as error: print('Using CPU:',error,flush=True)
scene.render.resolution_x=1280 if args.draft else 1920; scene.render.resolution_y=720 if args.draft else 1080; scene.render.resolution_percentage=100
scene.render.fps=24; scene.frame_start=1; scene.frame_end=144
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGB'; scene.render.film_transparent=False
scene.render.use_persistent_data=True
scene.view_settings.view_transform='AgX'; scene.view_settings.look='AgX - Medium High Contrast'; scene.view_settings.exposure=0.3

def rgb(hex):
 hex=hex.lstrip('#'); c=[int(hex[i:i+2],16)/255 for i in (0,2,4)]
 return tuple(v/12.92 if v<0.04045 else ((v+0.055)/1.055)**2.4 for v in c)+(1,)
def mat(name,color,rough=.6,metal=0):
 m=bpy.data.materials.new(name); m.use_nodes=True; p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=rgb(color); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
 return m
def pbr(asset,name,scale=1,tint=None):
 m=mat(name,'#ffffff'); n=m.node_tree.nodes; l=m.node_tree.links; p=n.get('Principled BSDF')
 tex=n.new('ShaderNodeTexCoord'); mapping=n.new('ShaderNodeVectorMath'); mapping.operation='SCALE'; mapping.inputs[3].default_value=scale; l.new(tex.outputs['UV'],mapping.inputs[0])
 for pattern,target in [('*diff*jpg','Base Color'),('*rough*jpg','Roughness'),('*nor_gl*jpg','Normal')]:
  path=next((ASSETS/asset).glob(pattern)); image=n.new('ShaderNodeTexImage'); image.image=bpy.data.images.load(str(path)); l.new(mapping.outputs[0],image.inputs['Vector'])
  if target!='Base Color': image.image.colorspace_settings.name='Non-Color'
  if target=='Normal':
   normal=n.new('ShaderNodeNormalMap'); normal.inputs['Strength'].default_value=.65; l.new(image.outputs['Color'],normal.inputs['Color']); l.new(normal.outputs[0],p.inputs['Normal'])
  elif target=='Base Color' and tint:
   mix=n.new('ShaderNodeMixRGB'); mix.blend_type='MULTIPLY'; mix.inputs[0].default_value=.38; mix.inputs[2].default_value=rgb(tint); l.new(image.outputs['Color'],mix.inputs[1]); l.new(mix.outputs[0],p.inputs[target])
  else: l.new(image.outputs['Color'],p.inputs[target])
 return m
stucco=pbr('painted_plaster_wall','Scanned warm painted plaster',.65,'#e5d5b4')
concrete=pbr('garage_floor','Scanned worn concrete',.38)
roofmat=pbr('grey_roof_01','Scanned asphalt shingles',.7)
trim=mat('Faded ivory enamel','#e6ddc7',.53); wood=mat('Weathered cedar','#89765e',.88); dark=mat('Powder-coated graphite','#343b37',.4,.2); metal=mat('Galvanized metal','#aab3b0',.3,.7)
glass=mat('Window glazing','#a2b6b4',.13,.05); glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=.84
amber=mat('Warm light diffuser','#fff0c8',.25); amber.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=rgb('#ffda91'); amber.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=3
brown=mat('Cardboard','#ac8a5e',.85); ink=mat('Dark printed ink','#213c33',.63); paper=mat('Paper and whiteboard','#efeee2',.7)

# UV coordinates in meters, so material grain stays physically consistent.
def uv_world(obj):
 mesh=obj.data
 if not isinstance(mesh,bpy.types.Mesh): return
 uv=mesh.uv_layers.active or mesh.uv_layers.new()
 for poly in mesh.polygons:
  normal=poly.normal; axis=max(range(3),key=lambda i:abs(normal[i])); axes=[i for i in range(3) if i!=axis]
  for loop in poly.loop_indices:
   co=mesh.vertices[mesh.loops[loop].vertex_index].co
   uv.data[loop].uv=(co[axes[0]],co[axes[1]])
def cube(name,loc,size,material,bevel=.015):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); obj=bpy.context.object; obj.name=name; obj.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); uv_world(obj)
 if material: obj.data.materials.append(material)
 if bevel:
  mod=obj.modifiers.new('Soft real-world edges','BEVEL'); mod.width=bevel; mod.segments=3
  mod=obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return obj
def cyl(name,loc,radius,depth,material,rotation=None,vertices=24):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc); obj=bpy.context.object; obj.name=name
 if material: obj.data.materials.append(material)
 if rotation: obj.rotation_euler=rotation
 mod=obj.modifiers.new('Edge highlights','BEVEL'); mod.width=.007; mod.segments=2
 for p in obj.data.polygons:p.use_smooth=True
 return obj
def beam(name,a,b,width,material):
 a,b=Vector(a),Vector(b); obj=cube(name,(a+b)/2,(width,width,(b-a).length),material,width*.15); obj.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return obj
def text(name,body,loc,size,material,rotation=(math.pi/2,0,0),align='LEFT'):
 curve=bpy.data.curves.new(name,'FONT'); curve.body=body; curve.size=size; curve.align_x=align; curve.extrude=.001; curve.bevel_depth=.0005
 obj=bpy.data.objects.new(name,curve); scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=rotation;obj.data.materials.append(material);return obj
def area(name,loc,power,color,size,target):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
 obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler();return obj

# Real captured environment, supplemented by controlled late-afternoon sun.
world=bpy.data.worlds.new('Golden Gate Hills — Poly Haven');world.use_nodes=True;scene.world=world
nodes=world.node_tree.nodes; links=world.node_tree.links; env=nodes.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(next((ASSETS/'golden_gate_hills').glob('*.hdr'))))
tex=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Rotation'].default_value[2]=1.6;links.new(tex.outputs['Generated'],mapping.inputs['Vector']);links.new(mapping.outputs[0],env.inputs[0]);links.new(env.outputs[0],nodes.get('Background').inputs['Color']);nodes.get('Background').inputs['Strength'].default_value=.45
sun_data=bpy.data.lights.new('California afternoon','SUN');sun_data.energy=2.6;sun_data.angle=.09;sun_data.color=(1,.82,.62)
sun=bpy.data.objects.new('California afternoon',sun_data);scene.collection.objects.link(sun);sun.rotation_euler=(math.radians(38),math.radians(-23),math.radians(-38))
area('Soft sky bounce',(1,-6,7),450,(.76,.86,1),8,(0,0,0))

# Ground, slightly uneven gravel and a scored concrete driveway.
lawn=mat('Dry California lawn','#7d825b',.95)
noise=lawn.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=5;noise.inputs['Detail'].default_value=4
ramp=lawn.node_tree.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=rgb('#535e38');ramp.color_ramp.elements[1].color=rgb('#a49b6d');lawn.node_tree.links.new(noise.outputs['Fac'],ramp.inputs[0]);lawn.node_tree.links.new(ramp.outputs[0],lawn.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
cube('Neighborhood ground',(0,2,-.11),(70,65,.2),lawn,.02)
cube('Driveway',(0,-7,.015),(6.9,9,.1),concrete,.025)
for y in [-10,-7,-4]: cube('Expansion joint',(0,y,.071),(6.8,.018,.004),dark,0)
cube('Center concrete expansion joint',(0,-7,.072),(.018,8.9,.004),dark,0)
cube('Public sidewalk',(0,-12,.025),(60,1.5,.12),concrete,.02)
asphalt=mat('Asphalt','#4b4f4d',.95);cube('Residential street',(0,-17,-.01),(75,8,.15),asphalt,.01)
for x in range(-30,31,3):cube('Sidewalk joint',(x,-12,.087),(.013,1.45,.003),dark,0)
cube('Curb',(0,-12.84,.13),(65,.19,.27),trim,.045)

# Garage: a real opening, no fourth wall, separate fascia and roof shell.
cube('Garage slab',(0,0,.14),(6.7,6.5,.24),concrete,.025)
cube('Left stucco wall',(-3.2,0,1.65),(.22,6.2,3.0),stucco,.03)
cube('Right stucco wall',(3.2,0,1.65),(.22,6.2,3.0),stucco,.03)
cube('Rear stucco wall',(0,3.02,1.65),(6.5,.22,3.0),stucco,.03)
cube('Front header',(0,-3.02,2.97),(6.6,.26,.45),stucco,.02)
for x in [-3.04,3.04]:cube('Garage opening trim',(x,-3.18,1.55),(.16,.13,2.82),trim,.008)
cube('Header trim',(0,-3.19,2.91),(6.22,.13,.18),trim,.008)
# Gables and roof have separate geometry and materials; the interior remains hollow.
verts=[(-3.5,-3.45,3.15),(3.5,-3.45,3.15),(0,-3.45,4.7),(-3.5,3.5,3.15),(3.5,3.5,3.15),(0,3.5,4.7)]
mesh=bpy.data.meshes.new('Gables');mesh.from_pydata(verts,[],[(0,1,2),(5,4,3)]);mesh.update();obj=bpy.data.objects.new('Plastered gable ends',mesh);scene.collection.objects.link(obj);obj.data.materials.append(stucco);uv_world(obj)
for side in [-1,1]:
 a=(0,0,4.74);b=(side*3.66,0,3.12);length=math.hypot(3.66,1.62)
 roof=cube('Roof with scanned shingles',(side*1.83,0,3.93),(length,7.15,.14),roofmat,.025);roof.rotation_euler[1]=side*math.atan2(1.62,3.66)
 beam('Rake fascia',(0,-3.6,4.7),(side*3.65,-3.6,3.08),.16,trim)
 cube('Eaves fascia',(side*3.65,0,3.07),(.14,7.25,.21),trim,.015)
 gutter=cyl('Rain gutter',(side*3.69,0,3.02),.07,7.2,metal,(math.pi/2,0,0));
 cyl('Downpipe',(side*3.67,3.1,1.55),.046,2.93,metal)
for y in [-3.3,3.3]:beam('Roof ridge trim',(0,y,4.79),(0,y+.3,4.79),.12,wood)
# Partly rolled overhead door, its rails and ceiling opener are visible inside.
for i in range(6):cube('Raised sectional door',(0,-1.7+i*.4,2.79),(5.9,.39,.055),trim,.01)
for x in [-2.94,2.94]:cube('Garage door track',(x,-.6,2.72),(.04,4.6,.04),metal,.005)
cube('Garage opener',(0,1,2.54),(.33,.6,.25),dark,.035)
cube('Opener rail',(0,-.75,2.61),(.055,3.2,.055),metal,.005)
area('Interior fluorescent',(0,.5,2.65),110,(1,.86,.65),3,(0,.5,0))
for x in [-1.8,1.8]:cube('Ceiling tube fixture',(x,1,2.67),(.1,1.3,.06),amber,.01)

# Attached ranch house, slightly set back to keep the garage focal.
cube('House body',(6.2,1.0,1.7),(5.9,7.2,3.25),stucco,.035)
hroof=cube('House roof',(6.2,1.0,3.72),(6.5,8,.18),roofmat,.025);hroof.rotation_euler[1]=-.13
infill_vertices=[(3.25,-2.6,3.3),(9.15,-2.6,3.3),(9.15,-2.6,4.1),(3.25,-2.6,3.33),(3.25,4.6,3.3),(9.15,4.6,3.3),(9.15,4.6,4.1),(3.25,4.6,3.33)]
infill_mesh=bpy.data.meshes.new('House sloping infill');infill_mesh.from_pydata(infill_vertices,[],[(0,1,2,3),(7,6,5,4),(1,5,6,2),(3,2,6,7)]);infill_mesh.update()
infill=bpy.data.objects.new('House sloping infill',infill_mesh);scene.collection.objects.link(infill);infill_mesh.materials.append(stucco);uv_world(infill)
beam('House front fascia',(2.88,-3.05,3.25),(9.52,-3.05,4.12),.16,trim)
# Recessed window with glazing, wood muntins, insect screen and interior curtains.
cube('Window recess',(6,-2.63,1.85),(2.5,.1,1.52),dark,.018)
cube('Window glass',(6,-2.69,1.85),(2.3,.03,1.34),glass,.002)
for x in [4.78,6,7.22]:cube('Window vertical frame',(x,-2.74,1.85),(.066,.09,1.5),trim,.008)
for z in [1.11,2.59]:cube('Window sill',(6,-2.75,z),(2.58,.2,.07),trim,.006)
curtain=mat('Linen curtain','#d1c6ad',.93)
for i in range(16):cube('Curtain pleat',(4.91+i*.145,-2.55,1.88),(.15,.02,1.29),curtain,.003).rotation_euler[2]=(-1 if i%2 else 1)*.15
cyl('Chimney flue',(8,2,4.25),.15,1.3,metal);cube('Chimney cap',(8,2,4.94),(.45,.45,.05),metal,.01)
# Modest signage is physically placed on the set, not composited into the movie.
cube('Founder company sign',(0,-3.48,3.76),(2.28,.08,.65),ink,.014)
text('Company name','AI LAB',(0,-3.528,3.76),.28,paper,align='CENTER')
text('Company strapline','BIG IDEAS. SMALL RUNWAY.',(0,-3.531,3.54),.064,paper,align='CENTER')
for x in [-1.05,1.05]:cyl('Sign screw',(x,-3.537,4),.012,.01,metal,(math.pi/2,0,0))
text('House number','404',(3.47,-3.1,2.2),.16,dark)
for x in [-3.42,3.43]:
 cube('Porch sconce back',(x,-3.12,2.45),(.16,.07,.28),dark,.018)
 cube('Porch sconce glass',(x,-3.24,2.45),(.12,.2,.2),amber,.015)
 cube('Porch sconce cap',(x,-3.24,2.59),(.23,.24,.05),dark,.01)

# Import real modeled furniture and foliage with their authored PBR materials.
loaded={}
def load_asset(asset,object_names=None):
 if asset in loaded:return loaded[asset]
 path=next((ASSETS/asset).glob('*.blend'))
 before=set(bpy.data.images)
 with bpy.data.libraries.load(str(path),link=False) as (src,dst): dst.objects=[name for name in src.objects if object_names is None or name in object_names]
 objects=[o for o in dst.objects if o and o.type in {'MESH','EMPTY'}]
 for image in set(bpy.data.images)-before:
  if image.filepath:
   candidate=ASSETS/asset/'textures'/pathlib.Path(image.filepath).name
   if candidate.exists():image.filepath=str(candidate);image.reload()
 loaded[asset]=objects
 return objects
def place_asset(asset,loc,scale=1,rotation=0,object_names=None):
 sources=load_asset(asset,object_names)
 parent=bpy.data.objects.new(asset+' placement',None);scene.collection.objects.link(parent)
 for source in sources:
  obj=source.copy();obj.data=source.data;scene.collection.objects.link(obj);obj.parent=parent;obj.hide_render=False;obj.hide_viewport=False
  if obj.instance_collection:
   for member in obj.instance_collection.all_objects:member.hide_render=False;member.hide_viewport=False
 parent.location=loc;parent.scale=(scale,scale,scale);parent.rotation_euler[2]=rotation
 return parent
# Complete desk drawers retain their real dimensions and worn painted surfaces.
for x in [-1.72,1.25]:
 place_asset('metal_office_desk',(x,1.75,.26),1,math.pi)
 place_asset('plastic_monobloc_chair_01',(x,.7,.26),1,math.pi+.12)
# Monitors, keyboards, cables, sticky notes, coffee and mismatched equipment.
screen=mat('Screen black','#142329',.3)
screen.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=rgb('#244c55');screen.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=.6
cyan=mat('Code on screen','#8dd0b7',.5);cyan.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=rgb('#78bfa9');cyan.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=1
note=mat('Sticky note paper','#d9ce73',.8)
for x in [-1.72,1.25]:
 cube('Monitor base',(x,1.4,1.03),(.29,.2,.025),dark,.012)
 cube('Monitor stand',(x,1.45,1.22),(.045,.05,.36),metal,.006)
 cube('Monitor enclosure',(x,1.45,1.44),(.77,.055,.45),dark,.016)
 cube('LCD glass',(x,1.414,1.44),(.71,.004,.39),screen,.001)
 for i in range(12):
  length=random.uniform(.13,.44)
  cube('Code line',(x-.27+length/2+(i%3)*.025,1.409,1.59-i*.025),(length,.002,.005),cyan,0)
 cube('Keyboard',(x,1.03,1.031),(.45,.15,.025),dark,.007)
 for row in range(4):
  for col in range(14):cube('Keyboard key',(x-.201+col*.03,.98+row*.029,1.049),(.024,.024,.007),trim,.002)
 cube('Mouse mat',(x+.42,1.03,1.023),(.23,.22,.004),dark,.008)
 mouse=cube('Mouse',(x+.42,1.03,1.045),(.06,.09,.032),trim,.02)
 cube('Post-it',(x+.31,1.405,1.3),(.07,.002,.07),note,.001)
 cyl('Coffee mug',(x-.5,1.08,1.097),.04,.11,paper)
 cyl('Coffee surface',(x-.5,1.08,1.154),.033,.002,brown)
 bpy.ops.mesh.primitive_torus_add(major_radius=.027,minor_radius=.008,location=(x-.55,1.08,1.103),rotation=(math.pi/2,0,0));bpy.context.object.data.materials.append(paper)
 cube('Desktop tower',(x+.55,1.58,.57),(.22,.44,.58),dark,.018)
 for j in range(8):cube('Case ventilation',(x+.55,1.35,.42+j*.027),(.15,.004,.008),metal,.002)
 # A sagging power cord is visible below each desk.
 curve=bpy.data.curves.new('Power cable','CURVE');curve.dimensions='3D';curve.bevel_depth=.006;curve.bevel_resolution=3
 spline=curve.splines.new('BEZIER');spline.bezier_points.add(3)
 for p,co in zip(spline.bezier_points,[(x,1.52,1),(x+.15,1.73,.37),(x+.45,2,.28),(x+.6,2.88,.42)]):p.co=co;p.handle_left_type=p.handle_right_type='AUTO'
 cable=bpy.data.objects.new('Power cable',curve);scene.collection.objects.link(cable);curve.materials.append(dark)
# Whiteboard and satirical handwritten planning, completely original.
cube('Whiteboard backing',(0,2.875,1.95),(2.8,.06,1.15),metal,.015)
cube('Whiteboard surface',(0,2.836,1.95),(2.7,.01,1.06),paper,.006)
text('Whiteboard headline','MIDDLE OUT.',(-1.14,2.827,2.18),.21,ink)
text('Whiteboard plan','01  BUILD SOMETHING\n02  PIVOT\n03  EXPLAIN THE VALUATION',(-1.12,2.826,1.97),.088,ink)
cube('Whiteboard marker shelf',(0,2.79,1.4),(2.78,.14,.035),metal,.005)
# Shelving, battered moving boxes, a floor fan, and a coffee station.
for x in [-2.88,-2.2]:
 for y in [.1,1.1]:cube('Shelf upright',(x,y,1.24),(.035,.035,1.9),metal,.004)
for z in [.37,.89,1.41,1.93]:
 cube('Shelf board',(-2.54,.6,z),(.75,1.08,.028),wood,.005)
 for j in range(2):
  box=cube('Archive carton',(-2.53,.32+j*.5,z+.2),(.55,.42,.37),brown,.008)
  cube('Box label',(-2.242,.32+j*.5,z+.2),(.005,.18,.08),paper,.001)
for i in range(3):
 box=cube('Moving box',(2.4+i*.08,-1.4+i*.14,.48+i*.3),(.61,.53,.44),brown,.012);box.rotation_euler[2]=random.uniform(-.15,.15)
 cube('Packing tape',(2.4+i*.08,-1.4+i*.14,.707+i*.3),(.08,.54,.002),trim,.001)
text('Box joke','NOT A PIVOT',(2.14,-1.674,.43),.055,ink)
cube('Coffee table',(2.57,2.2,.75),(.72,.9,.065),wood,.015)
for x in [2.3,2.84]:
 for y in [1.9,2.52]:cube('Coffee table leg',(x,y,.47),(.055,.055,.55),dark,.006)
cube('Espresso machine',(2.57,2.3,.98),(.34,.36,.38),metal,.035)
cube('Espresso machine front',(2.57,2.105,.98),(.28,.012,.27),dark,.008)
cyl('Espresso dial',(2.57,2.093,1.03),.035,.008,paper,(math.pi/2,0,0))

# Service details and the suburban setting.
for x in [-4.2,-4.8]:
 binmat=mat('Municipal bin '+str(x),'#3c6458' if x==-4.2 else '#53564a',.72)
 cube('Wheelie bin',(x,-2.4,.5),(.48,.52,.9),binmat,.055);cube('Hinged bin lid',(x,-2.4,.98),(.55,.59,.07),dark,.025)
 for side in [-1,1]:cyl('Bin wheel',(x+side*.23,-2.16,.14),.095,.035,dark,(0,math.pi/2,0))
cube('Electrical service box',(-3.35,-1.8,1.63),(.17,.43,.61),metal,.015)
cyl('Electrical conduit',(-3.37,-1.81,2.48),.018,1.15,metal)
# Fence has individual boards, fasteners, and variation.
for i in range(54):
 y=-7+i*.24
 board=cube('Cedar fence picket',(-6.1,y,.92),(.105,.22,1.8+random.uniform(-.035,.035)),wood,.008)
 for z in [.45,1.35]:cyl('Fence nail',(-6.04,y,z),.005,.005,dark,(0,math.pi/2,0),12)
for z in [.45,1.35]:cube('Fence horizontal rail',(-6.17,-.6,z),(.12,13,.1),wood,.008)
# Real tree canopy geometry, instanced around the property; light filters through leaves.
for loc,scale,angle in [((-6.6,2,0),1.8,.6),((11,5,0),1.95,2),((-10,12,0),2.1,1),((4,17,0),1.9,.2),((-12,-6,0),1.6,-.5)]:
 place_asset('tree_small_02',loc,scale,angle,['tree_small_02_LOD1'])
for i,(x,y) in enumerate([(-4.4,2),(-4.6,3.5),(10,-1),(10.2,1),(10,3),(-5,-5.5)]):
 place_asset('shrub_01',(x,y,.05),2.7+(i%3)*.4,i*.8,['shrub_01_a_LOD1'])
# Small tufts catch highlights without turning the lawn into a flat color patch.
vertices=[];faces=[]
for i in range(23000):
 x=random.uniform(-14,15);y=random.uniform(-11,13)
 if (-3.5<x<3.5 and y<3.5) or (-3.6<x<9.5 and -3.7<y<5):continue
 z=0;h=random.uniform(.04,.15);w=random.uniform(.007,.018);lean=random.uniform(-.04,.04)
 start=len(vertices);vertices.extend([(x-w,y,z),(x+w,y,z),(x+lean,y+lean,z+h)]);faces.append((start,start+1,start+2))
mesh=bpy.data.meshes.new('Grass blades');mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new('Uneven lawn grass',mesh);scene.collection.objects.link(obj);obj.data.materials.append(lawn)
# Fallen leaves and driveway grit, sparse enough to be legible.
leafmat=mat('Dry fallen leaves','#897145',.95)
for i in range(85):
 x=random.uniform(-3.3,3.3);y=random.uniform(-11,-3.6)
 if random.random()<.55 and abs(x)<2.8:continue
 obj=cube('Fallen leaf',(x,y,.077),(.035+random.random()*.04,.08,.002),leafmat,0);obj.rotation_euler[2]=random.random()*6.28
# A neighbor and distant homes give the scene depth beyond the main set.
for x,y in [(-13,6),(16,10),(-14,20)]:
 cube('Neighboring bungalow',(x,y,1.45),(8,6,2.9),stucco,.035)
 r=cube('Neighbor roof',(x,y,3.17),(8.8,7,.18),roofmat,.02);r.rotation_euler[1]=.12
 for offset in [-2,2]:
  cube('Neighbor window',(x+offset,y-3.025,1.75),(1.7,.045,1.05),glass,.01)

# A slow real camera dolly, matching film photography rather than a game orbit.
bpy.ops.object.empty_add(type='PLAIN_AXES',location=(.1,0,1.8));target=bpy.context.object;target.name='Camera focus'
bpy.ops.object.camera_add(location=(8,-17,5.1));camera=bpy.context.object;scene.camera=camera;camera.name='Garage dolly camera';camera.data.lens=43;camera.data.sensor_width=36
track=camera.constraints.new(type='TRACK_TO');track.target=target;track.track_axis='TRACK_NEGATIVE_Z';track.up_axis='UP_Y'
camera.data.dof.use_dof=True;camera.data.dof.focus_object=target;camera.data.dof.aperture_fstop=7.1
for frame,loc in [(1,(8,-17,5.1)),(144,(6.2,-14.1,3.9))]:
 camera.location=loc;camera.keyframe_insert(data_path='location',frame=frame)
# Preserve the full edit; render ranges below choose frames without altering it.
scene.frame_set(72 if args.still else args.start)
for screen_layout in bpy.data.screens:
 for editor in screen_layout.areas:
  if editor.type=='VIEW_3D':
   editor.spaces.active.region_3d.view_perspective='CAMERA'
   editor.spaces.active.shading.type='SOLID'
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'garage-proof.blend'))
bpy.ops.file.make_paths_relative()
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'garage-proof.blend'))
print('SET READY',len(scene.objects),'objects',flush=True)
if args.still:
 scene.render.filepath=str(OUT/('garage-proof-draft.png' if args.draft else 'garage-proof-poster.png'));bpy.ops.render.render(write_still=True)
else:
 scene.frame_start=args.start;scene.frame_end=args.end;scene.render.filepath=str(ART/'frames/frame-');bpy.ops.render.render(animation=True)
