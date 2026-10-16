# Cerevyn — PS09 Adaptive Memory Matching Game

> **Cognitive Performance Memory Engine with Seeded PRNG Determinism, Zero-Race Board Locking, and Explainable Adaptive Difficulty Progression.**

[![CI/CD Pipeline](https://github.com/example/cerevyn/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/example/cerevyn/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Vitest](https://img.shields.io/badge/Tests-23%20Passed-brightgreen.svg)](https://vitest.dev/)
[![Hosting](https://img.shields.io/badge/Azure-Static%20Web%20Apps-0078d4.svg)](./AZURE_HOSTING_DESIGN.md)

---

## 1. Project Overview & Specification

**Cerevyn** is a modern, responsive browser game built in **React 19** and **TypeScript** adhering to all specifications of **PS09 Adaptive Memory Matching Game**:
- **Baseline Grid**: Starts on a **4 by 4 grid containing eight pairs (16 cards)**.
- **Reproducible Random Seed**: Shuffling is driven by a deterministic **Mulberry32 PRNG** initialized via 32-bit Murmur-inspired string hashing. Any custom seed (e.g., `SEED-ALPHA`) produces the exact same card layout across browsers and test runs.
- **Difficulty Hierarchy**: 4 defined tiers (**Casual / Level 1**, **Standard / Level 2**, **Challenging / Level 3**, **Master / Level 4**) featuring increasing grid sizes (up to 4x6, 12 pairs) and accelerating mismatch preview delays (from 1200ms down to 500ms).
- **Game-State Correctness**:
  - **Anti-Spam Lockout**: Strictly prevents a 3rd card selection while two unmatched cards are resolving.
  - **Idempotency**: Repeat clicks on the same revealed card and clicks on already matched cards produce zero side-effects.
  - **Timer Neutralization**: Restarting or switching seeds immediately cancels all in-flight asynchronous timers, preventing stale callbacks from mutating the new game.
- **Explainable Adaptation Engine**: Evaluates completion moves and active elapsed time against documented mathematical thresholds. At round conclusion, provides transparent, human-readable rationale for whether difficulty is promoted, demoted, or maintained.
- **Anonymous Telemetry**: Stores round records and aggregated KPIs in `localStorage` with JSON export and zero PII collection.
- **Interactive Live Demonstration Suite**: Built-in 5-check interactive runner for verifying matches, mismatches, rapid clicks, restart during pending timers, and performance-driven adaptation.

---

## 2. Interactive Demonstrations & Required Checks

The application features a dedicated **Interactive Demos modal** accessible directly from the top navigation bar:

| Demonstration Check | Behavior Verified | Implementation & Safeguard |
| :--- | :--- | :--- |
| **1. Match Check** | Two identical cards are clicked; remain permanently revealed and locked in `matched` state. | Audio chime plays; matched pairs counter increments (`k / N`); win check is evaluated. |
| **2. Mismatch Check** | Two differing cards are clicked; both enter `mismatched` state (red glow, shake animation). | Board enters `isLocked = true`; cards automatically revert to `hidden` after `mismatchDelayMs`. |
| **3. Rapid Clicks Check** | 5 cards clicked in immediate succession (<30ms). | Card 1 & 2 flip; clicks 3, 4, 5 are strictly rejected while board is locked; no race condition. |
| **4. Timer Restart Check** | Mismatch triggered (850ms timer scheduled); Restart button clicked at 250ms. | `clearAllTimers()` executes immediately; old timer cannot mutate or flip cards in the new game. |
| **5. Adaptive Difficulty Check** | High performance (10 moves, 19s) vs struggling performance (22 moves, 49s). | Engine evaluates documented thresholds; produces explicit reason string; updates difficulty. |

---

## 3. Explainable Adaptive Difficulty Algorithm

### Mathematical Formulation
For any round completed on difficulty tier $D$:
- **Optimal Moves Benchmark**: $\text{Opt} = \text{Pairs}(D)$ (e.g., 8 moves for 8 pairs).
- **Move Efficiency**: $\eta_{\text{moves}} = \frac{\text{Opt}}{\max(\text{Moves}, 1)}$
- **Speed Efficiency**: $\eta_{\text{speed}} = \frac{\text{TargetTime} \times 1.2}{\max(\text{ElapsedTime}, 1)}$
- **Composite Score**: $S = \text{round}\left( (0.6 \cdot \eta_{\text{moves}} + 0.4 \cdot \eta_{\text{speed}}) \times 100 \right)$

### Threshold Matrix
| Level | Name | Grid | Pairs | Peek Window | Promotion Rule | Demotion Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Casual | 4x4 | 8 pairs | 1200ms | $\le 14\text{ moves} \land \le 32.0\text{s}$ | *Minimum Level* |
| **2** | Standard | 4x4 | 8 pairs | 850ms | $\le 12\text{ moves} \land \le 25.0\text{s}$ | $> 18\text{ moves} \lor > 45.0\text{s}$ |
| **3** | Challenging | 4x5 | 10 pairs | 650ms | $\le 16\text{ moves} \land \le 30.0\text{s}$ | $> 24\text{ moves} \lor > 55.0\text{s}$ |
| **4** | Master | 4x6 | 12 pairs | 500ms | *Maximum Level* | $> 28\text{ moves} \lor > 65.0\text{s}$ |

### Explainable Decision Rationale Example:
> *"Outstanding performance! You completed 8 pairs in 10 moves (target: ≤ 12, margin: +2) and 19.4s (target: ≤ 25.0s, margin: +5.6s). Both accuracy and speed thresholds were satisfied. Difficulty increased to Challenging (Level 3) (10 pairs, 650ms mismatch reveal)."*

---

## 4. Architecture & State Management

```
src/
├── components/
│   ├── Card.tsx               # 3D perspective flip card with ARIA & keyboard controls
│   ├── CardIcon.tsx           # Lucide icon resolver with theme colors
│   ├── Grid.tsx               # Responsive CSS grid for 4x4, 4x5, 4x6 layouts
│   ├── Header.tsx             # Navbar with seed display, audio mute, and modal triggers
│   ├── HistoryModal.tsx       # Anonymous session telemetry & JSON export
│   ├── InstructionsModal.tsx  # Documented thresholds and rules explainer
│   ├── InteractiveDemoModal.tsx # Live in-browser 5-check test suite
│   ├── StatsBar.tsx           # Moves, pairs, elapsed time, accuracy, seed & restart controls
│   └── WinModal.tsx           # Victory screen with explainable adaptation breakdown
├── hooks/
│   └── useMemoryGame.ts       # Finite state machine, strict locking, and timer neutralization
├── test/
│   ├── adaptation.test.ts     # Threshold tests (promotion, demotion, maintenance, boundaries)
│   ├── gameLogic.test.tsx     # Integration tests (match, mismatch, rapid clicks, restart)
│   ├── prng.test.ts           # Seed reproducibility and shuffle determinism tests
│   ├── setup.ts               # Web Audio API, clipboard, and canvas-confetti mocks
│   └── storage.test.ts        # Telemetry persistence and KPI aggregation tests
├── types/
│   └── game.ts                # TypeScript interfaces and contracts
└── utils/
    ├── adaptation.ts          # Mathematical adaptation engine and threshold definitions
    ├── audio.ts               # Synthesized Web Audio API sound generator (zero asset dependencies)
    ├── cardDefinitions.ts    # Card glyph archetypes and deterministic deck generator
    ├── prng.ts                # Mulberry32 32-bit PRNG and Fisher-Yates array shuffle
    └── storage.ts             # Anonymous session storage and analytics engine
```

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js 20.x or 22.x
- npm 10.x+

### Installation & Run
```bash
# 1. Clone or navigate to the directory
cd Cerevyn

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

### Run Test Suite
```bash
# Run all Vitest unit & integration tests
npm test
```

### Production Build
```bash
# Typecheck with tsc and compile optimized Vite bundle
npm run build
```

---

## 6. Testing Summary

All 23 unit and integration tests execute and pass cleanly:
```
 ✓ src/test/adaptation.test.ts (7 tests)
 ✓ src/test/prng.test.ts (6 tests)
 ✓ src/test/storage.test.ts (4 tests)
 ✓ src/test/gameLogic.test.tsx (6 tests)
   ✓ PS09 Core Game Mechanics & State Correctness Suite (6)
     ✓ renders a 4 by 4 grid containing 16 cards (eight pairs) on initial load
     ✓ demonstrates a match: two identical cards remain permanently revealed and increment matched pairs
     ✓ demonstrates a mismatch: flips two different cards, locks board, and flips back after mismatch delay
     ✓ demonstrates rapid clicks: strictly prevents a 3rd selection while two unmatched cards are being resolved
     ✓ handles repeat clicks on the same card and clicks on already matched cards idempotently
     ✓ demonstrates restart during a pending timer: cancels callbacks so old game actions cannot affect new game

 Test Files  4 passed (4)
      Tests  23 passed (23)
```

---

## 7. Cloud Deployment & Azure Hosting Design

The project includes complete cloud hosting assets:
- **Architecture Document**: Detailed specifications in [`AZURE_HOSTING_DESIGN.md`](./AZURE_HOSTING_DESIGN.md).
- **Infrastructure as Code**: Bicep template in [`infra/main.bicep`](./infra/main.bicep).
- **Enterprise Configuration**: [`staticwebapp.config.json`](./staticwebapp.config.json) configuring CSP, HSTS, anti-clickjacking, and 1-year immutable caching for static assets.
- **Automated CI/CD**: [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml) running type checks, tests, builds, and deploying to Azure Static Web Apps.
