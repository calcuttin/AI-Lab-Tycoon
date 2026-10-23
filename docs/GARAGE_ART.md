# Illustrated garage and core portraits

The founder garage defaults to the illustrated view, using the retained `garage-image-v1` artwork. Three numbered controls select the existing `main_work`, `corner_1` and `closet` furnishing slots. Their labels reflect installed upgrades; selection uses the existing inspector and never buys an item. The neighboring **3D layout** switch retains the previous interactive scene. Later building tiers use their existing 3D scenes as the overview; selecting an installed furnishing opens its photographic inspection.

Ambient light, working-monitor glow and coffee steam are layered over the illustration. Monitor glow requires an assigned worker; steam requires a coffee corner or full kitchen. Animation follows pause, game speed and tab visibility, and respects reduced motion. The illustration is atmospheric rather than a literal depiction of every installed furniture item; use the 3D view to inspect their spatial layout. A failed backdrop does not disable the area controls.

The named story cast now has original portraits: mentor Erik Bachmann, investor Monica Hall, architect Bertram Gilfoyle, COO Donald "OJ" Jared, lead developer Dinesh Chugtai, rival Gavin Belson, and billionaire Russ Hanneman. Faces appear in mentor cards, matching story events and named employee identities. Recruited staff now use the original 50-person portrait pool documented in `art/staff/README.md`, with persistent assignments and initials as an image-error fallback. Full-resolution sources and exact prompts are in `art/characters/`; web copies are 320px JPEGs. Existing films, generated locations and 3D source assets are retained.

`?garage-study=1` provides a development-only isolated visual preview with fixture staff and furnishings. It does not import the game store or access saved companies. It is excluded from the production app.

Validation: 112 tests passed, including real-slot selection, unchanged cash on selection, view switching, pause/visibility behavior, backdrop failure, later-office 3D behavior and portrait fallback. Browser checks covered the illustrated scene, character imagery, area selection and compact touch targets. No deployment is included.

## Area inspections

Selecting a garage slot opens a dedicated photograph of the desks, coffee corner, or storage shelves. The game inspector remains connected to that slot for furnishing actions. Quick navigation switches areas; Back to garage or Escape restores the overview and keyboard focus. Missing close-up images fall back to a message without disabling navigation or furnishing. Reduced motion disables the photo entrance animation.

Original artwork and exact prompts are retained in `art/garage-details/`; responsive JPEGs are in `public/images/garage-details/`. Installed furnishings now select their upgrade-specific photo. Levels of the same furnishing share one photo; the current name, description, and level are displayed separately. Browser review covered all three photographs, area switching, and return focus. Tests also cover error recovery, Escape, and unchanged cash during inspection. TypeScript, changed-file lint, and production build passed.

## All upgrades

All 21 upgrade types now have distinct photography, including desks, amenities, infrastructure, wellness, executive spaces, and utility closets. Eighteen new originals and exact prompts are preserved in `art/upgrades/`, with a provenance manifest. The three original garage close-ups cover basic desks, coffee, and storage. `src/data/upgradeArtwork.ts` maps the complete catalog.

Uninstalled options have clickable photo previews; installed upgrades open their current photo. The showroom allows browsing all upgrades with price, level count, and earliest compatible building, without writing to the game store. The isolated development study includes the complete photo gallery. Error fallbacks retain furnishing controls and recover when switching upgrades.

Validation: 112 tests passed, including photo changes after installation, live level labels, read-only catalog browsing, all-upgrade coverage, image-error recovery, and later-building inspection/return. Browser checks covered the gallery, showroom, and a 390px viewport without horizontal overflow. No deployment included.

## Staff portraits

One hundred original adult portraits now cover recruiting, employee cards, project team selection, and training. New hires store portrait IDs; existing saves resolve stable portraits without a migration. The development preview includes a staff gallery at `#staff`. Sources, exact prompts, and the manifest are preserved in `art/staff/`.

The hiring pool contains 100 original faces (the first nine plus later expansions). Every portrait is a full editorial photograph with a baked-in Bay Area interior, matching the original Codex staff look. Legacy employees without a portrait ID retain the initial nine-face fallback. Tests cover unique selections before reuse and persistence through hiring and save/load.

## Event photographs

Story events that already exist in `src/data/events.ts` now have 16:9 stills where a photograph helps the gag, plus garage-era incidents and a larger hacker-hostel deck (ragers, webcam leaks, jacuzzi board meetings, implied adult-livestream bandwidth, a sleazy intern model). Tone runs PG-13 to R in copy and photography: parties, drinking, innuendo, no explicit sex or nudity. Sources and prompts live in `art/events/`. The event modal shows the still when one exists; missing images keep the original text choices. Preview the set at `?garage-study=1#events`.
