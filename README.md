# webgrbl

A browser version of LaserGRBL: control a GRBL laser cutter or engraver straight from the browser over Web Serial. Installable as a PWA and usable offline.

## Requirements

- Node.js 24.14 or newer
- A desktop browser with Web Serial (Chrome, Edge, Opera or Firefox)

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Pick a checkout and start the Vite dev server there, reachable from the local network |
| `npm run build` | Typecheck and build the production bundle with the service worker |
| `npm run preview` | Serve the production build locally (use this to test offline mode) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting |
| `npm test` | Run the Vitest suite |

## Docs

- `AGENTS.md` - rules for agents working in this repo
- `docs/wiki/` - knowledge base (start at `_master-index.md`)
- `docs/superpowers/` - specs and plans

## License

Licensed under the [Apache License, Version 2.0](LICENSE). You may use, modify and distribute webgrbl, in open or closed source and commercial projects, under its terms. See [NOTICE](NOTICE) for attribution.

**Safety disclaimer:** webgrbl drives laser cutters and engravers. It is provided "AS IS", without warranty of any kind, and the authors accept no liability for any damage or injury arising from its use. Always supervise your machine and follow your laser's safety instructions.
