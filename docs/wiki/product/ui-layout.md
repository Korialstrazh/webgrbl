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
  - left panel: material select (Design view), layers (on/off; off is never sent) with Add test sample below the list (Design view), objects; in 3D the Cut check above Layers, Objects hidden; the material library opens from the top bar;
  - centre: the bed to scale, with a Design / Toolpath / 3D switch and a status strip with a collapsible console;
  - right panel, main task first: machine state (one line while not connected), job (estimate, export, Start), jog, low-power pointer, frame, air assist, and a large STOP that is always visible; the pre-flight check is planned (roadmap item 5);
- **Running a job** changes the Workbench's state (progress, overrides, jog locked); there is no separate screen.
- **Secondary screens are drawers or dialogs:** layer settings, material library, machine profiles, the GRBL `$$` editor, projects. Drawers never cover the machine panel.
- **A bed the user can colour.** The work surface is a light grey by default, like a sheet of material, so black artwork shows; the user can pick another colour (named presets: Grey (default), Light grey, White, Dark grey, Plywood, each a keyboard-reachable button) from the view controls in the bed header, which never float over the drawing, stored for the whole app. The marks on the bed switch to a light set on a dark bed, and the grid takes the hue of the bed colour.
- **The Design view shows what burns.** Objects on a Line layer show as outlines in the layer colour, fill and shading layers show filled, and objects on an off layer are dimmed, matching the Toolpath view. A very dark bed hides black artwork, and the picker says so.
- **Planned features stay quiet.** A control that is not built yet shows as disabled with a small "Soon" tag and never sends anything to the machine; a panel or menu that would hold nothing but a placeholder (the Materials menu, the pre-flight card) stays off the screen until it is built. The main screen shows at most about four Soon tags.
- **Power by colour:** one range, black (layer max power) → white (no power). Real gradients are followed; off-grey colours are ignored within a tolerance.
- **Any GRBL laser:** machine profiles hold bed size, maximum watts, `$30`, origin and air assist. Material presets are stored in watts per profile and rescaled on import.
- **Design tokens:**
  - dark theme: bg `#121417`, surfaces `#16191c`/`#1d2024`/`#23272c`, border `#2a2e34`, text `#e6e8eb`/`#a3a9b0` (muted, at least 4.5:1 on every surface, also dimmed at 0.8 opacity);
  - accent `#ff8a1f`, danger `#e5383b`;
  - fonts Inter and JetBrains Mono, self-hosted;
  - 44 px targets for machine controls.
- **Roadmap:**
  1. ~~App shell and design system.~~ Done: see [[app-shell]] and [[ui-components]].
  2. ~~Machine control and machine profiles.~~ Done: see [[machine-control]].
  3. ~~Projects and SVG import (Dexie autosave, undo/redo).~~ Done: see [[projects-and-svg-import]].
  4. Layers and power mapping, G-code, toolpath preview. 4a done: see [[layers-and-gcode]] (palette, layers from colours, G-code export, Toolpath view with simulation and time estimate); 4b done: see [[burn-preview]] (3D burn preview with an orthographic camera, materials with a test sample, Cut check, liftable parts). The real burn of the sample awaits the hardware follow-up.
  5. Running jobs (pre-flight, progress, pause, overrides). In progress: see [[running-jobs]]. Start job, progress, Pause and Resume are built, simulator-tested only; Frame job is built too, simulator-tested only with the ACMER checks pending; overrides, pre-flight and long jobs are not.
  6. ~~Material library (import/export).~~ Done: see [[burn-preview]].
  7. Extras (node editing, more colour ranges).

Feature status against LaserGRBL: [[lasergrbl/_index|LaserGRBL feature reference]]. Product goals: [[vision]].
