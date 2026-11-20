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
  - left panel: full-width material select with, below it, a captioned Library button beside a link with the preset count of the material on the active machine, which opens the library filtered to that material (Design view); the library itself is a narrow left drawer in the bed region, directly beside the panel, that leaves most of the bed in view: a compact list, replaced by the edit view of one preset with a Back button, and a New material entry beside Add preset, layers (on/off; off is never sent) with Add test sample below the list (Design view), objects; the cards keep one order in every view (Layers, Material, Objects, Cut check) so Layers never moves, and Cut check is an ordinary card after Objects in the scrolling panel, so it never covers an object row or the Objects fields (a new selection scrolls its fields and row into view); a card that does not apply in a view (Material outside Design, Objects in 3D, Cut check outside 3D) folds to a muted heading line with an info icon whose tooltip says where it applies; the top bar has no Materials entry;
  - centre: the bed to scale, with a Design / Toolpath / 3D switch and a status strip with a collapsible console;
  - right panel, main task first: machine state (one line while not connected), job (estimate, export, Start, then the low-power pointer as its last row), jog, frame, air assist, and a large STOP that is always visible; the pre-flight check is planned (roadmap item 5);
- **Running a job** changes the Workbench's state (progress, overrides, jog locked); there is no separate screen.
- **Secondary screens are drawers or dialogs:** layer settings and the material library are left drawers in the bed region (the library can open on top of the layer drawer; Escape closes the top one first); machine profiles, the GRBL `$$` editor and projects are dialogs. Drawers never cover the machine panel or STOP.
- **A bed the user can colour.** The work surface is a light grey by default, like a sheet of material, so black artwork shows; the user can pick another colour (named presets: Grey (default), Light grey, White, Dark grey, Plywood, each a keyboard-reachable button) from the view controls in the bed header, which never float over the drawing, stored for the whole app. The marks on the bed switch to a light set on a dark bed, and the grid takes the hue of the bed colour.
- **The Design view shows what burns.** Objects on a Line layer show as outlines in the layer colour, fill and shading layers show filled, objects on an off layer show as faint dashed outlines like skipped content, and no drawing ever reaches past the bed edge, matching the Toolpath view. A very dark bed hides black artwork, and the picker says so.
- **Planned features stay quiet.** A control that is not built yet shows as disabled with a small "Soon" tag and never sends anything to the machine; a panel or menu that would hold nothing but a placeholder (the Materials menu, the pre-flight card) stays off the screen until it is built. The main screen shows at most about four Soon tags.
- **Power by colour:** one range, black (layer max power) → white (no power). Real gradients are followed; off-grey colours are ignored within a tolerance.
- **Any GRBL laser:** machine profiles hold bed size, maximum watts, `$30`, origin and air assist. Material presets are stored in watts per profile and rescaled on import.
- **Design tokens:**
  - dark theme: bg `#121417`, surfaces `#16191c`/`#1d2024`/`#23272c`, border `#2a2e34`, text `#e6e8eb`/`#b0b6bd` (muted, at least 4.5:1 on every surface, also dimmed at 0.8 opacity);
  - accent `#ff8a1f`, danger `#e5383b`;
  - fonts Inter and JetBrains Mono, self-hosted;
  - 44 px targets for machine controls.
- **Roadmap:**
  1. ~~App shell and design system.~~ Done: see [[app-shell]] and [[ui-components]].
  2. ~~Machine control and machine profiles.~~ Done: see [[machine-control]].
  3. ~~Projects and SVG import (Dexie autosave, undo/redo).~~ Done: see [[projects-and-svg-import]].
  4. Layers and power mapping, G-code, toolpath preview. 4a done: see [[layers-and-gcode]] (palette, layers from colours, G-code export, Toolpath view with simulation and time estimate); 4b done: see [[burn-preview]] (3D burn preview with an orthographic camera, materials with a test sample, Cut check, liftable parts). The real burn of the sample awaits the hardware follow-up.
  5. ~~Running jobs (pre-flight, progress, pause, safety, long jobs).~~ Done: see [[running-jobs]]. Start job, progress, Pause, Resume and Frame job were confirmed on the ACMER 12 W on 2026-11-19; the safety checklist, job size, end-of-job cut check, screen wake lock, background-tab timers and Resume after an interruption are simulator-tested only. Live overrides were dropped by the user.
  6. ~~Material library (import/export).~~ Done: see [[burn-preview]].
  7. Extras (node editing, more colour ranges).

Feature status against LaserGRBL: [[lasergrbl/_index|LaserGRBL feature reference]]. Product goals: [[vision]].

## Round 43 behaviour notes

- One project name everywhere: the top bar, the browser tab and Open project show the same derived name (a default-named project is named after its first object and the day and time it was imported, with "(2)", "(3)" when the name is taken; a new empty project is "New project").
- An import larger than the bed starts at the bed origin, the view zooms out to show it whole, and its toast offers Fit to bed.
- Tooltips close on a narrow region switch or tab change and stay hidden until the pointer moves.
- The machine panel shows a "More below" chevron while its cards overflow (since round 44 in the Stop footer's top padding); Position coordinates never wrap.

## Round 44 behaviour notes

- The folded Job card keeps Start at a fixed width inside the card; the facts wrap beside it.
- Object sizes show compactly on one line ("900×900", in mm); the open Material step marks "optional" with a small dashed-ring badge on its marker, apart from its name, and each name keeps to its own column, so the names never run together; the project name sits in a fixed-width slot, so the top bar never shifts.
- The object row chip counts only the toolpath warnings that lock Start, the same number as Fix warnings; outside the bed is a separate bed-outline icon outside the count.
- Lock-reason popovers open to the left of their dot, over their own button, and flip back inside the window.
- The frame overrun and the Toolpath warnings list are icon, short label and action; the full sentences are tooltips.
- Fix warnings briefly highlights the Toolpath tab and the warnings chip.
- The machine panel's "More below" chevron sits in the Stop footer's top padding under a thin shadow, never over a control; in the wide layout the jog pad and job actions are slightly lower, so Move fits above Stop when connected at 1440 x 900; the jog arrows keep a clear gap between them at every width. In the narrow layout a region with more below shows it as a thin shadow edge in its bottom padding (`more-below-fade`), never a fade that dims the controls.

## Round 47 behaviour notes

- Objects off the bed draw a thick amber dashed outline over a faint amber tint, their vector shapes redrawn the same way, whatever the artwork colours; the zoom group has **Show all**, which fits the bed and every object. The job size tooltip says off-bed parts count.
- While **Fix warnings** shows, it and the Check badge carry the count: only a lock dot whose reason is the warnings (or off-bed artwork) steps back, so an offline Start keeps its "Not connected" dot; the Job heading has no shared warning icon, and the frame overrun note moves into the Toolpath warnings popover. The object row chip and Cut check stay.
- Each readiness step with an action is its own tab stop; a done Check or Connect leaves the tab order with `aria-disabled`.
- Icon tooltips (`DismissibleTooltip`, layer mode glyph) also open on a long press for touch screens.
- Add/Edit material keeps Save off until the fields are valid: a name problem shows under the Name field only after it is touched or Save is tried (never on open), and a wrong thickness says "Thickness needed" beside the buttons.
- Open project row buttons are named after the project ("Open sample · Nov 10, 2026 14:05").
- Slider handles get the 2 px accent focus ring.
- Set zero sits in the Position card title row as an origin icon (two axes meeting at a small zero, tooltip "Set zero here (X/Y origin)"); Move no longer has a Set zero row.
- Frame and Export show the icon and the word on one row at 14 px (Start is 16 px). In a wide window the jog pad rows, step sizes, Pause and the job action gap close up, so Move fits above STOP at 1440 x 900 while connected, idle or running.
- The pointer power figure names the track maximum ("1 / 5 %"), so the thumb's place matches what it reads.
- Below 62.5 rem the project name gets a 15 rem slot first (the wordmark is hidden), so an automatic name with its date and time reads whole at 800 px.

