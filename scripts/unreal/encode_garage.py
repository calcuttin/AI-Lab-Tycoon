import bpy,pathlib,json
ROOT=pathlib.Path(__file__).resolve().parents[2];ART=ROOT/'art/unreal-garage';files=sorted((ART/'frames').glob('garage-*.png'));assert len(files)==144,len(files)
assert [p.stem for p in files]==[f'garage-{i:04}' for i in range(144)]
s=bpy.context.scene;s.sequence_editor_create();strip=s.sequence_editor.strips.new_image('Unreal garage',str(files[0]),channel=1,frame_start=1)
for f in files[1:]:strip.elements.append(f.name)
s.frame_start=1;s.frame_end=144;s.render.fps=24;s.render.resolution_x=1920;s.render.resolution_y=1080;s.render.resolution_percentage=100
s.view_settings.view_transform='Standard';s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1;s.render.use_sequencer=True
s.render.image_settings.file_format='FFMPEG';s.render.ffmpeg.format='MPEG4';s.render.ffmpeg.codec='H264';s.render.ffmpeg.constant_rate_factor='HIGH';s.render.ffmpeg.ffmpeg_preset='GOOD'
out=ROOT/'public/intro/realism/unreal-garage.mp4';s.render.filepath=str(out);bpy.ops.render.render(animation=True)
(ART/'video-manifest.json').write_text(json.dumps({'engine':'Unreal Engine 5.8.2','lighting':'Lumen','durationSeconds':6,'fps':24,'width':1920,'height':1080,'bytes':out.stat().st_size,'video':'public/intro/realism/unreal-garage.mp4'},indent=2))
print('VIDEO READY',out,flush=True)
