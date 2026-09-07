"""Encode the complete Blender edit using bundled FFmpeg; no external encoder."""
import bpy,pathlib,json
ROOT=pathlib.Path(__file__).resolve().parents[2]
ART=pathlib.Path(globals().get('FILM_ART', ROOT/'art/valley-film'))
OUT=pathlib.Path(globals().get('OUTPUT_DIR', ROOT/'public/intro/realism'));OUT.mkdir(parents=True,exist_ok=True)
files=[ART/'frames'/f'frame-{i:04d}.png' for i in range(1,865)]
assert all(p.exists() and p.stat().st_size>1000 for p in files),'Film frame sequence incomplete'
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
scene.sequence_editor_create();strip=scene.sequence_editor.strips.new_image('Original Valley film',str(files[0]),channel=1,frame_start=1)
for f in files[1:]:strip.elements.append(f.name)
scene.frame_start=1;scene.frame_end=864;scene.render.fps=24
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='FFMPEG';scene.render.ffmpeg.format='MPEG4';scene.render.ffmpeg.codec='H264';scene.render.ffmpeg.constant_rate_factor='MEDIUM';scene.render.ffmpeg.ffmpeg_preset='GOOD'
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0
scene.render.ffmpeg.gopsize=48
scene.render.use_sequencer=True;scene.render.filepath=str(OUT/'valley-intro.mp4')
bpy.ops.render.render(animation=True)
# Film poster is the actual photographed garage frame, sized for quick loading.
image=bpy.data.images.load(str(files[647]));image.scale(1600,900);image.filepath_raw=str(OUT/'valley-intro-poster.jpg');image.file_format='JPEG';image.save()
manifest=json.loads((ART/'edit.json').read_text());manifest.update({'video':'public/intro/realism/valley-intro.mp4','bytes':(OUT/'valley-intro.mp4').stat().st_size,'rendererVersion':bpy.app.version_string})
(ART/'render-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('FULL FILM ENCODED',manifest,flush=True)
