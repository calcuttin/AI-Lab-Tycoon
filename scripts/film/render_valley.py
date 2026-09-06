"""Resume the 864-frame edit, reuse the approved Cycles chapter, then encode."""
import bpy,pathlib,shutil,json,runpy
ROOT=pathlib.Path(__file__).resolve().parents[2];ART=ROOT/'art/valley-film';FRAMES=ART/'frames'
bpy.ops.wm.open_mainfile(filepath=str(ART/'valley-film.blend'));scene=bpy.context.scene
scene.render.resolution_percentage=100;scene.render.filepath=str(FRAMES/'frame-')
# Preserve the exact approved garage dolly rather than rerendering it in EEVEE.
for i in range(1,145):
 source=ROOT/'art/garage-proof/frames'/f'frame-{i:04d}.png'
 target=FRAMES/f'frame-{576+i:04d}.png'
 if source.exists() and not target.exists():shutil.copy2(source,target)
for frame in range(1,865):
 target=FRAMES/f'frame-{frame:04d}.png'
 if target.exists() and target.stat().st_size>1000:continue
 scene.frame_set(frame);scene.eevee.taa_render_samples=32 if frame>720 else 16
 scene.render.filepath=str(target);bpy.ops.render.render(write_still=True)
 if frame%24==0:print('FILM PROGRESS',frame,'/ 864',flush=True)
print('ALL FRAMES COMPLETE',flush=True)
runpy.run_path(str(ROOT/'scripts/film/encode_valley.py'),run_name='__main__')
