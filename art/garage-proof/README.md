# Garage realism proof

A six-second, 1080p/24 fps camera move rendered in Blender Cycles. This establishes the material, lighting, and architectural direction before replacing the remaining real-time intro shots. It is an original scene inspired by suburban Silicon Valley startup culture; no footage or soundtrack from the show is used. The proof is silent.

## Tools and source

- Blender 4.5.13 LTS, installed at `/Applications/Blender.app` on this workstation.
- Metal rendering on the detected Apple M5 Max GPU.
- `scripts/film/fetch_assets.py` downloads only the selected assets and verifies their MD5 integrity hashes from the source API. Approximately 132 MB of CC0 source assets are required. Source links, authors, resolutions, and hashes are recorded in `asset-manifest.json`.
- `scripts/film/render_garage.py` builds the original set, places the source assets, saves an editable `.blend`, and renders the still or frame sequence.
- `scripts/film/encode_garage.py` checks for all 144 consecutive frames and encodes H.264 with Blender's bundled FFmpeg. No separate FFmpeg install is required.

Powered by [Poly Haven](https://polyhaven.com). Its models, textures and HDRI assets are [CC0](https://polyhaven.com/license). The rendering scripts and architecture are original project work.

## Reproduce

From the repository root:

```sh
python3 scripts/film/fetch_assets.py
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --disable-autoexec --python scripts/film/render_garage.py -- --still
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --disable-autoexec --python scripts/film/render_garage.py -- --start 1 --end 144
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --disable-autoexec --python scripts/film/encode_garage.py
```

Use `--still --draft` for a faster 720p lighting check. Source downloads, the editable Blender file, logs, and PNG frame intermediates are ignored by Git. Keep the manifest and scripts to reproduce them. The `.blend` uses relative references to the downloaded `assets/` directory. Move the whole project together, including that directory, to preserve the editable scene. If the assets are omitted, rerun the downloader before opening the scene. The scripts locate the project from their own paths and support relocation.

## Outputs

- `public/intro/realism/index.html`: accessible review page with native video controls and reduced-motion handling
- `public/intro/realism/garage-proof.mp4`: finished six-second proof
- `public/intro/realism/garage-proof-poster.png`: full-size representative frame
- `art/garage-proof/garage-proof.blend`: local editable source scene
- `art/garage-proof/render-manifest.json`: encoded duration and format

The approved garage dolly is now chapter five of the full 36-second opening. The original proof movie remains available independently; see `../valley-film/README.md` for the full film pipeline.
