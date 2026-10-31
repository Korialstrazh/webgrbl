# Architecture

How the webgrbl source is put together.

- [[app-shell]] - Entry point, CRUV layout, Redux store with class actions and sagas, GRBL slices and controller bridge, PWA service worker.
- [[grbl-engine]] - Framework-free GRBL protocol engine: protocol parsing, send queue, controller, stop controls, streaming, simulator, Web Serial transport, and its Redux saga bridge.
- [[machine-control]] - Machine profiles (bed size, power, S max, homing, air assist, jog speed): model, storage, the `machineProfile` slice and its sagas, first-connect profile creation, the bed from the active profile; machine command builders, `MachineLineRequested`, the laser pointer with its safety cut-offs, and the Move card, Laser pointer card and Machine profiles dialog.
- [[localization]] - CSV-driven i18next setup, generator, drift check, guard tests.
- [[ui-components]] - Design tokens, the antd components and theme mapping, the custom views that stay (Panel, ComingSoon, ...), antd overlays and the overlay registry the Escape-to-STOP hotkey reads.
- [[tooling]] - ESLint 10 config, the `npm run check` gate, the dev-server worktree picker.
