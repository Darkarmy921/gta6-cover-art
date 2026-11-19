# Vice City Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Darkarmy921/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Darkarmy921/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Build an offline web app that turns any photo and caption into GTA 6-style cover art, exported as a PNG to share; an AI judge compares the apps two at a time, places go by win rate, and the 50 best share $250. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

Vice City Cover Studio turns a person's photo and a caption into cover art in
the style of GTA 6's posters — multi-panel layouts, bold outlined lettering,
and a Vice City sunset or neon colour grade — and exports it as a PNG in the
common post sizes (1080 × 1080, 1080 × 1350, 1920 × 1080).

- **Multi-panel poster**: Hero, Split, Comic (hero + two small), and Grid layouts.
- **Any photo**: upload your own photos, drag to reposition each one, zoom,
  fit or fill, flip, or fill every panel with a single photo. Photos never
  leave the machine — the app works fully offline.
- **Caption**: editable title, subtitle and tagline, with presets, position,
  colour and size controls.
- **Colour grades**: Vice City Sunset, Neon Night, Golden Hour and Mono Noir,
  with adjustable strength.
- **Fast**: three steps — Upload, Style, Export — plus a one-click sample
  (procedurally drawn scenes, no photo files needed) so a cover is one click
  away. Every control is reachable by keyboard, and photos can be dragged
  with the mouse to reposition them inside their panel.

Everything is original: all art and lettering are drawn with code. No
Rockstar Games logo, artwork or fonts are used anywhere.

## Run it

```sh
node --version  # Node 22.18 or later
python3 -m http.server 8080 --directory app
# open http://localhost:8080 in desktop Chrome
```

Or serve `app/` with any static file server. No build step, no network.

The program entry `main.ts` (Node 22, standard library only) copies `app/`
and `screenshots/` into the output directory and writes `dossier.json` with
the vendored make.fun library:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `main.ts` — program entry: builds the output directory + dossier.
- `vendor/makefun-app.ts` — make.fun's browser-app library, copied unchanged.
- `app/index.html`, `app/style.css` — the studio UI.
- `app/src/samples.js` — procedurally drawn sample photos.
- `app/src/cover.js` — the render engine (panels, grades, caption, PNG export).
- `app/src/main.js` — UI wiring (uploads, drag, controls, export).
- `screenshots/` — the app with a photo loaded, and covers it exported.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ppee1fs7&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
