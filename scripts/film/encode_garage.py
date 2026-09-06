"""Encode the rendered PNG sequence as H.264 using Blender's bundled FFmpeg."""
import bpy, pathlib, json, sys
ROOT=pathlib.Path(__file__).resolve().parents[2]
FRAMES=ROOT/'art/garage-proof/frames'
check='--check' in sys.argv
expected=24 if check else 144
OUTPUT=pathlib.Path('/tmp/tycoon-encoder-check.mp4') if check else ROOT/'public/intro/realism/garage-proof.mp4'
files=sorted(FRAMES.glob('frame-*.png'))
if check:files=files[:expected]
assert len(files)==expected, f'Expected {expected} frames, found {len(files)}'
assert [f.name for f in files]==[f'frame-{i:04d}.png' for i in range(1,expected+1)], 'Non-consecutive frame sequence'
scene=bpy.context.scene
scene.sequence_editor_create()
strips=scene.sequence_editor.strips
strip=strips.new_image('Garage proof',str(files[0]),channel=1,frame_start=1)
for f in files[1:]:strip.elements.append(f.name)
scene.frame_start=1;scene.frame_end=expected;scene.render.fps=24
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='FFMPEG';scene.render.ffmpeg.format='MPEG4';scene.render.ffmpeg.codec='H264';scene.render.ffmpeg.constant_rate_factor='HIGH';scene.render.ffmpeg.ffmpeg_preset='GOOD'
# PNGs are already display-referred; do not apply AgX to them a second time.
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0;scene.view_settings.gamma=1
scene.render.use_sequencer=True;scene.render.filepath=str(OUTPUT)
bpy.ops.render.render(animation=True)
print('ENCODED',OUTPUT,OUTPUT.stat().st_size,flush=True)
if not check:(ROOT/'art/garage-proof/render-manifest.json').write_text(json.dumps({'renderer':bpy.app.version_string,'engine':'Cycles / Metal','width':1920,'height':1080,'fps':24,'frames':144,'durationSeconds':6,'video':str(OUTPUT.relative_to(ROOT))},indent=2)+'\n')
