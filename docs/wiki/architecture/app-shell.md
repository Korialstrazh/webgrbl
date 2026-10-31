---
title: App Shell
created: 2026-10-30
---

# App Shell

The scaffold every feature builds on: entry point, Redux store with sagas, PWA service worker, and the top-level route.

## Key Takeaways

- **CRUV layout.** `src/containers` (components with logic), `src/routes` (one-off top-level pages), `src/utils` (infrastructure), `src/views` (pure presentational components; `ConsoleEntryList` is the first).
- **Redux with class actions.** Every action is a class extending `Action<TPayload>`; `classActionToPlainObjectMiddleware` runs first and turns instances into plain objects. Each state file holds its state, actions, reducer, sagas, and curried selectors in `#region` blocks.
- **GRBL slices.** `grblConnection` (status disconnected / connecting / connected / lost, granted ports, selected port, baud rate, firmware identity, RX buffer size, settings, build info), `machineStatus` (latest resolved status; cleared on disconnect), `grblConsole` (entries capped at 2,000, hidden status reports, command history of 100, app-added info and error lines by localisation key) and `toast` (identical open toasts merge into a repeat count; info toasts expire after 5 s). The slices hold only serialisable data.
- **Controller bridge.** `watchGrblController` (`grbl.controller.saga.ts`) owns the single `GrblController` in saga scope and turns requests into controller calls and controller events into actions and toasts; details in [[grbl-engine]] (Redux bridge). `newStore(dependencies?)` takes optional `GrblControllerSagaDependencies` for tests (simulated laser, in-memory storage) and defaults to the browser's, which work without Web Serial.
- **Connection UI.** `ConnectionPill` (top bar) shows a status dot and label (success connected, warning connecting, danger lost, muted disconnected), the firmware name and version when connected, the selected port label, an Online/Offline indicator and a "No Web Serial" indicator. Clicking it toggles `ConnectionPopover` (a `Popover` that registers itself with `useOverlayRegistration(CONNECTION_POPOVER_OVERLAY_ID, isOpen)`, so Escape never reaches STOP while it is open). The popover has the port select (localized "Simulated laser" plus granted ports as `USB <vid>:<pid>` in 4-digit lowercase hex, "Serial port" when the ids are unknown), the "Choose port..." button, the baud select and the Connect/Disconnect toggle (disabled while connecting). Without Web Serial only "Choose port..." is disabled and the popover shows the unsupported explanation; the simulated laser stays connectable. Port and baud selects are locked while connecting or connected.
- **Console UI.** `ConsolePanel` owns the input (Enter submits trimmed non-empty text; ArrowUp/ArrowDown walk `commandHistory` newest first, ArrowDown past the newest clears; disabled unless connected), the status-reports checkbox and the auto-scroll: the list follows new lines unless a scroll event left it more than 1 rem (converted through the root font size) above the bottom. `ConsoleEntryList` (view) renders entries with a `>`/`<` prefix, a time, a class per direction, `t()` for info/error lines (`messageKey` + `messageParameters`) and the `CONSOLE_REALTIME_<COMMAND>` label for realtime entries.
- **Route composition.** `AppRoute` is a five-region workbench: `TopBar` (title, project placeholder, `ComingSoon` menus, undo/redo and autosave readout, `AppUpdatePrompt`, `ConnectionPill`), `DesignPanel`, `BedPanel`, `MachinePanel` and `StatusStrip`. From 1280 px (`WIDE_LAYOUT_MEDIA_QUERY`, `useIsWideLayout`) the regions form a grid (design, bed, machine columns; the right panel width is `src/styles/layout.scss`, shared with `Drawer`); narrower they stack. `AppRoute` calls `useIsWideLayout()` once and passes `isWide` to `MachinePanel`, so one media-query subscription decides both STOP placements: exactly one STOP is rendered, `StopButton` pinned at the bottom of `MachinePanel` when wide, `StickyStopBar` (rendered by `AppRoute` only when not wide) otherwise. `LeavePageGuard` stays in the route and renders nothing; while `selectIsMachineMoving` is true it holds a `beforeunload` listener that calls `preventDefault()` and sets `returnValue`.
- **Machine panel.** `MachinePanel` stacks `Panel` cards: Status (`MachineStateReadout`: state label, work and machine position with 3 decimals, feed, power, dashes while there is no report; and `MachineResetUnlock`: Reset needs a connection, Unlock also needs Alarm), then `ComingSoon` cards Move (Home, Set zero, 3 x 3 jog pad with an Origin centre, steps 0.1 / 1 / 10 / 50 mm), Laser pointer (power slider, hold to fire, Frame job, air assist), Pre-flight check and Job (Start job). Everything inside a `ComingSoon` card is inert and dispatches nothing (handlers are `doNothing`).
- **Stop hotkey.** `StopHotkey` (rendered by `AppRoute`, renders nothing) listens for `keydown` on `window` in the capture phase and dispatches `MachineStopRequested` on a fresh Escape press (not `event.repeat`, not `isComposing`) only when `selectIsConnected` is true and `selectIsAnyOverlayOpen` is false. It reads the store at key-press time, so it never acts on stale overlay state; overlays close on Escape themselves (see [[ui-components]]).
- **Bed.** `BedPanel` (the central region) holds a `ComingSoon` toolbar (tools and the Design / Toolpath / 3D switch), `BedView` and `ToastStack`. `getBedDimensions(settings, isConnected)` takes the size from `$130` / `$131` (X / Y max travel, mm); each must be finite, above 0 and at most 5000 mm (`BED_MAX_TRAVEL_MM`), else a 400 mm square default is drawn with a placeholder: `no-machine` while disconnected, `size-unknown` when connected without usable settings. `BedView` (pure SVG, user unit mm, Y axis up) draws the grid (10 mm minor, 50 mm major), rulers, the work-zero marker (`workCoordinateOffset`) and the laser-head crosshair (`machinePosition`). `getBedHeadMarker` clamps the head to the bed and flags `isOutsideBed`, so a head outside the bed stays visible at the edge and the aria label says so.
- **Design panel.** `DesignPanel` holds `ComingSoon` Layers, Objects and Material panels, each with a one-line description of what will appear.
- **Status strip.** `StatusStrip` shows `ComingSoon` readouts (cursor, job size, estimate) and a Console toggle (collapsed by default). Open, it renders `ConsolePanel` in a 14 rem overlay anchored above the strip (z-index 30), drawn over the bed without resizing it.
- **Toasts.** `ToastStack` is mounted inside `BedPanel` and anchored to the top right of the bed area (z-index 40, above the console overlay); the stack ignores pointer events except on the toasts themselves.
- **Browser environment state.** `browserEnvironment` tracks `isOnline` (fed by a saga listening to `online`/`offline` events) and `isWebSerialSupported` (`'serial' in navigator`). `ConnectionPill` shows both.
- **PWA.** `vite-plugin-pwa` in `generateSW` mode precaches all built assets. `registerType: 'prompt'` means a new version is never activated automatically; `AppUpdatePrompt` asks the user. In tests, `vitest.setup.ts` mocks `virtual:pwa-register/react`.
- **Strings.** Every visible string comes from `t(DEFAULT.<KEY>)`; see [[localization]].
- **Types.** `tsconfig.json` loads `vite/client`, `vite-plugin-pwa/react`, and `w3c-web-serial` (types for `navigator.serial`).

## Source

- `src/main.tsx`
- `src/routes/AppRoute/`
- `src/containers/StopHotkey/`, `src/containers/BedPanel/`, `src/views/BedView/`, `src/utils/bed/`, `src/utils/browser/browser.events.constants.ts`, `src/utils/missing.value.constants.ts`
- `src/containers/TopBar/`, `DesignPanel/`, `MachinePanel/` (with `MachineStateReadout/`, `MachineResetUnlock/`, `MoveCard/`, `LaserCard/`, `PreflightCard/`, `StartJobCard/`), `StatusStrip/`, `ToastStack/`, `src/utils/do.nothing.ts`, `StopButton/`, `StickyStopBar/`, `src/utils/hooks/use.is.wide.layout.ts`, `src/utils/layout.constants.ts`, `src/styles/layout.scss`, `src/utils/test.support/match.media.mock.ts`
- `src/containers/ConnectionPill/`, `src/containers/ConnectionPopover/`
- `src/containers/AppUpdatePrompt/`
- `src/containers/ConsolePanel/`, `src/containers/LeavePageGuard/`, `src/views/ConsoleEntryList/`, `src/utils/browser/get.root.font.size.pixels.ts`
- `src/utils/states/ui.overlay.state.ts`, `src/utils/hooks/use.overlay.registration.ts`
- `src/utils/states/` (`action.ts`, `action.type.prefixer.ts`, `class.action.to.plain.object.middleware.ts`, `browser.environment.state.ts`, `root.reducer.ts`, `root.saga.ts`, `new.store.ts`)
- `src/utils/states/grbl.connection.state.ts`, `machine.status.state.ts`, `grbl.console.state.ts`, `toast.state.ts`, `toast.constants.ts`
- `src/utils/states/grbl.controller.saga.ts`, `browser.grbl.controller.saga.dependencies.ts`, `interfaces/GrblControllerSagaDependencies.ts`
- `vite.config.ts`
- `vitest.setup.ts`
- `tsconfig.json`
