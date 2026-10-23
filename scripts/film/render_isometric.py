"""Render the approved saved isometric scene and encode a 12-second H.264 movie."""
import bpy, pathlib, json, subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2]
ART=ROOT/'art/isometric-intro'; FRAMES=ART/'frames'; OUT=ROOT/'public/intro/realism'
bpy.ops.wm.open_mainfile(filepath=str(ART/'isometric-intro.blend'))
s=bpy.context.scene
s.render.resolution_percentage=100
for frame in range(1,289):
 file=FRAMES/f'frame-{frame:04d}.png'
 if file.exists():continue
 s.frame_set(frame);s.render.filepath=str(file);bpy.ops.render.render(write_still=True)
 if frame%24==0:print('ISOMETRIC PROGRESS',frame,'/ 288',flush=True)
bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene;s.sequence_editor_create()
files=[FRAMES/f'frame-{f:04d}.png' for f in range(1,289)]
strip=s.sequence_editor.strips.new_image('Isometric Valley',str(files[0]),channel=1,frame_start=1)
for f in files[1:]:strip.elements.append(f.name)
s.frame_start=1;s.frame_end=288;s.render.fps=24;s.render.resolution_x=1600;s.render.resolution_y=900;s.render.resolution_percentage=100
s.view_settings.view_transform='Standard';s.view_settings.look='None';s.render.use_sequencer=True
s.render.image_settings.file_format='FFMPEG';s.render.ffmpeg.format='MPEG4';s.render.ffmpeg.codec='H264';s.render.ffmpeg.constant_rate_factor='HIGH'
s.render.filepath=str(OUT/'isometric-intro.mp4');bpy.ops.render.render(animation=True)
subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', str(files[179]), '--out', str(OUT/'isometric-intro-poster.jpg')], check=True, stdout=subprocess.DEVNULL)
(ART/'manifest.json').write_text(json.dumps({'duration':12,'fps':24,'frames':288,'width':1600,'height':900,'video':'public/intro/realism/isometric-intro.mp4','reference':'https://www.yuco.com/works/silicon-valley','description':'Original fictional isometric city, rising companies, commuters, cranes and founder garage.'},indent=2))
print('ISOMETRIC VIDEO READY',flush=True)
