# Materials and building progression

The playable office uses physically spaced metre-scale props and distinct architecture for Founder Garage, Incubator House, Startup Office, Company Headquarters, and Tech Campus. IDs and upgrade economics remain compatible with existing saves.

The new shared maps add worn desk timber, actual oak floorboards, leather grain, cloth weave, and higher-resolution concrete/plaster. Cloth uses the scan's normal and roughness maps with a solid dyed color; the source's red gingham albedo is intentionally omitted from the web bundle. Glass windows are openings in the wall mesh. The scene adds soft contact shading on supported desktop WebGL contexts, with a simpler render path on small screens. Scanned shrubs share one 512px-textured GLB.

Floorplans allocate the actual capacity once across workstation bays. Desk/chair footprints have 2.15m lateral and 2.9m row pitches, with 1.2m between furnishing bays. Carried upgrades receive real additional space. House room trim and office partitions remain within their bays. Decorative lounges are placed only in proven free rectangles; they supply no gameplay bonuses.

## Review

Run Vite and open `http://127.0.0.1:5173/?office-study=1` to compare all five buildings, daylight/evening, full occupancy, maximum upgrades, and close-up furniture views. This development-only route uses isolated fixtures and does not access the saved company. Its module is excluded from production. The normal game is at `/`.

## Reproduce

Start with the garage/film sources documented in `../garage-proof/README.md` and `../valley-film/README.md`.

```sh
python3 scripts/film/fetch_realism_assets.py
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --disable-autoexec --python scripts/film/export_material_maps.py
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --disable-autoexec --python scripts/film/export_garden.py
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --disable-autoexec --python scripts/film/refine_materials.py -- --stills
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --disable-autoexec --python scripts/film/render_materials.py
```

The film refinement always starts from `../valley-film/valley-film.blend`, preserving all cameras and animated objects. It adds scanned asphalt, gravel and cedar; fine surface finishes; actual floor plates, recessed interior partitions and transparent facade layers; and a continuous irregular foothill mesh with additional oak planting. Thin facade glass uses an alpha-blended reflection approximation to avoid EEVEE's noisy stacked transmission. The exact Cycles garage chapter is retained.

The renderer resumes `frames/`; after editing the scene, move or remove affected frames before rerendering. All 864 frames must exist before encoding. Encoding occurs in `encoded/`, and only the completed output replaces the local app movie. `render-manifest.json` records the completed output. Scene files, source textures, and frame intermediates are ignored by Git; recipes, source hashes, optimized web assets, and manifests are tracked.

Original modeling and layout by this project. Scans are CC0 from [Poly Haven](https://polyhaven.com); exact source URLs, authors, MD5 hashes, and byte counts are in `asset-manifest.json`, `../garage-proof/asset-manifest.json`, `../game-assets/garden-manifest.json`, and `../../public/textures/office/credits.json`.
