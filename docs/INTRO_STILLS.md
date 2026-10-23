# Cinematic still intro

The default 36-second still opening uses six generated photographic environments with subtle camera drift, one-second dissolves, existing chapter titles and the original score. **Replay intro** plays this sequence. **Watch isometric film** selects the twelve-second miniature-city animation; **Watch original film** selects the earlier thirty-six-second Blender edit. All iterations remain available; see [the iteration catalog](INTRO_ITERATIONS.md).

## Sequence and imagery

1. Peninsula — freeway commuters and golden California foothills.
2. Campus — the fictional Hollow campus under mature oaks.
3. Headquarters — glass offices, new construction and scarce parking.
4. Neighborhood — a modest bungalow and detached startup garage.
5. Garage — borrowed desks and six weeks of runway.
6. Workbench — the first commit, notebook and coffee rings.

Original PNGs are in `art/concepts/*-image-v1.png`. Web JPEGs are in `public/images/locations/`, with 1600px intro versions and 640px card alternatives. The six intro images total approximately 2.8 MB. Smaller sizes serve expansion cards. Every office tier now has distinct imagery: garage, house, office, headquarters, campus.

Image generation used the built-in tool. Model selection is unavailable, so the requested GPT Image 2.5 version is not verified. Garage and location notes plus `neighborhood-prompts.json`, `commercial-prompts.json` and `workbench-prompt.txt` in `art/concepts/` retain generation briefs/prompts and provenance. These are fictional atmospheric images, not exact renderings of the interactive floor plans.

## Behavior

- Pause, resume, skip, chapter seeking and mute remain available.
- The presentation waits for the first image. Later image errors use the garage as a visual fallback. A first-image failure exposes the playable title menu and retry.
- Hidden tabs pause the clock and music; only an opening that was playing resumes.
- Reduced-motion and skip-intro preferences go directly to the still title screen, without starting the clock or loading the video. Explicit replay is allowed; reduced-motion CSS disables camera movement.
- Each replay creates a fresh player, including after a failed image load. Timers/listeners are cleaned up on exit.
- The original game save and simulation systems are unchanged.

## Implementation

`StillIntroPlayer.ts` owns the presentation clock and first-image readiness. `StillIntroStage.tsx` composites six images using the shared `shots.ts` timeline. `IntroScreen.tsx` retains the controls and chooses stills or the optional video. `LocationArtwork.tsx` maps building tiers to responsive location images.

Validation includes clock/readiness/visibility/teardown tests, intro controls and video switching, plus browser inspection of the imagery and image-load status. No production deployment is included in this change.
