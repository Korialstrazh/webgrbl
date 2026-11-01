---
title: UI Layout and Feature Roadmap
created: 2026-10-31
provenance: UI brainstorm with the user, 2026-10-31; spec docs/superpowers/specs/2026-10-31_(01)_ui-layout.spec.md; sketches https://claude.ai/artifact/7Y6LLeCiuwKiYpdRF7nDGF
---

# UI Layout and Feature Roadmap

The approved screen layout of webgrbl and the order in which features get built. The spec is the full design; this is the summary to navigate from.

## Key Takeaways

- **Workbench layout.** One screen, with no modes:
  - top bar: project, menus, undo/redo, connection pill, autosave state;
  - left panel: layers (on/off; off is never sent), objects, material;
  - centre: the bed to scale, with a Design / Toolpath / 3D switch and a status strip with a collapsible console;
  - right panel: machine state, jog, low-power pointer, frame, air assist, pre-flight, Start, and a large STOP that is always visible.
- **Running a job** changes the Workbench's state (progress, overrides, jog locked); there is no separate screen.
- **Secondary screens are drawers or dialogs:** layer settings, material library, machine profiles, the GRBL `$$` editor, projects. Drawers never cover the machine panel.
- **Full Workbench from day one.** Regions for unbuilt features are greyed out ("coming soon") and never send anything to the machine.
- **Power by colour:** one range, black (layer max power) → white (no power). Real gradients are followed; off-grey colours are ignored within a tolerance.
- **Any GRBL laser:** machine profiles hold bed size, maximum watts, `$30`, origin and air assist. Material presets are stored in watts per profile and rescaled on import.
- **Design tokens:**
  - dark theme: bg `#121417`, surfaces `#16191c`/`#1d2024`/`#23272c`, border `#2a2e34`, text `#e6e8eb`/`#8b9097`;
  - accent `#ff8a1f`, danger `#e5383b`;
  - fonts Inter and JetBrains Mono, self-hosted;
  - 44 px targets for machine controls.
- **Roadmap:**
  1. ~~App shell and design system.~~ Done: see [[app-shell]] and [[ui-components]].
  2. ~~Machine control and machine profiles.~~ Done: see [[machine-control]].
  3. ~~Projects and SVG import (Dexie autosave, undo/redo).~~ Done: see [[projects-and-svg-import]].
  4. Layers and power mapping, G-code, toolpath preview.
  5. Running jobs (pre-flight, progress, pause, overrides).
  6. Material library (import/export).
  7. Extras (node editing, 3D preview, more colour ranges).

Feature status against LaserGRBL: [[lasergrbl/_index|LaserGRBL feature reference]]. Product goals: [[vision]].
