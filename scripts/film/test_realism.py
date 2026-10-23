"""Render matched before/after Blender studies without changing the released film.
Blender -b --factory-startup --disable-autoexec --python scripts/film/test_realism.py
"""
import bpy, pathlib, math, random, ast, json, time, sys
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[2]
ART=ROOT/'art/realism-test'; ART.mkdir(exist_ok=True)
source=ast.parse((ROOT/'scripts/film/render_garage.py').read_text())
exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name in {'rgb','mat','uv_world','cube','cyl','beam','text','area'}],type_ignores=[]),'primitives','exec'))

def cord(name,points,radius,material):
 c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D';c.bevel_depth=radius;c.bevel_resolution=3
 s=c.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
 for p,co in zip(s.bezier_points,points):p.co=co;p.handle_left_type=p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);c.materials.append(material);return o

def micro(material,scale=140,distance=.002):
 n=material.node_tree.nodes;l=material.node_tree.links;p=n.get('Principled BSDF')
 if p.inputs['Normal'].is_linked:return
 tc=n.new('ShaderNodeTexCoord'); noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=scale;noise.inputs['Detail'].default_value=3;l.new(tc.outputs['Object'],noise.inputs['Vector'])
 b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.2;b.inputs['Distance'].default_value=distance;l.new(noise.outputs['Fac'],b.inputs['Height']);l.new(b.outputs[0],p.inputs['Normal'])

def glass_physical():
 m=bpy.data.materials['Low-iron architectural glazing'];p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=rgb('#f2f7f6');p.inputs['Metallic'].default_value=0;p.inputs['Transmission Weight'].default_value=1;p.inputs['Alpha'].default_value=1;p.inputs['Roughness'].default_value=.045;p.inputs['IOR'].default_value=1.46
 # Existing facade slabs already have physical thickness. Avoid overlapping new shells.
 return m

def load(shot):
 global scene
 random.seed(902)
 bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/material-study/valley-realism.blend'));scene=bpy.context.scene
 for im in bpy.data.images:
  if im.filepath:im.filepath=bpy.path.abspath(im.filepath)
 scene.frame_set(216 if shot=='street' else 792);scene.timeline_markers.clear()
 data=bpy.data.cameras.new('Realism comparison lens');cam=bpy.data.objects.new('Realism comparison camera',data);scene.collection.objects.link(cam);scene.camera=cam
 loc,target,lens=((-57,61.5,1.85),(-21,80,3.3),32) if shot=='street' else ((-.1,-2.45,1.68),(-.25,1.8,1.35),28)
 cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=lens;data.clip_end=1000
 data.dof.use_dof=True;data.dof.focus_distance=(Vector(target)-cam.location).length;data.dof.aperture_fstop=8 if shot=='street' else 5.6
 scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
 scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.use_file_extension=True
 scene.render.use_persistent_data=True
 return scene

def cycles():
 scene.render.engine='CYCLES';scene.cycles.samples=160;scene.cycles.adaptive_threshold=.025;scene.cycles.use_denoising=True
 scene.cycles.max_bounces=12;scene.cycles.diffuse_bounces=5;scene.cycles.glossy_bounces=6;scene.cycles.transmission_bounces=8;scene.cycles.transparent_max_bounces=16
 prefs=bpy.context.preferences.addons['cycles'].preferences
 try:
  prefs.compute_device_type='METAL';prefs.get_devices()
  for d in prefs.devices:d.use=d.type=='METAL'
  scene.cycles.device='GPU'
 except Exception:scene.cycles.device='CPU'
 scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.2


def street_details():
 dark=bpy.data.materials['Powder-coated graphite'];metal=bpy.data.materials['Galvanized metal'];concrete=bpy.data.materials['Scanned worn concrete'];ivory=bpy.data.materials['Faded ivory enamel'];asphalt=bpy.data.materials['District asphalt'];gravel=bpy.data.materials['Scanned decomposed granite'];wood=bpy.data.materials['Weathered cedar']
 glass_physical()
 # A six-metre access street, curb and jointed sidewalk give the campus a real address.
 for o in list(scene.objects):
  if o.name.startswith('Gravel landscape bed') and abs(o.location.y-64)<1:bpy.data.objects.remove(o,do_unlink=True)
  elif o.name.startswith('tree_small_02 placement') and 60<o.location.y<70 and -70<o.location.x<22:
   o.location.y=113
 cube('Campus frontage street',(-23,65,.09),(104,6,.16),asphalt,.005)
 cube('Campus frontage sidewalk',(-23,69.5,.17),(104,2.8,.22),concrete,.014)
 cube('Street curb',(-23,68.08,.23),(104,.2,.3),concrete,.02)
 cube('Near sidewalk',(-23,60.75,.17),(104,2.25,.22),concrete,.014)
 cube('Near street curb',(-23,61.92,.23),(104,.2,.3),concrete,.02)
 cube('Gutter channel',(-23,67.73,.155),(104,.5,.03),concrete,.012)
 for x in range(-73,29,3):cube('Sidewalk expansion joint',(x,69.5,.283),(.012,2.72,.003),dark,0)
 tar=mat('Weathered bitumen','#343635',.78)
 for x in [-66,-45,-12,8,23]:
  cord('Repaired asphalt fracture',[(x,62.5,.177),(x+.16,63.3,.177),(x-.08,64.2,.177),(x+.35,65.2,.177),(x+.22,67.7,.177)],.012,tar)
 for x in [-49,-22,5]:
  cube('Storm drain dark recess',(x,67.71,.179),(.75,.42,.018),dark,.015)
  for j in range(10):cube('Cast iron drain grate',(x-.33+j*.073,67.71,.193),(.028,.38,.015),metal,.003)
 # Painted crosswalk with slight material wear, plus curbside drainage detail.
 paint=mat('Weathered crossing paint','#d5d0b9',.83);micro(paint,85,.001)
 for y in [62.5,63.5,64.5,65.5,66.5,67.3]:cube('Pedestrian crossing',(-7,y,.18),(3,.45,.005),paint,.008)
 # Recessed working entrance, thresholds, pull handles, rubber gaskets and mullions.
 g=bpy.data.materials['Low-iron architectural glazing'];seal=mat('EPDM glazing gasket','#242a28',.76)
 for x in range(-48,2,3):
  cube('Facade gasket',(x,72.482,4.2),(.105,.025,7.8),seal,.002)
  cube('Facade cap',(x,72.447,4.2),(.047,.07,7.8),metal,.003)
 for z in [1.2,3.1,5.8,8.3]:cube('Front glazing transom',(-24,72.45,z),(51,.065,.045),metal,.003)
 for x in [-27.75,-26.55]:
  for xx in [x-.55,x+.55]:cube('Entrance leaf stile',(xx,72.36,1.55),(.05,.09,2.65),metal,.005)
  for zz in [.25,2.85]:cube('Entrance leaf rail',(x,72.36,zz),(1.15,.09,.05),metal,.005)
  cube('Entrance glass',(x,72.295,1.56),(1.04,.016,2.5),g,.002)
  cyl('Door pull',(x+.4,72.17,1.35),.017,.58,metal)
 cube('Entrance sill',(-27.15,72.15,.33),(2.5,.6,.08),metal,.012)
 cube('Entrance canopy',(-27.15,71.9,3.15),(4.8,1.5,.13),metal,.025)
 # A textured planter and timber bench create human scale without novelty clutter.
 for x in [-39,-15]:
  cube('Front planting trough',(x,70.9,.52),(4.2,.75,.62),concrete,.04)
  cube('Mulch in trough',(x,70.9,.838),(4,.61,.025),gravel,.008)
 shrub=next(o for o in scene.objects if o.name.startswith('shrub_01 placement'))
 for x in [-40.2,-39,-37.8,-16.2,-15,-13.8]:
  parent=shrub.copy();parent.animation_data_clear();scene.collection.objects.link(parent);parent.location=(x,70.9,.84);parent.scale=(3.2,3.2,3.2);parent.rotation_euler.z=random.random()*6.28
  for child in shrub.children:
   o=child.copy();o.data=child.data;scene.collection.objects.link(o);o.parent=parent
 for x in [-32,-30.4]:cube('Bench leg',(x,70.5,.45),(.07,.55,.4),metal,.01)
 for j in range(5):cube('Bench timber slat',(-31.2,70.3+j*.105,.68),(2.15,.088,.065),wood,.012)
 # The glass now reveals actual floor depth; brighten the recess slightly, keeping daylight dominant.
 for name in ['Interior warm partitions','Interior acoustic ceiling']:
  p=bpy.data.materials[name].node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=rgb('#a7a69b' if 'partitions' in name else '#d4d0c5')
 # Broad source gives softer afternoon sunlight; keep the original geographic environment.
 sun=bpy.data.objects['California afternoon'];sun.data.energy=2.1;sun.data.angle=.055;sun.data.color=(1,.91,.77)
 scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.55
 for m in [metal,ivory]:micro(m)


def garage_details():
 dark=bpy.data.materials['Powder-coated graphite'];metal=bpy.data.materials['Galvanized metal'];paper=bpy.data.materials['Paper and whiteboard'];wood=bpy.data.materials['Weathered cedar'];ink=bpy.data.materials['Dark printed ink']
 # Face the authored drawers and knee wells toward the worker, not the modesty panel.
 for o in scene.objects:
  if o.name.startswith('metal_office_desk placement'):o.rotation_euler.z=0
  if o.name.startswith(('Keyboard','Mouse mat','Mouse')):o.location.y+=.46;o.location.z+=.031
  if o.name.startswith(('Monitor base','Monitor stand','Monitor enclosure','LCD glass','Code line','Post-it')):o.location.y+=.15;o.location.z+=.032
  if o.name.startswith(('Coffee mug','Coffee surface')) or (o.name.startswith('Torus') and abs(o.location.y-1.08)<.01):o.location.y+=.48;o.location.z+=.007
 # Less showroom fill; a broad opening and practical tubes establish warm/cool depth.
 scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.32
 bpy.data.objects['California afternoon'].data.energy=1.8
 bpy.data.objects['Interior fluorescent'].data.energy=60
 area('Open garage sky',(0,-3.8,2.4),190,(.75,.86,1),4.8,(0,1.5,.6))
 # Joists, brackets, screw heads and surface conduit make this a working garage.
 for x in [-2.7,-1.4,1.4,2.7]:
  beam('Exposed ceiling joist',(x,-2.8,2.99),(x,2.8,2.99),.095,wood)
 for x in [-2.85,2.85]:
  for y in [-1.8,.1,1.9]:
   cube('Track steel hanger',(x,y,2.83),(.032,.045,.23),metal,.003)
   cyl('Track fastener',(x,y-.03,2.78),.012,.016,metal,(math.pi/2,0,0),12)
 cube('Interior breaker panel',(2.95,2.88,1.65),(.28,.1,.42),metal,.008)
 beam('Surface mounted conduit vertical',(2.95,2.89,1.85),(2.95,2.89,2.65),.024,metal)
 beam('Surface mounted conduit horizontal',(2.95,2.89,2.65),(1.5,2.89,2.65),.024,metal)
 for x in [-1.7,1.25]:
  cube('Outlet plate',(x,2.875,.51),(.09,.015,.14),paper,.004)
  for z in [.475,.535]:
   for dx in [-.017,.017]:cube('Socket opening',(x+dx,2.864,z),(.004,.004,.015),dark,.001)
  cord('Monitor cable loom',[(x,1.48,1.3),(x+.1,1.65,1.03),(x+.28,1.8,.56),(x+.4,2.1,.28),(x,2.84,.46)],.007,dark)
 # Paperwork, an open notebook, pen, ethernet switch and phone use real-world dimensions.
 for i in range(6):
  o=cube('Loose planning paper',(.73,1.14,1.025+i*.0015),(.21,.297,.0008),paper,0);o.rotation_euler.z=random.uniform(-.13,.13)
 cover=mat('Notebook cloth cover','#415c59',.88);micro(cover,220,.001)
 cube('Open engineering notebook',(-1.25,1.11,1.035),(.28,.20,.014),cover,.005)
 for side in [-1,1]:
  page=cube('Notebook page',(-1.25+side*.069,1.105,1.044),(.132,.187,.002),paper,.001);page.rotation_euler.y=side*.035
 for j in range(7):cube('Notebook pencil line',(-1.31,1.04+j*.021,1.047),(.10,.0007,.0003),ink,0)
 pen=cyl('Desk pen',(-1.07,1.11,1.041),.004,.14,dark,(math.pi/2,0,.2),16)
 cube('Ethernet switch',(1.75,1.65,1.055),(.18,.11,.045),metal,.007)
 for j in range(5):cube('Ethernet port',(1.69+j*.026,1.59,1.055),(.018,.004,.013),dark,.001)
 cord('Ethernet cable',[(1.69,1.585,1.055),(1.82,1.39,1.034),(1.94,1.72,1.026),(1.9,1.75,.76)],.003,mat('Ethernet blue','#476b89',.65))
 cube('Face down phone',(-2.01,1.06,1.033),(.074,.145,.008),dark,.009)
 # Physical tape, bent carton flaps and labels replace perfectly untouched storage.
 cardboard=bpy.data.materials['Cardboard'];tape=mat('Translucent packing tape','#c6a873',.28)
 for x,y,z in [(2.4,-1.4,.72),(2.48,-1.26,1.02)]:
  flap=cube('Bent carton flap',(x-.25,y,z+.045),(.28,.51,.006),cardboard,.002);flap.rotation_euler.y=-.28
 for i in range(3):
  cube('Wall tape tab',(-1.11+i*.095,2.823,2.43),(.06,.002,.025),tape,.001)
 # Place new desktop accessories on the measured 1.048m-high, 0.917m-deep tops.
 for o in scene.objects:
  if o.name.startswith(('Open engineering notebook','Notebook page','Notebook pencil line','Desk pen','Face down phone')):o.location.y+=.46;o.location.z+=.03
  elif o.name.startswith('Loose planning paper'):o.location.y+=.4;o.location.z+=.025
  elif o.name.startswith(('Ethernet switch','Ethernet port','Ethernet cable')):o.location.z+=.02;o.location.y+=.1
  if o.name.startswith(('Open engineering notebook','Notebook page','Notebook pencil line','Desk pen')):o.location.x+=.25
 # Editorial detail: actual tiny editor text, sidebars and terminals instead of luminous strips.
 for o in list(scene.objects):
  if o.name.startswith('Code line'):bpy.data.objects.remove(o,do_unlink=True)
 sp=bpy.data.materials['Screen black'].node_tree.nodes.get('Principled BSDF');sp.inputs['Base Color'].default_value=rgb('#111b24');sp.inputs['Emission Color'].default_value=rgb('#17232d');sp.inputs['Emission Strength'].default_value=.35
 ui=mat('Editor chrome','#23313c',.5);fontmat=mat('Editor text','#c4cfd6',.5);accent=mat('Editor syntax','#89b3a6',.5)
 for m,c in [(fontmat,'#bccbd3'),(accent,'#89b3a6')]:
  p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=rgb(c);p.inputs['Emission Strength'].default_value=.5
 fontpath=pathlib.Path('/System/Library/Fonts/Menlo.ttc');font=bpy.data.fonts.load(str(fontpath)) if fontpath.exists() else None
 for index,x in enumerate([-1.72,1.25]):
  cube('Editor title bar',(x,1.558,1.65),(.70,.001,.028),ui,0)
  cube('Editor file sidebar',(x-.295,1.558,1.475),(.10,.001,.30),ui,0)
  def screen_text(name,body,xx,zz,size=.010,material=fontmat):
   o=text(name,body,(xx,1.554,zz),size,material);o.data.extrude=0;o.data.bevel_depth=0
   if font:o.data.font=font
   return o
  screen_text('Editor title','main.py  -  runway' if index==0 else 'forecast.py  -  finance',x-.32,1.646)
  screen_text('Editor explorer','FILES\n\nsrc\n main.py\n costs.py\n\ntests\nREADME',x-.337,1.612,.007)
  code=['01  import runway','02','03  def next_big_thing(budget):','04      burn = calculate_costs()','05      if burn > budget:','06          return "pivot"','07      ship(prototype)','08','09  # TODO: find customers','10  next_big_thing(remaining)'] if index==0 else ['01  # Monthly forecast','02  revenue = 0','03  cloud_bill = 12480','04  coffee = 342','05','06  runway = cash / burn','07  assert optimism > 0','08','09  # excludes founder salary','10  print("looks scalable")']
  screen_text('Editor code','\n'.join(code),x-.225,1.612,.010,accent)
  screen_text('Editor terminal','TERMINAL  >  tests passed' if index==0 else 'TERMINAL  >  margin: pending',x-.225,1.306,.008)
 markerpath=pathlib.Path('/System/Library/Fonts/MarkerFelt.ttc')
 if markerpath.exists():
  marker=bpy.data.fonts.load(str(markerpath))
  for name in ['Whiteboard headline','Whiteboard plan']:
   o=bpy.data.objects[name];o.data.font=marker;o.data.extrude=0;o.data.bevel_depth=0
 # A loose sketch and two marker pens keep the joke embedded in the working set.
 cord('Whiteboard growth sketch',[(.6,2.82,1.73),(.8,2.82,1.76),(1.0,2.82,1.9),(1.15,2.82,2.14)],.004,ink)
 for x in [.75,.96]:cyl('Whiteboard marker',(x,2.75,1.425),.008,.13,dark,(0,math.pi/2,0),16)
 # Worn concrete dirt marks use irregular low-contrast geometry, never a uniform overlay.
 dust=mat('Embedded floor dust','#555b51',.98)
 for i in range(25):
  x=random.uniform(-2.7,2.8);y=random.uniform(.8,2.7)
  bpy.ops.mesh.primitive_circle_add(vertices=13,radius=random.uniform(.007,.035),fill_type='NGON',location=(x,y,.261))
  o=bpy.context.object;o.name='Small floor scuff';o.scale.y=random.uniform(.3,1.5);o.data.materials.append(dust)
 for m in [dark,metal,paper]:micro(m)

manifest=json.loads((ART/'render-manifest.json').read_text()) if (ART/'render-manifest.json').exists() else {'description':'Matched framing studies: released scene against Cycles lighting and additional set detail. Not a replacement of the released movie.','shots':[]}
for shot in ['street','garage']:
 if len(sys.argv)>1 and '--' in sys.argv and shot not in sys.argv[sys.argv.index('--')+1:]:continue
 load(shot)
 scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=32
 scene.render.filepath=str(ART/(shot+'-before.png'));start=time.time();bpy.ops.render.render(write_still=True)
 print('BASELINE READY',shot,round(time.time()-start,1),flush=True)
 cycles();street_details() if shot=='street' else garage_details()
 scene.render.filepath=str(ART/(shot+'-after.png'))
 bpy.ops.wm.save_as_mainfile(filepath=str(ART/(shot+'.blend')))
 start=time.time();bpy.ops.render.render(write_still=True)
 info={'shot':shot,'before':shot+'-before.png','after':shot+'-after.png','engine':'Cycles','samples':160,'width':1600,'height':1000,'renderSeconds':round(time.time()-start,1)}
 manifest['shots']=[entry for entry in manifest['shots'] if entry['shot']!=shot];manifest['shots'].append(info);(ART/'render-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
 print('REALISM TEST COMPLETE',info,flush=True)
