# The Valley — original opening film

36 seconds · 1920 × 1080 · 24 fps · 864 frames. Original architectural miniature and startup satire inspired by Silicon Valley culture. No television footage, logos, or soundtrack samples.

## The edit

| Time | Chapter | Motion |
| --- | --- | --- |
| 0–6 | The peninsula | Aerial dolly and freeway commuters |
| 6–12 | The campus | Courtyard approach and Hollow monument |
| 12–18 | The next big thing | Tower reveal and slewing construction crane |
| 18–24 | The neighborhood | Descent toward the garage |
| 24–30 | Your headquarters | Approved six-second Cycles garage dolly |
| 30–36 | The first commit | Workbench close-up with shallow focus |

The in-game HTML titles supply the satirical narration; the native video is silent. The game supplies its original synthesized music. The standalone review player is intentionally silent.

## Reproduce from the repository root

Blender 4.5 LTS is installed at `/Applications/Blender.app`. The scripts find the project relative to their own file, so moving the whole repository is supported.

1. Follow `../garage-proof/README.md` to download the credited assets and build the garage source. Render its 144 frames to retain the approved Cycles chapter.
2. Build the expanded set and inspect representative cameras:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --disable-autoexec --python scripts/film/build_valley.py -- --stills
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --disable-autoexec --python scripts/film/refine_valley.py -- --stills
```

3. Render and automatically encode the complete edit:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --disable-autoexec --python scripts/film/render_valley.py
```

The renderer reuses the 144 approved garage frames and resumes existing full-film PNGs. **After changing a scene or camera, remove the affected chapter’s frames before rerendering.** The encoder asserts that all 864 frames exist. It uses Blender’s bundled FFmpeg, so a separate encoder install is unnecessary. To encode again without rerendering, run `scripts/film/encode_valley.py` through Blender.

`build_valley.py` starts from the garage source. Always run the refinement step after it. Rerunning refinement alone adds duplicate detailing, so rebuild from the clean base before applying it again.

## Files

- `valley-film.blend`: local editable world with six camera timeline markers and relative texture paths.
- `edit.json`: chapter schedule and output dimensions.
- `render-manifest.json`: completed render and encoded file size.
- `frames/`: local render intermediates, ignored by Git.
- `../../public/intro/realism/valley-intro.mp4`: complete web movie.
- `../../public/intro/realism/valley-intro-poster.jpg`: actual garage still.
- `../../public/intro/realism/index.html`: standalone native video review.

The playable office props are independently reproducible with `scripts/film/build_game_assets.py`. Its editable scene and manifest live in `../game-assets/`.

## Credits

Original architecture, props, camera work, animation, and synthesized music by this project. Selected scanned materials, HDR environment, furniture, and foliage: [Poly Haven](https://polyhaven.com), CC0. Exact source URLs, authors and file hashes: `../garage-proof/asset-manifest.json`. Web texture derivatives: `../../public/textures/office/credits.json`.
