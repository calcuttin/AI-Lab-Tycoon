"""Rebuild the material pass from the approved film, preserving its six-shot edit.
Blender -b --factory-startup --python scripts/film/refine_materials.py -- --stills
Every run starts from valley-film.blend; generated geometry never accumulates.
"""
import bpy, math, random, pathlib, ast, sys
from mathutils import Vector, noise
ROOT=pathlib.Path(__file__).resolve().parents[2]
ART=ROOT/'art/material-study'; ASSETS=ART/'assets'; ART.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art/valley-film/valley-film.blend'))
scene=bpy.context.scene; random.seed(713)
for image in bpy.data.images:
 if image.filepath:image.filepath=bpy.path.abspath(image.filepath)
source=ast.parse((ROOT/'scripts/film/render_garage.py').read_text())
exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name in {'rgb','mat','uv_world','cube','cyl','beam','area'}],type_ignores=[]),'primitives','exec'))

def scanned(name,asset,scale,normal=.35):
 m=bpy.data.materials.get(name) or mat(name,'#ffffff');n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF')
 for socket in ['Base Color','Roughness','Normal']:
  for link in list(p.inputs[socket].links):l.remove(link)
 tc=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeVectorMath');mapping.operation='SCALE';mapping.inputs[3].default_value=scale;l.new(tc.outputs['UV'],mapping.inputs[0])
 for kind,target in [('diff','Base Color'),('rough','Roughness'),('nor_gl','Normal')]:
  path=next((ASSETS/asset).glob('*'+kind+'*jpg'));tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path),check_existing=True);l.new(mapping.outputs[0],tex.inputs['Vector'])
  if kind!='diff':tex.image.colorspace_settings.name='Non-Color'
  if kind=='nor_gl':
   normal_node=n.new('ShaderNodeNormalMap');normal_node.inputs['Strength'].default_value=normal;l.new(tex.outputs['Color'],normal_node.inputs['Color']);l.new(normal_node.outputs[0],p.inputs[target])
  else:l.new(tex.outputs['Color'],p.inputs[target])
 return m
asphalt=scanned('District asphalt','asphalt_02',.22,.42)
scanned('Asphalt','asphalt_02',.28,.45)
scanned('Weathered cedar','wood_table_worn',.85,.28)
gravel=scanned('Scanned decomposed granite','gravel_ground_01',.45,.6)
# Fine manufacturing variation, kept below silhouette scale.
for name,scale,strength,distance in [('Galvanized metal',135,.2,.003),('Powder-coated graphite',220,.16,.002),('Faded ivory enamel',170,.1,.0015),('Cardboard',190,.25,.002)]:
 m=bpy.data.materials[name];n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF');tc=n.new('ShaderNodeTexCoord');tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=scale;tex.inputs['Detail'].default_value=2;l.new(tc.outputs['Object'],tex.inputs['Vector']);bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=strength;bump.inputs['Distance'].default_value=distance;l.new(tex.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],p.inputs['Normal'])
# Dry Californian vegetation: broad irrigation/soil patches plus fine ground detail.
lawn=bpy.data.materials['Dry California lawn'];n=lawn.node_tree.nodes;l=lawn.node_tree.links;p=n.get('Principled BSDF')
for link in list(p.inputs['Base Color'].links):l.remove(link)
tc=n.new('ShaderNodeTexCoord');broad=n.new('ShaderNodeTexNoise');broad.inputs['Scale'].default_value=.1;broad.inputs['Detail'].default_value=4;l.new(tc.outputs['Object'],broad.inputs['Vector'])
ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.24;ramp.color_ramp.elements[0].color=rgb('#62694a');ramp.color_ramp.elements[1].position=.8;ramp.color_ramp.elements[1].color=rgb('#b4a27c');l.new(broad.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs[0],p.inputs['Base Color'])
fine=n.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=38;fine.inputs['Detail'].default_value=3;l.new(tc.outputs['Object'],fine.inputs['Vector']);bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.35;bump.inputs['Distance'].default_value=.025;l.new(fine.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],p.inputs['Normal'])
# An irregular, continuous ridge replaces overlapping smooth dome primitives.
for o in list(scene.objects):
 if o.name.startswith('Peninsula foothill'):bpy.data.objects.remove(o,do_unlink=True)
verts=[];faces=[];nx,ny=120,32
for j in range(ny+1):
 y=154+j*5
 for i in range(nx+1):
  x=-230+i*5
  envelope=math.sin(min(1,j/ny)*math.pi)**.7
  peaks=14+14*math.sin(x*.018+.6)**2+10*math.sin(x*.039+1.8)**2
  v=noise.fractal(Vector((x*.025,y*.025,1.3)),.8,2.1,4)
  z=max(-.18,envelope*(peaks+v*8)-.3)
  verts.append((x,y,z))
for j in range(ny):
 for i in range(nx):
  a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
mesh=bpy.data.meshes.new('Eroded foothill topography');mesh.from_pydata(verts,[],faces);mesh.update();terrain=bpy.data.objects.new('Oak and dry-grass ridgeline',mesh);scene.collection.objects.link(terrain);mesh.materials.append(lawn);uv_world(terrain)
for p in mesh.polygons:p.use_smooth=True
# Break up the large unbuilt lots with native planting beds and scattered oak groups.
tree_source=next(o for o in scene.objects if o.name.startswith('tree_small_02 placement'))
def tree(x,y,z=0,s=1.8):
 o=tree_source.copy();o.animation_data_clear();scene.collection.objects.link(o);o.location=(x,y,z);o.scale=(s,s,s);o.rotation_euler[2]=random.random()*math.tau
 for child in tree_source.children:
  c=child.copy();c.data=child.data;scene.collection.objects.link(c);c.parent=o
for x in range(-90,165,10):
 for y in [137,151]:tree(x+random.uniform(-4,4),y+random.uniform(-3,3),s=random.uniform(1.8,3.2))
for x,y,sx,sy in [(-55,88,3,36),(-24,64,42,3),(30,92,3,60),(140,92,3,60)]:cube('Gravel landscape bed',(x,y,.08),(sx,sy,.12),gravel,.05)
# Actual floor plates and interior partitions behind thin glazing.
# Separate materials prevent the automotive and solar glass from becoming transparent.
glass=mat('Low-iron architectural glazing','#90aaa7',.085,0)
p=glass.node_tree.nodes.get('Principled BSDF');p.inputs['Transmission Weight'].default_value=0;p.inputs['IOR'].default_value=1.45;p.inputs['Metallic'].default_value=.7;p.inputs['Alpha'].default_value=.38
# Thin glass uses slab approximation in EEVEE with ray-traced reflections.
glass.surface_render_method='BLENDED';glass.use_raytrace_refraction=False
slab=mat('Interior acoustic ceiling','#bdbcb1',.88);partition=mat('Interior warm partitions','#8c9389',.83)
blind=mat('Anodized interior blinds','#b9b5a7',.58,.3)
interiorlight=mat('Office ceiling luminous panel','#f3e5c7',.45);ip=interiorlight.node_tree.nodes.get('Principled BSDF');ip.inputs['Emission Color'].default_value=rgb('#fff0d0');ip.inputs['Emission Strength'].default_value=1.3
# Remove the old solid glass volumes and blinds placed on the facade surface.
for o in list(scene.objects):
 if o.name.startswith(('Campus glazing','Tower core','Campus interior blind','West campus blind')):bpy.data.objects.remove(o,do_unlink=True)
def shell(label,x,y,w,d,h,step):
 for z in [i*step+.25 for i in range(int(h/step)+1)]:
  cube(label+' floor',(x,y,z),(w-.13,d-.13,.15),slab,.015)
  if z+step<h+.5:
   # Recessed office cores and alternating rooms provide real parallax through windows.
   cube(label+' office core',(x,y,z+step/2),(max(1,w-3.4),max(1,d-3.4),step-.2),partition,.04)
   for xx in range(int(-w/2)+2,int(w/2),3):
    for side in [-1,1]:
     if (xx+int(z*10))%3:
      cube(label+' lowered blind',(x+xx,y+side*(d/2-.18),z+step-.6),(2.1,.025,.6+random.random()*.9),blind,.004)
     if (xx+int(z))%4==0:cube(label+' ceiling light',(x+xx,y+side*(d/2-.75),z+step-.15),(1.1,.4,.025),interiorlight,.004)
 for side in [-1,1]:
  cube(label+' front glazing',(x,y+side*d/2,h/2),(w,.018,h),glass,0)
  cube(label+' side glazing',(x+side*w/2,y,h/2),(.018,d,h),glass,0)
for dx,dy,w,d in [(0,15,51,7),(0,-15,51,7),(-22,0,7,25),(22,0,7,25)]:shell('Campus',-24+dx,91+dy,w,d,8,2.7)
for x,y,w,d,h in [(58,83,17,13,24),(84,96,20,15,35),(110,82,16,13,20),(62,112,14,12,17)]:shell('Tower',x,y,w,d,h,3)
# Solar cells have their own dark finish and visible grid, no shared car glazing.
solar=mat('Photovoltaic cells','#19333e',.22,.45)
for o in scene.objects:
 if o.name.startswith('Rooftop solar panel'):
  o.data.materials.clear();o.data.materials.append(solar)
  for dx in [-.97,0,.97]:cube('Solar cell divider',(o.location.x+dx,o.location.y,o.location.z+.033),(.018,3.55,.007),blind,0)
# Correct road-scale surface details: tar repairs, shoulders, and storm drains.
tar=mat('Road tar seams','#252a29',.79)
for y in [37,47,49,59]:cube('Freeway gravel shoulder',(28,y,.1),(240,.55,.08),gravel,0)
for x in range(-75,145,17):
 for y in [42,54]:
  seam=cube('Asphalt repair seam',(x,y,.126),(.026,9.5,.002),tar,0);seam.rotation_euler[2]=random.uniform(-.15,.15)
for x in [-33,-11,10,31]:
 cube('Street drain recess',(x,-13.18,.075),(.6,.4,.018),tar,.01)
 for i in range(7):cube('Drain iron bar',(x-.25+i*.083,-13.18,.09),(.027,.36,.015),bpy.data.materials['Galvanized metal'],.003)
scene.eevee.use_raytracing=True;scene.eevee.taa_render_samples=32
scene.eevee.shadow_ray_count=2;scene.eevee.shadow_step_count=8
scene.eevee.use_fast_gi=False
scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.45
scene.render.resolution_percentage=100
scene.frame_set(216)
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'valley-realism.blend'))
bpy.ops.file.make_paths_relative();bpy.ops.wm.save_as_mainfile(filepath=str(ART/'valley-realism.blend'))
print('MATERIAL PASS BUILT',len(scene.objects),flush=True)
if '--stills' in sys.argv:
 for i in [1,2,5]:
  scene.frame_set(i*144+72);scene.render.filepath=str(ART/f'shot-{i+1}.png');bpy.ops.render.render(write_still=True)
