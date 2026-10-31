# Rule Scribbler

A notebook-themed arcade puzzle game built with vanilla JavaScript, CSS, and Vite.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

For a production build:

```bash
npm run build
npm run preview
```

## What changed in this update

- Campaign levels are generated procedurally with no hard-coded 50-level ceiling.
- The level generator supports 10,000+ levels and continues beyond that.
- New mechanics unlock on a rotating 10–20 level cadence. Previously unlocked mechanics can return as combinations in later campaign levels.
- The instruction board is larger, lower, and higher contrast.
- Targets use layered CSS animations for entrances, movement, shrinking, rotation, flicker, selection feedback, and hints.
- Pencil and Eraser are animated CSS-drawn characters, not emoji. Pencil acts as the trickster antagonist with dialogue and reactions. Eraser is the player's helper and has two hint charges per level.
- The Eraser hint highlights safe targets. In no-tap rounds it reminds the player to wait.
- The level picker grows with campaign progress and shows 10-level chapters.

## Twist cadence

The first new mechanic appears at level 11, then additional mechanics unlock at varying intervals of 12–20 levels. At higher levels, older mechanics can combine with the newest mechanic. This keeps later levels varied while preserving the existing fairness rule generator.

## Project structure

```text
PENCIL/
├── index.html
├── package.json
├── package-lock.json
└── src/
    ├── main.js
    ├── game.js
    └── style.css
```

The `node_modules` directory is intentionally not included. Run `npm install` after extracting the project.
