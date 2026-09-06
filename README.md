# AI Lab Tycoon

A satirical tycoon game where you build an AI startup in Silicon Valley. Inspired by Game Dev Tycoon and the HBO series *Silicon Valley*, you'll hire engineers, ship AI products, outmaneuver competitors, and chase the dream of AGI — all while burning through venture capital.

Built with React, TypeScript, Zustand, Three.js, and Tailwind CSS. Runs entirely in the browser.

---

## The founder workspace

A charcoal-and-sage management interface surrounds a live 3D office. Hire staff, assign projects, furnish the garage, and watch the company evolve from a dubious incubator to a campus. The UI keeps the HBO *Silicon Valley* premise through mentor dialogue, startup satire, and the original story events.

See [the UI and 3D system notes](docs/UI_SYSTEM.md) for the component architecture, asset library, and validation steps.

---

## Features

### Cinematic Silicon Valley Intro
An original **36-second Blender opening film** travels through peninsula traffic, the fictional Hollow campus, speculative glass towers, the neighborhood, and the founder’s garage and workbench. Six real camera setups, moving commuters, a construction crane, scanned surfaces, and original satirical signage bring the miniature Valley to life. Includes an original synthesized score, pause, chapter navigation, skip, replay, and reduced-motion support.

The playable office now uses a compact Blender prop pack, scanned concrete/plaster surfaces, environment reflections, evening task lighting, animated screens, staff gestures, foliage, coffee steam, and a rotating fan. Use the camera tour or select an office area and focus the camera to inspect the details. Production instructions: [Full film](art/valley-film/README.md).

### Core Gameplay Loop
- **Hire your team** — Start with nothing and recruit engineers, researchers, designers, and managers
- **Ship AI products** — Build chatbots, image generators, code copilots, agent systems, and chase AGI
- **Research new tech** — Unlock a branching research tree from basic transformers to artificial general intelligence
- **Upgrade your office** — Install slot-based workstation, amenity, and infrastructure upgrades
- **Outcompete rivals** — Cortex, Nexus, Hooli, and more vie for market share with dynamic AI behavior

### Systems
| System | Details |
|--------|---------|
| **Projects** | 7+ project types with varying complexity, team requirements, and revenue potential |
| **Employees** | 5 roles, 4 skill axes, morale tracking, trait system, training |
| **Research** | Branching tech tree with prerequisites and unlock chains |
| **Office** | Slot-based upgrades with layout progression and amenity bonuses |
| **Market** | Dynamic competitors with news feed, market share tracking, reputation |
| **Contracts** | Client contracts with deadlines and bonus payouts |
| **Policies** | Company-wide policies that affect morale, productivity, and costs |
| **Achievements** | 40+ achievements for milestones and secret discoveries |
| **Statistics** | Revenue, morale, and reputation history with sparkline charts |
| **Events** | Random story events with character dialogue and branching choices |

### Visual Polish
- Shared buttons, badges, SVG icons, dialogs, and responsive management surfaces
- Interactive 3D cutaway offices with modeled furniture, equipment, lighting, and shadows
- Staff typing/idle motion, server LEDs, screen glow, and coffee steam tied to game speed
- Camera orbit, zoom, reset, and daylight/evening controls
- Accessible furnishing controls, reduced-motion support, and a WebGL fallback
- Procedural Web Audio API sound effects
- Particle effects for achievements and milestones
- Animated sparkline charts for tracking stats over time
- Keyboard shortcuts for all major actions
- Satirical onboarding and a dismissible founder hint
- Auto-save each in-game day and on browser close (manual save still available)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How to Play

1. **Hire employees** — Visit the TEAM tab to recruit your first engineers and researchers
2. **Start a project** — Go to PROJECTS, pick an AI product type, and assign your team
3. **Unpause the game** — Press SPACE or click the play button to start the clock
4. **Research new tech** — Spend money on the RESEARCH tree to unlock better project types
5. **Upgrade your office** — Install workstation, amenity, and infrastructure upgrades in Headquarters
6. **Watch the market** — Track competitors, read industry news, and grow your reputation
7. **Complete contracts** — Take on client work for guaranteed income
8. **Chase AGI** — The ultimate goal. Good luck.

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Pause / Unpause |
| `1-4` | Set game speed |
| `P` | Projects |
| `R` | Research |
| `T` | Team |
| `O` | Office |
| `M` | Market |

---

## Competitors

| Company | Personality | Catchphrase |
|---------|------------|-------------|
| **Cortex Systems** | Safety-focused | "We'll make AGI safe... eventually" |
| **Ethos AI** | Constitutional | "Constitutional AI experts" |
| **Nexus Intelligence** | Game-solving | "We solve games, not problems" |
| **Collective Labs** | Open source | "Open source everything... except the good stuff" |
| **OmniCorp Research** | Product spam | "We have 50 AI products, pick one" |

Competitors dynamically launch products, secure funding, suffer data breaches, and poach talent — all reported in the in-game Industry News feed.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| TypeScript 5.9 | Type safety |
| Zustand 5 | State management |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| Vitest | Testing |
| Web Audio API | Procedural sound effects |

### Project Structure
```
src/
  components/    # React panels, modals, overlays, cinematic intro
  intro/         # 3D cinematic set, camera edit, audio; legacy Canvas renderer
  store/         # Zustand game state, simulation helpers, persistence
  systems/       # Time system, audio engine, UI feedback bus
  data/          # Game data (projects, research, events, characters, balance)
  hooks/         # Custom React hooks (team assignment)
```

---

## Easter Eggs

The game is packed with Silicon Valley references. A few hints:
- Look for the satirical signs and growing corporate empires in the intro
- Check the dumpsters
- Read every billboard
- Some story events feature familiar characters

---

## License

MIT
