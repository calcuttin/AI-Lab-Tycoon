# Original staff portraits

One hundred fictional adult staff portraits generated with the built-in image generation tool. Exact prompts and versioned full-resolution PNGs are retained in this directory and indexed in `manifest.json`. No model-version selector was exposed. Existing character artwork remains untouched.

Every portrait is a single editorial photograph with a baked-in Bay Area startup interior: warm window daylight, softly blurred garage, bungalow, or small office behind the person. Staff 51–100 keep the candid coder wardrobe (hoodies, flannel, thrift jackets, headphones, bike-commute wear) from the second wave, but they are no longer chroma-key cutouts.

Portraits are not tied to job roles, skills, names, or personality traits.

Web copies are in `public/images/staff/` as JPEG 320 and 640. The shared EmployeePortrait component appears in recruiting, staff cards, project team selection, and training.

New candidates store an optional `portraitId`, choosing from all 100 faces and favoring those least represented on the current team. The previous candidate is counted during next-candidate selection to avoid immediate repetition. Once all 100 faces are represented, the finite pool is reused. Existing employees without the field retain the original nine-face hash mapping of their ID. Preserve the initial nine-entry legacy pool when expanding the library. Known story character portraits take precedence. Failed images fall back to initials.

The isolated preview is available at `http://127.0.0.1:5173/?garage-study=1#staff` and does not access saved games.
