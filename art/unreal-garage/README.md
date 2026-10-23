# Unreal garage cinematic

Six-second, 1920 × 1080, 24 fps camera dolly rendered in Unreal Engine 5.8.2 with Lumen, using the existing original garage set and credited CC0 Poly Haven assets. This is a local standalone clip; it does not replace the deployed intro. Silent master for later sound editing.

Recipe:
1. Blender runs `scripts/unreal/export_garage.py`, using `art/realism-test/garage.blend`.
2. Open `ValleyGarage/ValleyGarage.uproject` with `-ExecutePythonScript=<absolute scripts/unreal/build_garage.py>` to import and create `/Game/Garage` and `/Game/GarageDollyV2`.
3. Run the project with `-ExecCmds="py <absolute scripts/unreal/render_garage.py>"`. Use ExecCmds for rendering: ExecutePythonScript exits as soon as the asynchronous queue starts. A local `preview.mode` file switches to a single preview frame.
4. Blender runs `scripts/unreal/encode_garage.py` to encode 144 completed PNGs to `public/intro/realism/unreal-garage.mp4`.

Camera: 28 mm, f/5.6, manual focus, exposure compensation 8.6. Four spatial samples per frame, 60 engine warmup frames, 16 render warmup frames. Imported textures must be saved after compression/color-space changes. The level is saved before creating possessable camera bindings so those bindings survive reopening the map.

Large generated Unreal assets, FBX, textures and intermediate frames stay local. Source licenses: `../garage-proof/asset-manifest.json` and `../material-study/asset-manifest.json`. Apple Metal Toolchain is required; installed with `xcodebuild -downloadComponent MetalToolchain`.
