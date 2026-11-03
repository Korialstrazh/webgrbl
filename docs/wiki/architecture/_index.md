# Architecture

How the webgrbl source is put together.

- [[app-shell]] - Entry point, CRUV layout, Redux store with class actions and sagas, GRBL slices and controller bridge, PWA service worker.
- [[grbl-engine]] - Framework-free GRBL protocol engine: protocol parsing, send queue, controller, stop controls, streaming, simulator, Web Serial transport, and its Redux saga bridge.
- [[machine-control]] - Machine profiles (bed size, power, S max, homing, air assist, jog speed): model, storage, the `machineProfile` slice and its sagas, first-connect profile creation, the bed from the active profile; machine command builders, `MachineLineRequested`, the laser pointer with its safety cut-offs, and the Move card, Laser pointer card and Machine profiles dialog.
- [[projects-and-svg-import]] - The project document (objects on the bed), undo and redo history, selection, SVG import saga and sanitiser, Dexie storage with autosave, the command queue, the `.webgrbl.json` file, and the top bar, Objects section and bed editing UI.
- [[layers-and-gcode]] - The laser palette (default entries, storage, Inkscape export), the SVG style resolver and paint detection, how layers are derived from colours (grey axis, shading layer, unknown colours), how the layers live in the project document (undo, autosave, layers in the project file since v2), the toolpath (line and fill modes), G-code writer and export, the motion timeline and time estimate, and the Toolpath view with its simulation.
- [[burn-preview]] - Materials with their test results per machine profile, Dexie storage, the `material` slice and saga, the project's material id, project file version 3, and the burn model with its meshes, worker, state and saga.
- [[localization]] - CSV-driven i18next setup, generator, drift check, guard tests.
- [[ui-components]] - Design tokens, the antd components and theme mapping, the custom views that stay (Panel, ComingSoon, ...), antd overlays and the overlay registry the Escape-to-STOP hotkey reads.
- [[tooling]] - ESLint 10 config, the `npm run check` gate, the dev-server worktree picker.
