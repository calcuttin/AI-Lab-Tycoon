# AI Lab Tycoon

A satirical tycoon game where you build an AI startup in Silicon Valley. Inspired by Game Dev Tycoon and the HBO series *Silicon Valley*, you'll hire engineers, ship AI products, outmaneuver competitors, and chase the dream of AGI — all while burning through venture capital.

Built with React, TypeScript, Zustand, and Tailwind CSS. Runs entirely in the browser.

---

## Screenshots

![Game Screenshot](screenshots/Screenshot%202026-02-25%20at%2010.02.19%20PM.png)

---

## Features

### HBO Silicon Valley-Style Intro
A continuous parallax flyover panorama scrolls through the history of Silicon Valley — from Hewlett Packard's garage through the dot-com boom to the AI era. Watch PETS.COM and THERANOS crumble, spot the VINE logo in a dumpster, and read billboards like *"SERIES F: $10B (PRE-REVENUE)"* before the camera zooms into your tiny lab.

### Core Gameplay Loop
- **Hire your team** — Start with nothing and recruit engineers, researchers, designers, and managers
- **Ship AI products** — Build chatbots, image generators, code copilots, agent systems, and chase AGI
- **Research new tech** — Unlock a branching research tree from basic transformers to artificial general intelligence
- **Upgrade your office** — Add server racks, coffee machines, nap pods, and meeting rooms
- **Outcompete rivals** — Cortex, Nexus, Hooli, and more vie for market share with dynamic AI behavior

### Systems
| System | Details |
|--------|---------|
| **Projects** | 7+ project types with varying complexity, team requirements, and revenue potential |
| **Employees** | 5 roles, 4 skill axes, morale tracking, trait system, training |
| **Research** | Branching tech tree with prerequisites and unlock chains |
| **Office** | Room placement, capacity limits, amenity bonuses |
| **Market** | Dynamic competitors with news feed, market share tracking, reputation |
| **Contracts** | Client contracts with deadlines and bonus payouts |
| **Policies** | Company-wide policies that affect morale, productivity, and costs |
| **Achievements** | 20+ achievements for milestones and secret discoveries |
| **Statistics** | Revenue, morale, and reputation history with sparkline charts |
| **Events** | Random story events with character dialogue and branching choices |

### Visual Polish
- Pixel art aesthetic with "Press Start 2P" font
- Procedural Web Audio API sound effects
- Particle effects for achievements and milestones
- Animated sparkline charts for tracking stats over time
- Keyboard shortcuts for all major actions
- Tutorial overlay for new players
- Auto-save with localStorage persistence

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
5. **Upgrade your office** — Buy amenities to boost morale and productivity
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
  components/    # 25+ React components (game panels, modals, overlays)
  store/         # Zustand game state with save/load persistence
  systems/       # Time system, audio engine
  data/          # Game data (projects, research, events, characters, achievements)
  hooks/         # Custom React hooks (team assignment)
```

---

## Easter Eggs

The game is packed with Silicon Valley references. A few hints:
- Watch the intro carefully for collapsing buildings
- Check the dumpsters
- Read every billboard
- Some story events feature familiar characters

---

## License

MIT
