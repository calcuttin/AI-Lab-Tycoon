# Founder workspace UI

The game remains a satire inspired by HBO’s *Silicon Valley*: a garage startup, outsized egos, venture-capital incentives, and the gap between a world-changing pitch and a working product. Keep operational labels clear; put the jokes in descriptions, empty states, mentor advice, and story events.

## Interface

`src/index.css` defines the shared charcoal, sage, and lime palette, typography, borders, spacing, focus states, and responsive layouts. `src/components/ui` contains the button, badge, page-heading, native dialog, and SVG icon components. Native dialogs trap focus, restore it on close, and own keyboard input. Forced event choices cannot be dismissed without a choice.

Headquarters is the default view. Financial metrics, the interactive office, active projects, and Erik’s unsolicited advice share one screen. Cash and monthly overhead come from the store; the overhead coverage estimate is cash divided by payroll plus rent, not a profit forecast. Team, project, office, story, and onboarding flows use the shared components. Other management screens use the updated typography and palette.

Navigation becomes an icon rail on smaller screens; the inspector stacks beneath the office. Labels remain available to assistive technology. The application uses system fonts and does not depend on a remote font request.

## Original 3D objects

`src/scene/officeObjects.ts` builds editable Three.js assets in meters, with Y up:

- Workstations with wood edge detail, monitor stands, code screens, keyboard textures, mouse pads, mugs, and computer towers
- Wheeled office chairs and seated/standing staff
- Server racks with drive bays and activity LEDs
- Coffee counters, an espresso machine, steam, and kitchen appliances
- Upholstered sofas, cushions, plants, shelving, storage boxes, meeting tables, and exercise equipment

`src/scene/createOfficeScene.ts` assembles the cutaway room, concrete materials, windows, whiteboards, wall signage, lighting, and shadows. These are actual 3D meshes and original procedural textures, not emoji props or a static background image. The art direction is a detailed, stylized architectural miniature rather than photographic character rendering.

Employees appear according to the current roster; assigned employees type, while available employees use an idle pose. Screen brightness, server LEDs, and coffee steam animate with the simulation. Pause and game speed are respected. Reduced-motion preferences suppress ambient animation.

Orbit, zoom, camera reset, and daylight/evening controls are presentation controls only. Clicking a room area opens its furnishing inspector; the labeled area buttons offer the same operation without interacting with the canvas. If WebGL is unavailable, office purchases remain usable through those controls.

## Lifecycle and performance

The office is lazy-loaded separately from the title and management screens. Geometry and materials are reused within each scene; textured keyboards and floor surfaces reduce draw calls. Rendering is capped at 30 fps, skips hidden/offscreen views, and stops issuing render calls while a paused camera is stationary. Device pixel ratio is capped at 1.75. Resize adjusts the camera field of view for narrow screens.

Scene cleanup stops the animation loop, disconnects observers, disposes controls, textures, materials, geometries, shadow maps, and the renderer. See the [Three.js renderer documentation](https://threejs.org/docs/pages/WebGLRenderer.html).

Purchases, office size, and changes to roster/assignments rebuild the scene. Changes to morale or project progress do not rebuild it. Selection and pause updates are applied to the existing controller.

`src/data/officeRelocation.ts` transfers equipment to compatible slots when offices expand. Equipment without a matching area remains visible as a carried item with working upgrade/sell controls. Older saves with unmatched slot IDs are supported by the same area resolver.

## Validation

Run `npm test`, `npm run lint`, and `npm run build`. The management workflow tests cover funded project creation, occupied teams, funding changes, signing costs, capacity limits, staff departures, and modal keyboard handling. Relocation tests cover equipment and bonus preservation across all office tiers.

Manual browser checks should include: hire a teammate, assign a project, play/pause, purchase and level an amenity, move offices, install a server rack, switch lighting, orbit/zoom/reset, save/reload, and inspect Headquarters and a dialog at a 390px viewport.

## Cinematic Valley opening

The active intro is a 36-second, six-chapter Blender film. It moves from peninsula traffic through the fictional Hollow campus and speculative office towers into the neighborhood, the founder’s garage, and the first workbench. Camera setups, original architecture, cars, crane, and set details are editable in Blender. The final garage exterior chapter preserves the approved Cycles render; the new chapters use EEVEE with physical camera lenses and depth of field.

`src/intro/cinematic/shots.ts` owns the six chapter times and overlay copy. `RenderedIntroPlayer.ts` uses the native video clock, supports paused seeks, handles autoplay restrictions, pauses in background tabs, and tears down listeners without breaking React Strict Mode. An original synthesized score starts after audio permission and follows the current chapter position. Reduced-motion and skip preferences open the still title menu; the film can be explicitly replayed. Failed media leaves the game menu accessible. The older Three.js film source remains available for future alternate rendering but is not loaded by the active intro.

## Office animation and assets

`public/models/office-props.glb` contains five original Blender-built parts: an oak desk shell, ergonomic chair, task lamp, floor fan, and independent fan rotor. Shared instances replace procedural placeholders after loading; the office remains usable if the optional pack is unavailable. Standing desks retain their original height-specific geometry. The pack is approximately 629 KiB and uses meters with glTF Y-up coordinates.

Concrete and plaster diffuse, normal, and roughness maps are optimized to 512 px from the existing Poly Haven sources. Attribution is in `public/textures/office/credits.json`. These load after the first usable office frame. Scene-owned resources and late asynchronous loads are disposed when changing offices or lighting.

The office uses environment reflections, sun shadows, evening pendant lighting, animated IDE cursors/status strips, server activity, coffee steam, a spinning fan, subtle foliage motion, coordinated head/hair movement, typing, and periodic stretches. Simulation pause freezes ambient movement; speed controls scale it. Reduced-motion disables ambient movement and the camera tour. Camera reset, zoom, and area focus ease into position; dragging interrupts the move. The tour gently reverses within the cutaway room’s orbit limits. Rendering is capped at 30 fps and stops drawing an unchanged, paused, offscreen or hidden office.

## Film production and reproduction

See `art/valley-film/README.md` for the complete build, render, resume, and encode commands. `scripts/film/build_game_assets.py` exports the original game prop pack. The earlier garage source is documented in `art/garage-proof/README.md` and its asset manifest records source links, credits, download sizes, and integrity hashes.

Editable Blender scenes, downloaded source scans, and frame intermediates are intentionally ignored by Git. The finished MP4, poster, lightweight GLB, web textures, scripts, manifests, and source credits are included. Keep the entire local `art/` folder when moving the working project.
