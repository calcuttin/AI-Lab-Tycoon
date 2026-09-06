"""Extend the approved garage into an original six-shot Silicon Valley film.
Build and preview: Blender -b -t 8 --python scripts/film/build_valley.py -- --stills
Render saved edit: Blender -b art/valley-film/valley-film.blend -a
"""
import bpy, math, random, pathlib, sys, ast, json
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[2]
ART=ROOT/'art/valley-film'; ART.mkdir(exist_ok=True)
(ART/'frames').mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/garage-proof/garage-proof.blend'))
scene=bpy.context.scene
# Share modeling primitives with the proof, without rerunning or overwriting it.
source=ast.parse((ROOT/'scripts/film/render_garage.py').read_text())
exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name in {'rgb','mat','uv_world','cube','cyl','beam','text','area'}],type_ignores=[]),'garage-primitives','exec'))
random.seed(404)
# Resolve source paths before saving in the sibling film directory.
for image in bpy.data.images:
 if image.filepath:image.filepath=bpy.path.abspath(image.filepath)
for o in scene.objects:
 if o.type=='CAMERA':o.animation_data_clear()
scene.render.engine='BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples=32
scene.eevee.use_raytracing=True
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.fps=24;scene.frame_start=1;scene.frame_end=864
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB'
scene.render.use_file_extension=True
scene.view_settings.exposure=.3
scene.render.use_motion_blur=False
ivory=bpy.data.materials['Faded ivory enamel']; concrete=bpy.data.materials['Scanned worn concrete'];stucco=bpy.data.materials['Scanned warm painted plaster'];roof=bpy.data.materials['Scanned asphalt shingles']
dark=bpy.data.materials['Powder-coated graphite'];metal=bpy.data.materials['Galvanized metal'];paper=bpy.data.materials['Paper and whiteboard'];ink=bpy.data.materials['Dark printed ink'];wood=bpy.data.materials['Weathered cedar']
lawn=bpy.data.materials['Dry California lawn']
glass=mat('Blue architectural reflective glass','#547d86',.18,.72)
road=mat('District asphalt','#42484a',.92);line=mat('Road paint','#e4dab4',.8)
# The district sits behind the residential streets, with space between real blocks.
cube('Peninsula terrain',(30,90,-.25),(400,290,.3),lawn,.02)
cube('Freeway median',(28,48,.11),(240,1.2,.4),concrete,.02)
for y in [42,54]:
 cube('Freeway carriageway',(28,y,.04),(240,10,.16),road,.01)
 for offset in [-3.2,0,3.2]:
  for x in range(-85,150,8):cube('Lane dash',(x,y+offset,.13),(3,.1,.008),line,0)
 for edge in [-4.8,4.8]:cube('Freeway edge line',(28,y+edge,.13),(240,.1,.008),ivory,0)
 for x in range(-80,150,12):
  cyl('Freeway light pole',(x,y+5.3,4),.06,8,metal)
  beam('Lamp arm',(x,y+5.3,8),(x,y+3.4,8.2),.07,metal)
  cube('Lamp head',(x,y+3.2,8.2),(.3,.7,.09),ivory,.025)
# Recognizable sedans: curved shells, glazing, tires, lamps. Motion is keyed.
carColors=[mat('Car paint '+str(i),c,.25,.45) for i,c in enumerate(['#c1c7c2','#303e48','#a17d64','#e2dfd5','#5b756f','#973f32'])]
def car(x,y,angle,index,moving=True):
 parent=bpy.data.objects.new('Commuter '+str(index),None);scene.collection.objects.link(parent)
 before=set(scene.objects)
 paint=carColors[index%len(carColors)]
 cube('Sedan body',(0,0,.65),(4.3,1.85,.68),paint,.22)
 cube('Glass cabin',(-.1,0,1.22),(2.2,1.65,.73),glass,.3)
 cube('Sedan roof',(-.1,0,1.61),(1.55,1.54,.065),paint,.06)
 for side in [-1,1]:
  for xx in [-1.35,1.35]:
   cyl('Rubber tire',(xx,side*.89,.43),.37,.22,dark,(math.pi/2,0,0))
   cyl('Alloy wheel',(xx,side*1.012,.43),.23,.018,metal,(math.pi/2,0,0))
  cube('Door pillar',(-.15,side*.83,1.3),(.12,.05,.54),paint,.02)
  for xx in [-.8,.65]:cube('Door handle',(xx,side*.94,.86),(.2,.025,.035),metal,.01)
 for side in [-1,1]:
  cube('Headlight',(2.14,side*.61,.77),(.02,.4,.16),ivory,.02)
  cube('Tail light',(-2.14,side*.61,.77),(.02,.4,.12),carColors[5],.01)
 for o in set(scene.objects)-before:o.parent=parent
 parent.location=(x,y,0);parent.rotation_euler[2]=angle
 if moving:
  for f in [1,864]:
   parent.location.x=x+(f-1)/24*2.2*(1 if angle==0 else -1);parent.keyframe_insert(data_path='location',frame=f)
  for fc in parent.animation_data.action.fcurves:
   for k in fc.keyframe_points:k.interpolation='LINEAR'
 return parent
for i in range(24):car(-70+(i%8)*22,38.8+(i//8)*3.2,0,i)
for i in range(18):car(-30+(i%6)*24,50.8+(i//6)*3.2,math.pi,i+24)
# Reuse authored foliage as linked meshes, so the saved set stays manageable.
treeSource=next(o for o in scene.objects if o.name.startswith('tree_small_02 placement'))
def tree(x,y,s=1.5):
 p=treeSource.copy();p.animation_data_clear();scene.collection.objects.link(p);p.location=(x,y,0);p.scale=(s,s,s);p.rotation_euler[2]=random.uniform(0,6.28)
 for child in treeSource.children:
  c=child.copy();c.data=child.data;scene.collection.objects.link(c);c.parent=p
 return p
for x in range(-70,145,14):
 for y in [30,65,110]:tree(x+random.uniform(-2,2),y,random.uniform(1.4,2.2))
# An original, extravagantly oversized campus with a planted central courtyard.
CX,CY=-24,91
cube('Campus plaza',(CX,CY,.02),(58,40,.14),concrete,.02)
for dx,dy,sx,sy in [(0,15,51,7),(0,-15,51,7),(-22,0,7,25),(22,0,7,25)]:
 cube('Campus glazing',(CX+dx,CY+dy,4.2),(sx,sy,8),glass,.12)
 for z in [.4,3.1,5.8,8.3]:cube('Campus white ribbon',(CX+dx,CY+dy,z),(sx+.25,sy+.25,.25),ivory,.03)
 for xx in range(int(-sx/2)+1,int(sx/2),3):
  for yy in [-sy/2-.03,sy/2+.03]:cube('Campus mullion',(CX+dx+xx,CY+dy+yy,4.2),(.065,.1,7.8),metal,.008)
 cube('Campus roof',(CX+dx,CY+dy,8.5),(sx+.4,sy+.4,.25),ivory,.03)
 for xx in range(int(-sx/2)+2,int(sx/2)-2,4):cube('Rooftop solar panel',(CX+dx+xx,CY+dy,8.72),(2.9,3.6,.055),glass,.01)
for xx in [-12,0,12]:
 for yy in [-6,6]:
  cyl('Courtyard planter',(CX+xx,CY+yy,.35),2,.6,ivory)
  tree(CX+xx,CY+yy,1.7)
cyl('Campus fountain basin',(CX,CY,.28),3.5,.4,ivory)
water=mat('Still blue water','#5a9295',.13,.45);cyl('Reflecting pool',(CX,CY,.5),3.2,.04,water)
cube('Campus monument',(CX+17,CY-23,1.8),(9,.5,3.6),ink,.08)
text('Campus brand','HOLLOW',(CX+17,CY-23.27,2.03),.94,paper,align='CENTER')
text('Campus promise','MAKING THE WORLD SUBSCRIPTION-BASED',(CX+17,CY-23.28,1.43),.14,paper,align='CENTER')
# Corporate blocks: detailed curtain walls, parapets, mechanical decks and parking.
for i,(x,y,w,d,h) in enumerate([(58,83,17,13,24),(84,96,20,15,35),(110,82,16,13,20),(62,112,14,12,17)]):
 cube('Tower podium',(x,y,.28),(w+8,d+8,.6),concrete,.06)
 cube('Tower core',(x,y,h/2),(w,d,h),glass,.16)
 for z in range(1,h,3):cube('Floor spandrel',(x,y,z),(w+.06,d+.06,.23),dark,.01)
 for xx in range(int(-w/2)+1,int(w/2),2):
  for yy in [-d/2-.04,d/2+.04]:cube('Curtain wall mullion',(x+xx,y+yy,h/2),(.065,.09,h),metal,.005)
 for yy in range(int(-d/2)+1,int(d/2),2):
  for xx in [-w/2-.04,w/2+.04]:cube('Curtain wall side mullion',(x+xx,y+yy,h/2),(.09,.065,h),metal,.005)
 cube('Roof parapet',(x,y,h+.2),(w+.3,d+.3,.45),ivory,.03)
 for xx in [-3,3]:
  cube('Rooftop HVAC',(x+xx,y,h+.95),(3,3.5,1.3),metal,.08)
  cyl('Condenser fan',(x+xx,y,h+1.63),1,.03,dark)
 cube('Tower sign',(x,y-d/2-.1,h-2),(w*.83,.16,1.5),ink,.03)
 text('Speculative brand',['PRE-REVENUE','UNREASONABLE','STEALTH.','EXIT STRATEGY'][i],(x,y-d/2-.2,h-2.17),.72,paper,align='CENTER')
for x in range(42,125,5):
 for y in [67,122]:
  cube('Parking stall',(x,y,.1),(.08,4.6,.01),ivory,0)
  if (x+y)%3:car(x+2,y,math.pi/2,x+y,False)
# A lattice crane rotates slowly above the newest promise.
craneMat=mat('Safety ochre','#d0a44c',.55,.3)
for z in range(0,36,3):
 for x in [123,125]:
  for y in [101,103]:beam('Crane mast',(x,y,z),(x,y,z+3),.13,craneMat)
 for y in [101,103]:beam('Crane lattice',(123,y,z),(125,y,z+3),.08,craneMat)
arm=bpy.data.objects.new('Crane slewing assembly',None);scene.collection.objects.link(arm);arm.location=(124,102,36)
before=set(scene.objects)
for y in [-.6,.6]:
 beam('Crane jib',(-8,y,0),(25,y,0),.14,craneMat)
 beam('Crane top chord',(-8,y,1.4),(25,y,1.4),.12,craneMat)
 for x in range(-8,25,3):beam('Crane truss',(x,y,0),(x+3,y,1.4),.08,craneMat)
cube('Crane counterweight',(-7,0,-.5),(3,2,1.5),concrete,.04)
beam('Crane hoist',(18,0,0),(18,0,-17),.035,dark)
for o in set(scene.objects)-before:o.parent=arm
for f,a in [(1,-.2),(864,.16)]:arm.rotation_euler[2]=a;arm.keyframe_insert(data_path='rotation_euler',frame=f)
# Bungalows extend the existing neighborhood with driveways and mature trees.
for x,y in [(-28,3),(-30,20),(26,6),(27,23),(-12,27),(8,30)]:
 cube('Bungalow',(x,y,1.55),(9,6.6,3.1),stucco,.035)
 for side in [-1,1]:
  r=cube('Bungalow pitched roof',(x+side*2.35,y,3.75),(4.95,7.4,.17),roof,.025);r.rotation_euler[1]=side*.24
 for dx in [-2.5,2.5]:
  cube('Bungalow window frame',(x+dx,y-3.34,1.8),(1.9,.1,1.3),ivory,.015)
  cube('Bungalow glass',(x+dx,y-3.4,1.8),(1.72,.025,1.12),glass,.008)
 cube('Neighbor drive',(x,y-6.5,.025),(4.7,6,.12),concrete,.02)
 tree(x+5.8,y+1,1.8)
# Useful prop details in the workbench close-up.
for i in range(4):cube('Founder notebook',(-2.25,1.61,1.025+i*.018),(.3,.4,.017),paper,.003)
text('Workbench notebook title','NEXT BIG THING',(-2.37,1.43,1.10),.025,ink,rotation=(0,0,0))
# Individual setups have real lenses, focus targets and gentle eased camera moves.
shots=[
 ('THE PENINSULA',(116,-38,83),(85,-8, 64),(25,76,4),(22,78,4),44,11),
 ('THE CAMPUS',(-69,47,25),(-52,53,18),(-24,88,3),(-22,88,3),40,9),
 ('THE NEXT BIG THING',(134,43, 30),(116,49,34),(85,96,17),(86,97,18),43,10),
 ('THE NEIGHBORHOOD',(-26,-30,19),(-17,-24,12),(0,0,1.6),(0,-1,1.6),43,9),
 ('YOUR HEADQUARTERS',(8,-17,5.1),(6.2,-14.1,3.9),(.1,0,1.8),(.1,0,1.8),43,7.1),
 ('THE FIRST COMMIT',(-3,-2,2.15),(-2.7,-1.2,1.92),(-1.6,1.43,1.38),(-1.65,1.45,1.38),52,3.2),
]
scene.timeline_markers.clear()
for index,(name,start,end,look0,look1,lens,fstop) in enumerate(shots):
 f0=index*144+1;f1=(index+1)*144
 target=bpy.data.objects.new(name+' focus',None);scene.collection.objects.link(target)
 data=bpy.data.cameras.new(name+' lens');cam=bpy.data.objects.new(name+' camera',data);scene.collection.objects.link(cam)
 data.lens=lens;data.clip_end=1000;data.dof.use_dof=True;data.dof.focus_object=target;data.dof.aperture_fstop=fstop
 track=cam.constraints.new('TRACK_TO');track.target=target;track.track_axis='TRACK_NEGATIVE_Z';track.up_axis='UP_Y'
 for f,loc,look in [(f0,start,look0),(f1,end,look1)]:
  cam.location=loc;cam.keyframe_insert(data_path='location',frame=f)
  target.location=look;target.keyframe_insert(data_path='location',frame=f)
 marker=scene.timeline_markers.new(name,frame=f0);marker.camera=cam
 if index==0:scene.camera=cam
scene.frame_set(72)
scene.render.filepath=str(ART/'frames/frame-')
for layout in bpy.data.screens:
 for editor in layout.areas:
  if editor.type=='VIEW_3D':editor.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'valley-film.blend'))
bpy.ops.file.make_paths_relative();bpy.ops.wm.save_as_mainfile(filepath=str(ART/'valley-film.blend'))
(ART/'edit.json').write_text(json.dumps({'fps':24,'width':1920,'height':1080,'duration':36,'frames':864,'chapters':[{'name':s[0],'start':i*6,'end':(i+1)*6} for i,s in enumerate(shots)],'engine':'Blender EEVEE + Cycles garage proof'},indent=2)+'\n')
print('FILM BUILT',len(scene.objects),'objects',flush=True)
if '--stills' in sys.argv:
 scene.render.resolution_percentage=60
 for i in range(6):
  scene.frame_set(i*144+72);scene.render.filepath=str(ART/f'shot-{i+1}.png');bpy.ops.render.render(write_still=True)
