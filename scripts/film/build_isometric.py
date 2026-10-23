"""Original miniature Valley: Blender -b -t 8 --python this.py [-- --preview]."""
import bpy, math, random, pathlib, sys, json
from mathutils import Vector
random.seed(204)
ROOT=pathlib.Path(__file__).resolve().parents[2]
ART=ROOT/'art/isometric-intro'; ART.mkdir(parents=True,exist_ok=True)
FRAMES=ART/'frames'; FRAMES.mkdir(exist_ok=True)
OUT=ROOT/'public/intro/realism'; OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene
s.render.engine='BLENDER_EEVEE_NEXT'; s.eevee.taa_render_samples=16
s.render.resolution_x=1600; s.render.resolution_y=900; s.render.resolution_percentage=100
s.render.fps=24; s.frame_start=1; s.frame_end=288
s.render.image_settings.file_format='PNG'; s.render.image_settings.color_mode='RGB'
s.view_settings.view_transform='AgX'; s.view_settings.look='AgX - Medium High Contrast'; s.view_settings.exposure=-.35
s.render.use_file_extension=True
s.world=bpy.data.worlds.new('Daylight'); s.world.use_nodes=True
s.world.node_tree.nodes.get('Background').inputs[0].default_value=(.7,.82,1,1)
s.world.node_tree.nodes.get('Background').inputs[1].default_value=.4

def mat(name,c,rough=.6,metal=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*c,1); m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*c,1); bs.inputs['Roughness'].default_value=rough; bs.inputs['Metallic'].default_value=metal
 return m
cream=mat('Warm limestone',(.76,.74,.64)); white=mat('White concrete',(.88,.89,.84)); asphalt=mat('Charcoal asphalt',(.022,.027,.027)); pavement=mat('Sidewalk',(.54,.55,.50)); grass=mat('California green',(.06,.22,.025)); glass=mat('Blue green glazing',(.08,.24,.27),.2,.55); dark=mat('Graphite',(.09,.12,.14)); solar=mat('Solar blue',(.025,.07,.14),.28,.5); bark=mat('Tree bark',(.22,.14,.075)); roof=mat('Terracotta',(.37,.17,.095)); yellow=mat('Construction ochre',(.96,.51,.025)); red=mat('Startup coral',(.88,.12,.045)); blue=mat('Startup cobalt',(.06,.20,.65)); mint=mat('Startup mint',(.14,.58,.40)); purple=mat('Startup violet',(.40,.09,.68))
leaves=[mat('Canopy '+str(i),c) for i,c in enumerate([(.12,.24,.055),(.22,.35,.07),(.30,.42,.12)])]

def cube(n,loc,dim,m,bevel=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=n; o.dimensions=dim
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(m)
 if bevel:
  mod=o.modifiers.new('Soft edges','BEVEL');mod.width=bevel;mod.segments=2
  o.modifiers.new('Weighted corners','WEIGHTED_NORMAL')
 return o

def cyl(n,loc,r,depth,m):
 bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=r,depth=depth,location=loc);o=bpy.context.object;o.name=n;o.data.materials.append(m);return o

def label(n,body,loc,size,m):
 curve=bpy.data.curves.new(n,'FONT');curve.body=body;curve.size=size;curve.align_x='CENTER';curve.extrude=.07;curve.bevel_depth=.012
 o=bpy.data.objects.new(n,curve);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(math.pi/2,0,0);curve.materials.append(m);return o

def parent_group(before,n,origin):
 group=bpy.data.objects.new(n,None);s.collection.objects.link(group);group.location=origin
 for o in set(s.objects)-before-{group}:
  if o.parent:continue
  location=o.location.copy();o.parent=group;o.location=location-Vector(origin)
 return group

def tree(x,y):
 cyl('Tree trunk',(x,y,1),.16,2,bark)
 for dx,dy,z,r in [(0,0,2.7,1.15),(.5,0,3.4,.9),(-.45,.3,2.8,.95)]:
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=r,location=(x+dx,y+dy,z));o=bpy.context.object;o.name='Tree canopy';o.scale.z=1.2;o.data.materials.append(random.choice(leaves))

cube('Continuous green terrain',(0,0,-.3),(220,200,.5),grass)
for x in range(-60,65,24):
 cube('North south street',(x,0,.02),(5.8,160,.13),asphalt)
 for edge in [-3.15,3.15]:cube('Street curb',(x+edge,0,.08),(.55,160,.24),pavement)
 for y in range(-77,80,5):cube('Center dash',(x,y,.10),(.09,2.2,.008),white)
for y in range(-48,55,24):
 cube('East west street',(0,y,.03),(170,5.8,.13),asphalt)
 for edge in [-3.15,3.15]:cube('Street curb',(0,y+edge,.08),(170,.55,.24),pavement)
 for x in range(-82,85,5):cube('Center dash',(x,y,.11),(2.2,.09,.008),white)
for x in range(-60,65,24):
 for y in range(-48,55,24):
  for step in range(-2,3):
   cube('Crosswalk',(x+step*.7,y+3.8,.22),(.38,1.4,.025),white)
   cube('Crosswalk',(x+3.8,y+step*.7,.22),(1.4,.38,.025),white)

brands=['HOLLOW','NEXUS','PRE-REVENUE','CORTEX','UNREASONABLE','STEALTH','PIVOT','ETHOS','EXIT STRATEGY','SERIES B','OMNI','COLLECTIVE']
brandcolors=[blue,red,purple,mint]
for index,(x,y) in enumerate(( (x,y) for y in [-36,-12,12,36] for x in [-48,-24,0,24,48] )):
 cube('Block sidewalk',(x,y,.13),(17.6,17.6,.3),pavement)
 if (x,y)==(-24,-36):
  # Humble founder block stays small as the surrounding city inflates.
  cube('Founder house',(x,y+2,1.8),(7.3,6.3,3.4),cream,.07)
  for side in [-1,1]:
   o=cube('House gable',(x+side*1.9,y+2,4),(4.2,7.1,.18),roof,.02);o.rotation_euler.y=side*.34
  cube('Garage',(x+5.4,y-3,1.3),(4.5,5,2.5),white,.05)
  cube('Garage roof',(x+5.4,y-3,2.7),(4.8,5.3,.23),dark,.03)
  cube('Garage opening',(x+5.4,y-5.52,1.18),(3.4,.07,2),dark)
  cube('Borrowed desk',(x+5.4,y-4.6,.8),(2.6,1,.14),cream)
  cube('Monitor',(x+5.4,y-4.6,1.3),(.9,.13,.6),blue)
  label('Founder sign','AI LAB',(x+5.4,y-5.61,2.17),.6,mint)
  for dx in [-1.9,1.9]:cube('House windows',(x+dx,y-1.18,2),(1.3,.08,1.35),glass)
  label('Founder lawn sign','BIG IDEAS.',(x-2,y-5,1),.6,dark)
  tree(x-5.5,y+5.2)
  continue
 before=set(s.objects)
 height=random.choice([5.5,7,8,10,13,16])
 w=random.choice([12,13,14]);d=random.choice([11,12,13])
 if index%5==0:
  # U-shaped campus provides a recognizably different silhouette.
  for dx,dy,ww,dd in [(-5,0,4,13),(5,0,4,13),(0,5,8,3)]:
   cube('Campus glass',(x+dx,y+dy,height/2),(ww,dd,height),glass,.05)
   for z in [1,height*.5,height]:cube('Campus ribbons',(x+dx,y+dy,z),(ww+.2,dd+.2,.36),white)
  cube('Courtyard garden',(x,y-1,.4),(5.5,8,.35),grass)
 else:
  cube('Curtain wall building',(x,y,height/2+.4),(w,d,height),glass,.06)
  for z in range(1,int(height)+1,2):cube('Floor ribbon',(x,y,z+.3),(w+.15,d+.15,.35),cream if index%2 else white)
  for dx in range(-int(w/2)+1,int(w/2),2):
   cube('Facade mullion',(x+dx,y-d/2-.03,height/2+.4),(.09,.08,height),white)
  for dy in range(-int(d/2)+1,int(d/2),2):
   cube('Side mullion',(x+w/2+.03,y+dy,height/2+.4),(.08,.09,height),white)
  cube('Roof cap',(x,y,height+.58),(w+.5,d+.5,.38),white,.035)
 for dx in [-2.8,0,2.8]:
  cube('Rooftop solar panel',(x+dx,y+1,height+.95),(2.1,3,.12),solar,.025)
  for line in [-.6,0,.6]:cube('Solar grid',(x+dx+line,y+1,height+1.02),(.024,2.9,.008),white)
 for dx in [-2,2]:
  cube('Roof HVAC',(x+dx,y-2.3,height+1.1),(1.25,1.4,.85),pavement,.07)
  cyl('HVAC fan',(x+dx,y-2.3,height+1.55),.43,.07,dark)
 color=brandcolors[index%4]
 cube('Brand backing',(x,y-3.5,height+2),(w*.98,.3,2.5),white,.04)
 label('Oversized company sign',brands[index%len(brands)],(x,y-3.7,height+1.3),1.2 if len(brands[index%len(brands)])<9 else .8,color)
 if index%4==1:
  # Distinct fictional roof emblems echo the outsized brands of a tech landscape.
  bpy.ops.mesh.primitive_torus_add(major_radius=1.8,minor_radius=.38,major_segments=24,minor_segments=8,location=(x,y+1,height+3.3),rotation=(math.pi/2,0,0));bpy.context.object.name='Brand loop';bpy.context.object.data.materials.append(color)
 elif index%4==2:
  for dx,h in [(-1.4,1.4),(0,2.4),(1.4,3.8)]:cube('Growth chart roof emblem',(x+dx,y+1,height+1+h/2),(1.1,.6,h),color,.05)
 group=parent_group(before,'Company '+str(index),(x,y,0))
 # Buildings visibly rise and one speculative tower collapses before rebuilding.
 start=12+(index*13)%155
 for frame,scale in [(1,.15 if index%3 else 1),(start,.15 if index%3 else 1),(start+22,1.06),(start+30,1)]:
  group.scale.z=scale;group.keyframe_insert(data_path='scale',frame=frame)
 if index==13:
  for frame,scale in [(188,1),(207,.18),(225,.18),(252,1.18)]:group.scale.z=scale;group.keyframe_insert(data_path='scale',frame=frame)
 for dx,dy in [(-7,-6),(-7,6),(7,6)]:tree(x+dx,y+dy)
 for yy in [-6.4,-4.7,-3]:
  cube('Parking line',(x+7.5,y+yy,.32),(1.7,.065,.015),white)

# Small moving cars create independent activity under the continuous camera pan.
for i in range(38):
 vertical=i%2==0;x=random.choice([-60,-36,-12,12,36,60])+1.45 if vertical else random.uniform(-75,75)
 y=random.uniform(-65,65) if vertical else random.choice([-48,-24,0,24,48])+1.45
 before=set(s.objects);paint=[white,red,blue,cream,dark][i%5]
 cube('Vehicle body',(0,0,.45),(1.6,.78,.45),paint,.12)
 cube('Vehicle glazing',(-.05,0,.78),(.85,.66,.36),glass,.09)
 cube('Vehicle roof',(-.05,0,.98),(.63,.59,.05),paint,.02)
 for dx in [-.5,.5]:
  for dy in [-.41,.41]:
   o=cyl('Tire',(dx,dy,.30),.22,.13,dark);o.rotation_euler.x=math.pi/2
 g=parent_group(before,'Commuter '+str(i),(0,0,0));g.rotation_euler.z=math.pi/2 if vertical else 0
 for frame,offset in [(1,0),(288,24)]:
  g.location=(x+(0 if vertical else offset),y+(offset if vertical else 0),0);g.keyframe_insert(data_path='location',frame=frame)
 for fc in g.animation_data.action.fcurves:
  for k in fc.keyframe_points:k.interpolation='LINEAR'

# Two yellow cranes with animated jibs.
for x,y in [(20,30),(-43,17)]:
 for z in range(0,19,2):
  for dx,dy in [(-.5,-.5),(.5,-.5),(-.5,.5),(.5,.5)]:cube('Crane mast',(x+dx,y+dy,z+1),(.14,.14,2),yellow)
  cube('Crane rung',(x,y,z),(1.2,1.2,.12),yellow)
 before=set(s.objects)
 cube('Crane jib',(x+3,y,19),(13,.35,.3),yellow)
 cube('Crane upper rail',(x+3,y,20),(13,.25,.15),yellow)
 for dx in range(-3,10,2):cube('Jib strut',(x+dx,y,19.5),(.13,.2,1),yellow)
 cube('Crane counterweight',(x-3,y,18.6),(1.4,1,.8),dark)
 cube('Crane cable',(x+8,y,16),(.04,.04,6),dark)
 g=parent_group(before,'Rotating crane',(x,y,19))
 for frame,a in [(1,-.15),(288,.45)]:g.rotation_euler.z=a;g.keyframe_insert(data_path='rotation_euler',frame=frame)

bpy.ops.object.light_add(type='SUN',location=(0,0,100));sun=bpy.context.object;sun.data.energy=2.4;sun.data.angle=math.radians(12);sun.rotation_euler=(math.radians(25),math.radians(-20),math.radians(-30))
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='Isometric editorial camera';cam.data.type='ORTHO';cam.data.lens=45;cam.data.clip_end=700;s.camera=cam
for frame,target,scale in [(1,(-18,2,0),112),(96,(9,10,0),112),(192,(3,-4,0),104),(288,(-24,-30,0),65)]:
 target=Vector(target);cam.location=target+Vector((100,-100,100));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
 cam.keyframe_insert(data_path='location',frame=frame);cam.data.keyframe_insert(data_path='ortho_scale',frame=frame)
s.frame_set(180)
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'isometric-intro.blend'))
if '--preview' in sys.argv:
 s.render.resolution_percentage=75;s.render.filepath=str(ART/'preview.png');bpy.ops.render.render(write_still=True);print('PREVIEW READY',flush=True)
else:
 import runpy
 runpy.run_path(str(ROOT/'scripts/film/render_isometric.py'),run_name='__main__')
