# Preserved intro iterations

Current choice: **cinematic stills**. Switching the default does not remove or overwrite any film, generated image, source scene or build script.

| Iteration | Access | Source / recipe |
| --- | --- | --- |
| Cinematic stills, 36 seconds | Default opening and Replay intro | `art/concepts/`, `src/intro/cinematic/StillIntroStage.tsx`, `docs/INTRO_STILLS.md` |
| Isometric city, 12 seconds | Watch isometric film; `/intro/realism/isometric-intro.mp4` | `art/isometric-intro/`, `scripts/film/build_isometric.py`, `scripts/film/render_isometric.py` |
| Original Blender film, 36 seconds | Watch original film; `/intro/realism/valley-intro.mp4` | `art/valley-film/`, `scripts/film/build_valley.py`, `scripts/film/render_valley.py` |
| Unreal garage study, 6 seconds | Standalone `/intro/realism/unreal-garage.mp4` | `art/unreal-garage/`, `scripts/unreal/` |
| Earlier garage/material studies | Local review assets in `art/garage-proof/`, `art/material-study/`, `art/realism-test/` | Their existing manifests and `scripts/film/` recipes |

The full-resolution generated image originals, optimized app copies, movie files and local Blender/Unreal project files are retained. `art/intro-iterations.json` records the sizes and SHA-256 hashes of the primary films, generated originals and principal project/scene files verified when stills were restored.

Preservation is local: generated scene caches and frame sequences remain ignored by Git. This catalog is not an off-machine backup or a claim that uncommitted assets have been pushed. Keep the large authoring files when copying or backing up this project. Use new filenames/directories for future visual experiments.
