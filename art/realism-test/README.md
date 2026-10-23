# Two-shot realism test

Local Blender study of the campus frontage and founder garage. The released intro, production assets, and game saves are untouched.

Each pair uses the same 1600 × 1000 camera framing. The **before** image renders the released scene in EEVEE; the **after** image combines Cycles with additional geometry, placement corrections, and lighting changes. This is a production-direction comparison, not an isolated benchmark of the render engines. The cameras are new study cameras, not frames taken from the existing edit.

The street study adds a six-metre access street, jointed sidewalks, curbs, crossing, repair seams, drains, planters and bench. Architectural glass uses transmission and physical thickness, with separate frame members around the doors. The garage study corrects desk orientation and accessory placement, adds joists and services, and replaces graphic screen bars with small editor text and marker-style whiteboard lettering. Cycles uses 160 maximum samples, adaptive sampling, denoising, and the local Metal GPU where available.

Existing scanned materials, furniture, foliage and the photographed environment are reused under their recorded CC0 licenses. See `../garage-proof/asset-manifest.json` and `../material-study/asset-manifest.json`. Menlo and Marker Felt are loaded from macOS only when present for rendered lettering; font files are not distributed.

## Reproduce

From the repository root, after building `../material-study/valley-realism.blend`:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --disable-autoexec --python scripts/film/test_realism.py
```

Pass `-- street` or `-- garage` to rerender a single pair. The script always starts from the released source and does not accumulate edits. Each `.blend` remains editable; PNGs and Blender intermediates are ignored by Git. `render-manifest.json` records settings and timing. These are two still-frame tests; animation stability and full-film render cost have not been validated.

The four-item `review-manifest.json` can be opened with the Creative Production shared review renderer using `review-options.json`. The rendered local review is at `/art/realism-test/review-board.html` while Vite is running. Click an image to inspect the original.
