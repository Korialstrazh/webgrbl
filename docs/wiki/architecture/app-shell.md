---
title: App Shell
created: 2026-10-30
---

# App Shell

The scaffold every feature builds on: entry point, Redux store with sagas, PWA service worker, and the top-level route.

## Key Takeaways

- **CRUV layout.** `src/containers` (components with logic), `src/routes` (one-off top-level pages), `src/utils` (infrastructure), `src/views` (pure presentational components, added when the first one exists).
- **Redux with class actions.** Every action is a class extending `Action<TPayload>`; `classActionToPlainObjectMiddleware` runs first and turns instances into plain objects. Each state file holds its state, actions, reducer, sagas, and curried selectors in `#region` blocks.
- **GRBL slices.** `grblConnection` (status disconnected / connecting / connected / lost, granted ports, selected port, baud rate, firmware identity, RX buffer size, settings, build info), `machineStatus` (latest resolved status; cleared on disconnect), `grblConsole` (entries capped at 2,000, hidden status reports, command history of 100, app-added info and error lines by localisation key) and `toast` (identical open toasts merge into a repeat count; info toasts expire after 5 s). The slices hold only serialisable data.
- **Controller bridge.** `watchGrblController` (`grbl.controller.saga.ts`) owns the single `GrblController` in saga scope and turns requests into controller calls and controller events into actions and toasts; details in [[grbl-engine]] (Redux bridge). `newStore(dependencies?)` takes optional `GrblControllerSagaDependencies` for tests (simulated laser, in-memory storage) and defaults to the browser's, which work without Web Serial.
- **Browser environment state.** `browserEnvironment` tracks `isOnline` (fed by a saga listening to `online`/`offline` events) and `isWebSerialSupported` (`'serial' in navigator`). `BrowserStatusBar` shows both.
- **PWA.** `vite-plugin-pwa` in `generateSW` mode precaches all built assets. `registerType: 'prompt'` means a new version is never activated automatically; `AppUpdatePrompt` asks the user. In tests, `vitest.setup.ts` mocks `virtual:pwa-register/react`.
- **Strings.** Every visible string comes from `t(DEFAULT.<KEY>)`; see [[localization]].
- **Types.** `tsconfig.json` loads `vite/client`, `vite-plugin-pwa/react`, and `w3c-web-serial` (types for `navigator.serial`).

## Source

- `src/main.tsx`
- `src/routes/AppRoute/`
- `src/containers/BrowserStatusBar/`
- `src/containers/AppUpdatePrompt/`
- `src/utils/states/` (`action.ts`, `action.type.prefixer.ts`, `class.action.to.plain.object.middleware.ts`, `browser.environment.state.ts`, `root.reducer.ts`, `root.saga.ts`, `new.store.ts`)
- `src/utils/states/grbl.connection.state.ts`, `machine.status.state.ts`, `grbl.console.state.ts`, `toast.state.ts`, `toast.constants.ts`
- `src/utils/states/grbl.controller.saga.ts`, `browser.grbl.controller.saga.dependencies.ts`, `interfaces/GrblControllerSagaDependencies.ts`
- `vite.config.ts`
- `vitest.setup.ts`
- `tsconfig.json`
