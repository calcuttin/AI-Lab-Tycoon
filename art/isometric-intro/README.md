# Isometric Valley opening

An original twelve-second miniature-city animation, rendered in Blender at 1600 × 900 and 24 fps. Visual reference: [yU+co's Silicon Valley title sequence](https://www.yuco.com/works/silicon-valley), especially its orthographic city composition, dense technology-company signage and accelerated growth/collapse. Fictional companies, geometry and animation were authored for this game; no show footage or theme recording is used.

The opening features a continuous camera move, building growth, one speculative tower collapse and rebuild, moving commuter cars, rotating cranes and a small founder garage. It is a first isometric production pass, with room for more bespoke landmark architecture and background gags.

## Rebuild

1. Run Blender in background mode with `scripts/film/build_isometric.py -- --preview`. Inspect `art/isometric-intro/preview.png`.
2. Run Blender in background mode with `scripts/film/render_isometric.py`. It loads the saved approved scene, renders 288 PNG frames and encodes the H.264 movie using Blender's bundled encoder.
3. Outputs: `public/intro/realism/isometric-intro.mp4` and `isometric-intro-poster.jpg`. Generated Blender scenes and frame caches stay out of Git; scripts and metadata preserve the recipe.

The render reuses existing intermediate frames. After changing the scene, render to a fresh frame directory or explicitly clear only the old generated sequence before rerendering.

## App integration

The twelve-second isometric movie is preserved as an optional opening. Its native media clock drives the six navigation markers at two-second intervals, with a title reveal in the last three seconds. Pause, seek, skip and audio controls stay available. Reduced-motion and skip preferences enter the still title menu directly. Watch isometric film selects this movie; Replay intro selects the default cinematic stills, and Watch original film retains the earlier Blender edit.

The generated photographic images remain in welcome and building-expansion views. This local change does not deploy the app.
