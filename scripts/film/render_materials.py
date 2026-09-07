"""Resume the refined film, preserving the approved Cycles garage chapter.
Encode into staging and replace the app's movie only after all frames succeed.
"""
import bpy,pathlib,json,shutil,runpy,os
ROOT=pathlib.Path(__file__).resolve().parents[2];ART=ROOT/'art/material-study';FRAMES=ART/'frames';FRAMES.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ART/'valley-realism.blend'));scene=bpy.context.scene
m=bpy.data.materials['Low-iron architectural glazing'];p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.278894,.401978,.386429,1);p.inputs['Alpha'].default_value=.38
scene.eevee.shadow_ray_count=2
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'valley-realism.blend'))
for i in range(1,145):
 target=FRAMES/f'frame-{576+i:04d}.png'
 if not target.exists():shutil.copy2(ROOT/'art/garage-proof/frames'/f'frame-{i:04d}.png',target)
for frame in range(1,865):
 target=FRAMES/f'frame-{frame:04d}.png'
 if target.exists() and target.stat().st_size>1000:continue
 scene.frame_set(frame);scene.eevee.taa_render_samples=32 if frame>720 else 16
 scene.render.filepath=str(target);bpy.ops.render.render(write_still=True)
 if frame%24==0:print('MATERIAL FILM PROGRESS',frame,'/ 864',flush=True)
edit=json.loads((ROOT/'art/valley-film/edit.json').read_text());edit['materialPass']='Scanned pavement and wood; layered architectural glass; irregular dry-season terrain';edit['source']='art/material-study/valley-realism.blend'
(ART/'edit.json').write_text(json.dumps(edit,indent=2)+'\n')
runpy.run_path(str(ROOT/'scripts/film/encode_valley.py'),init_globals={'FILM_ART':ART,'OUTPUT_DIR':ART/'encoded'},run_name='__main__')
for name in ['valley-intro.mp4','valley-intro-poster.jpg']:
 os.replace(ART/'encoded'/name,ROOT/'public/intro/realism'/name)
print('REFINED FILM INSTALLED',flush=True)
