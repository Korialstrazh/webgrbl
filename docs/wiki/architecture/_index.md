# Architecture

How the webgrbl source is put together.

- [[app-shell]] - Entry point, CRUV layout, Redux store with class actions and sagas, PWA service worker.
- [[grbl-engine]] - Framework-free GRBL protocol engine: constants, line framing, line preparation, EEPROM detection.
- [[localization]] - CSV-driven i18next setup, generator, drift check, guard tests.
- [[tooling]] - ESLint 10 config, the `npm run check` gate, the dev-server worktree picker.
