---
title: Product Vision
created: 2026-10-30
provenance: initial project brief from the user, 2026-10-30
---

# Product Vision

webgrbl is a web version of [LaserGRBL](https://lasergrbl.com/): open the website, connect a GRBL laser cutter or engraver, load a design, and start cutting, with no desktop install.

## Key Takeaways

- **Browser-only control.** The app talks to the GRBL controller through the **Web Serial API** (Chromium desktop browsers: Chrome, Edge, Opera). Firefox and Safari have no Web Serial, so the UI must detect this and explain it.
- **Offline-first PWA.** The app is installable and its whole shell is precached by a service worker, so it works in a workshop without internet. Updates wait for user confirmation, because reloading during a job would stop the laser stream.
- **Modern, very user-friendly, feature rich UI.** The UI is designed in upcoming brainstorm sessions and sketched in Claude Design before it is built (see `docs/project-rules/claude-design-sketching.rule.md`).
- **State in Redux + redux-saga.** Sagas fit the serial streaming loop (send line, wait for `ok`, track the planner buffer, handle `!`/`~`/reset real-time commands).

## Drivers

The user wants to "upload required drivers" if a laser needs them. A web page **cannot install OS drivers**: USB-serial chips such as the CH340/CH341 (common on cheap GRBL boards) need a driver installed on Windows before the browser can see the port. CP210x and FTDI usually work out of the box on current Windows, macOS, and Linux. What the app can do:

- Detect "no ports found" and walk the user through it, with a link to the official driver for their chip.
- Keep a short per-chip guide (and, if needed, a cached copy of the vendor download link) in the in-app help so it works offline.
- Optionally use **WebUSB** for boards that expose a vendor-specific interface, which needs no driver, though most GRBL boards are plain CDC/serial.

## Feature backlog (to brainstorm)

Starting points from LaserGRBL's feature set, to be refined in brainstorm sessions:

- Connection: port picker, baud rate, auto-detect GRBL version, live status (`?` polling), alarm/unlock, homing.
- Jogging and positioning: jog pad, step sizes, set origin/zero, frame the job outline with the laser at low power.
- File import: G-code, SVG vectors, raster images (line-to-line, dithering, 1-bit), with power/speed per layer.
- Job preview: 2D toolpath rendering, time estimate, progress during the run.
- Streaming: character-counting buffer protocol, pause/resume/abort, feed/power overrides.
- Machine settings: `$$` GRBL config editor with descriptions, saved machine profiles.
- Material library: speed/power/passes presets per material and thickness.
- Safety: clear emergency stop, laser-off on disconnect, confirmations before firing.
