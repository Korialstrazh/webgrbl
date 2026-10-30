---
title: App Shell
created: 2026-10-30
---

# App Shell

The scaffold every feature builds on: entry point, Redux store with sagas, PWA service worker, and the top-level route.

## Key Takeaways

- **CRUV layout.** `src/containers` (components with logic), `src/routes` (one-off top-level pages), `src/utils` (infrastructure), `src/views` (pure presentational components, added when the first one exists).
- **Redux with class actions.** Every action is a class extending `Action<TPayload>`; `classActionToPlainObjectMiddleware` runs first and turns instances into plain objects. Each state file holds its state, actions, reducer, sagas, and curried selectors in `#region` blocks.
- **Browser environment state.** `browserEnvironment` tracks `isOnline` (fed by a saga listening to `online`/`offline` events) and `isWebSerialSupported` (`'serial' in navigator`). `BrowserStatusBar` shows both.
- **PWA.** `vite-plugin-pwa` in `generateSW` mode precaches all built assets. `registerType: 'prompt'` means a new version is never activated automatically; `AppUpdatePrompt` asks the user. In tests, `vitest.setup.ts` mocks `virtual:pwa-register/react`.
- **Types.** `tsconfig.json` loads `vite/client`, `vite-plugin-pwa/react`, and `w3c-web-serial` (types for `navigator.serial`).

## Source

- `src/main.tsx`
- `src/routes/AppRoute/`
- `src/containers/BrowserStatusBar/`
- `src/containers/AppUpdatePrompt/`
- `src/utils/states/` (`action.ts`, `action.type.prefixer.ts`, `class.action.to.plain.object.middleware.ts`, `browser.environment.state.ts`, `root.reducer.ts`, `root.saga.ts`, `new.store.ts`)
- `vite.config.ts`
- `vitest.setup.ts`
- `tsconfig.json`
