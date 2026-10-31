---
title: UI Components
created: 2026-10-31
---

# UI Components

The design tokens, the shared presentational components in `src/views/`, and the overlay registry that tells the Escape-to-STOP hotkey whether the user is in the main view or inside an overlay.

## Key Takeaways

- **Tokens.** `src/styles/tokens.scss` defines every colour, radius (6 / 8 / 10 / 14 px, written in rem), spacing step, font family and the 2.75 rem machine-control target (`--target-min`) as CSS custom properties on `:root`. Components use `var(--...)` only. Text contrast is held at 4.5:1 or better, checked by `tokens.contrast.test.ts`; danger buttons use `--color-danger-button` because the plain danger colour is too light under light text. `--color-focus-ring` is the shared keyboard focus outline. Fonts (Inter, JetBrains Mono) are self-hosted in `src/styles/fonts/`.
- **Base views.** `Button` (variants, sizes, types from `button.constants.ts`; large buttons meet the touch target), `IconButton` (icon only, label is the accessible name), `Toggle`, `SegmentedControl` and `Panel` (titled section with an optional header action). All are Redux-free and take values and callbacks as props.
- **ComingSoon.** Wraps a not-yet-built region: shows a "Coming soon" badge and description, renders the children `inert` with `aria-disabled="true"`, and stops click and key events in the capture phase, so nothing inside can dispatch an action.
- **Overlays are views.** `Popover` (`{ isOpen, onClose, anchorLabel, children }`, non-modal), `Dialog` (`{ isOpen, title, onClose, children, footerComponent? }`, modal) and `Drawer` (`{ isOpen, title, onClose, children }`, modal) render nothing while closed and never touch Redux. Dialog and Drawer have `role="dialog"`, `aria-modal="true"` and `aria-labelledby` the title; the Popover is labelled by `anchorLabel`.
- **Drawer position.** The Drawer carries the `bedSide` class: it is fixed to the left of the right machine panel (`right` equals the panel width), so it never covers STOP.
- **Shared overlay behaviour.** `useOverlayFocus` (`src/utils/hooks/use.overlay.focus.ts`) moves focus to the first focusable control (or the overlay itself) on open and returns it to the opener on close. Tab and Shift+Tab cycle inside Dialog and Drawer. Escape is handled on the overlay element (`onKeyDown`, not a window listener): it calls `onClose` and stops propagation, so the global STOP hotkey never sees it.
- **Overlay registry.** The `uiOverlay` slice (`ui.overlay.state.ts`) holds `openOverlayIds`. `OverlayOpened` and `OverlayClosed` are idempotent per id; `selectIsAnyOverlayOpen` is true while any id is open. The STOP hotkey must fire only when it is false.
- **Registration lives in containers.** `useOverlayRegistration(overlayId, isOpen)` dispatches opened/closed in an effect and closes on unmount. The container that owns an overlay calls it and passes `isOpen` to the view.

## Source

- `src/styles/tokens.scss`, `src/styles/fonts.scss`, `src/styles/fonts/`, `src/styles/tokens.contrast.test.ts`
- `src/views/Button/`, `src/views/IconButton/`, `src/views/Toggle/`, `src/views/SegmentedControl/`, `src/views/Panel/`
- `src/views/ComingSoon/`
- `src/views/Popover/`, `src/views/Dialog/`, `src/views/Drawer/`
- `src/utils/states/ui.overlay.state.ts`, `src/utils/states/interfaces/OverlayRegistryPayload.ts`
- `src/utils/hooks/use.overlay.registration.ts`, `src/utils/hooks/use.overlay.focus.ts`
