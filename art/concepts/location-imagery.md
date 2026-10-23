# Location imagery — September 8, 2026

Generated with the built-in image tool. The tool does not expose a model selector; GPT Image 2.5 is not verified. Garage source prompt: garage-image-v1.md. The garage served as a lighting and photographic-material reference for both new scenes.

## Sources and app copies

- garage-image-v1.png → public/images/locations/garage-{640,1600}.jpg
- house-image-v1.png → public/images/locations/house-{640,1600}.jpg
- office-image-v1.png → public/images/locations/office-{640,1600}.jpg

App JPEGs use quality 78, maintaining source aspect ratio, and responsive selection. Title artwork requests enough resolution for a cover crop on tall viewports. Other imagery loads lazily. Originals stay in this directory.

## House generation brief

Landscape 16:9 photorealistic Palo Alto living/dining room converted into a startup workspace, matching the garage reference's afternoon lighting and material realism. Four realistically spaced desks, former dining table, domestic kitchen through doorway, worn couch, scuffed hardwood, notebooks, cables, plants. Whiteboard: “SERIES A. STILL ONE BATHROOM.” No people, logos, collage, borders, or UI.

The resulting house uses a shared table and side desks; a small logo-like mark appears on a laptop. It is atmospheric artwork, not a furniture layout specification.

## Office generation prompt

Use case: photorealistic-natural
Asset type: landscape 16:9 full-bleed web expansion imagery for AI Lab Tycoon.
Primary request: Create exactly one entirely new documentary architectural photograph of a modest funded startup's leased Silicon Valley office.
Input images: Image 1 is a photographic realism and California daylight reference only. Preserve its natural material texture, photographic credibility, warmth, and small imperfections. Create a NEW office, not the garage, and do not copy its composition or text.
Scene: A modest practical leased office with exactly six work desks, clearly spaced in two groups of three with broad believable aisles between them. Each desk has a mesh task chair, ordinary monitor and keyboard, understated cables and occasional coffee cups. A glass meeting room at the back with a small meeting table and a clearly visible wall-mounted whiteboard. Standard suspended acoustic ceiling tiles. Broad exterior windows reveal mature California trees.
Style and materials: genuine interior photograph, credible proportions, natural perspective, lightly worn commercial carpet with visible fibers and footfall marks, practical laminate desks, subtle wall scuffs, imperfect cable routing. Lived-in small startup realism. Avoid polished CGI.
Composition: Landscape 16:9, full-bleed, eye-level architectural wide shot showing six desks and clear circulation, no extreme ultra-wide distortion.
Lighting: Warm California afternoon daylight coming through broad windows, balanced natural shadow detail, realistic glass reflections.
Text verbatim: In the meeting room, the whiteboard has legible naturally handwritten black-marker text "PROFITABILITY: NEXT QUARTER".
Constraints: No people, no logos, no watermark, no collage, no montage, no borders, no overlay UI, no futuristic equipment, no extravagant corporate palace.

## Integration

Garage: title-menu backdrop and welcome panel. House: first expansion card and lease dialog. Office: later commercial expansion cards and lease dialogs, including shared artwork for headquarters/campus until distinct imagery is commissioned. Gameplay geometry, film playback and save logic are unchanged. Artwork is decorative and is accompanied by existing location names, descriptions and actual game statistics.

Validation: production build, 91 existing tests, and browser inspection of title, welcome, house lease and office lease screens on the separate port 5174 preview. No browser console errors observed. No deployment performed.
