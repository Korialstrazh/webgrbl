---
title: UI Components
created: 2026-10-31
---

# UI Components

The design tokens, the antd components and the antd theme that gives them our look, the few views that stay custom in `src/views/`, and the overlay registry that tells the Escape-to-STOP hotkey whether the user is in the main view or inside an overlay.

## Key Takeaways

- **Tokens.** `src/styles/tokens.scss` defines every colour, radius (6 / 8 / 10 / 14 px, written in rem), spacing step, font family and the 2.75 rem machine-control target (`--target-min`) as CSS custom properties on `:root`. Our SCSS uses `var(--...)` only. Text contrast is held at 4.5:1 or better, checked by `tokens.contrast.test.ts`; danger buttons use `--color-danger-button` (with hover and active steps) because the plain danger colour is too light under light text. `--color-focus-ring`, `--focus-outline-width` and `--focus-outline-offset` make up the keyboard focus outline of our own controls. Fonts (Inter, JetBrains Mono) are self-hosted in `src/styles/fonts/`.
- **antd for controls.** Buttons, switches, segmented selectors, popovers, modals and drawers are antd components (`Button`, `Switch`, `Segmented`, `Popover`, `Modal`, `Drawer`), used directly in the containers. antd prop values (sizes, types, triggers, placements) come from `src/utils/antd.constants.ts`. Mapping of the former self-built views:
  - text buttons: antd `Button` (default type for the bordered button, `type="primary"` for the main action, `type="text"` for menu-like actions); machine controls use `size="large"`;
  - icon-only buttons: antd `Button` with `icon` and an `aria-label` as the accessible name;
  - STOP: `type="primary"`, `danger`, `size="large"`, plus a `min-height: var(--target-min)` floor in `StopButton/styles.module.scss`;
  - toggles: antd `Switch` inside a `<label>` with visible text, which gives the switch (role `switch`) its accessible name;
  - segmented selectors: antd `Segmented` with `aria-label` (a `radiogroup` of native radios sharing one name, so one tab stop; arrow keys move the selection and wrap, pinned by `src/utils/antd.segmented.keyboard.test.tsx`).
- **Theme mapping.** `ANTD_THEME` (`src/utils/theme/antd.theme.ts`) uses the dark algorithm and takes every value from the tokens: global tokens (accent with hover and active, surfaces, border, text, status colours, danger-button shades as `colorError*`, disabled text and background, radius 8, Inter, control height 36) and component tokens. The dark algorithm derives darker shades from the seed colours, so `Button` and `Switch` get the exact accent and danger values back as component tokens. `Button` also gets dark text on the accent (`primaryColor` = `--color-bg`), light text on danger (`dangerColor` = `--color-text`), the surface-2 default background with the surface hover and active steps, label weight 600 and `controlHeightLG` = 44 px (`--target-min`), so every large button is a full touch target. `Segmented` gets a surface-1 track, muted items and a surface-3 selected item. `antd.theme.test.ts` checks every value against `tokens.scss`.
- **What stays custom.** `Panel` (titled section with an optional header action; kept as our own view to keep the approved card look), `ComingSoon`, `BedView` (the bed drawn to scale as SVG, see [[app-shell]]) and `ConsoleEntryList`. All are Redux-free. The connection pill button and the native port and baud `<select>`s in the connection popover are also still our own markup and styles.
- **ComingSoon.** Wraps a not-yet-built region, including antd controls: shows a "Coming soon" badge and description, renders the children `inert` with `aria-disabled="true"`, and stops click and key events in the capture phase, so nothing inside can dispatch an action. antd buttons and switches render real `<button>`s; the capture-phase blocking is tested with both.
- **antd overlays and Escape.** antd closes the top-most open `Popover`, `Modal` or `Drawer` on Escape from a `keydown` listener on `window` in the bubble phase (IME composition ignored). `StopHotkey` listens on `window` in the capture phase, so it always runs first and still sees the overlay registered as open; then the overlay closes, its owner's `isOpen` turns false and the registration is removed. One press never both closes an overlay and stops the machine; the next Escape stops again.
- **Focus.** antd `Modal` and `Drawer` trap focus and return it on close. antd `Popover` moves no focus, so `ConnectionPopover` does it: once the popover has opened (`afterOpenChange`) focus moves to its first enabled control (or the popover itself, `tabIndex=-1`) with `preventScroll`, and when it closes while focus is inside, focus returns to the element that opened it. The former `useOverlayFocus` hook is gone.
- **Drawer position.** A future drawer must open on the bed side and never cover the machine panel or STOP: render the antd `Drawer` into the bed region with `getContainer` (the `BedPanel` content is `position: relative`) and a placement inside it, not over the whole window.
- **Overlay registry.** The `uiOverlay` slice (`ui.overlay.state.ts`) holds `openOverlayIds`. `OverlayOpened` and `OverlayClosed` are idempotent per id; `selectIsAnyOverlayOpen` is true while any id is open. The STOP hotkey fires only when it is false.
- **Registration lives in containers.** `useOverlayRegistration(overlayIdPrefix, isOpen)` combines the prefix with React `useId()` into a unique id per mounted component (the registry is a set without reference counts, so a shared id would let one overlay's close hide another still-open one), dispatches opened/closed in an effect and closes on unmount. Every container that owns an antd `Popover`, `Modal` or `Drawer` calls it with the same `isOpen` it passes to the overlay's `open`.
- **Tests.** jsdom has no `ResizeObserver` (`vitest.setup.ts` installs a silent one from `resize.observer.mock.ts`) and never fires animation end events, so tests that open antd overlays render inside `AntdTestProvider` (`src/utils/test.support/antd.test.provider.tsx`: the app theme with `motion: false`); otherwise an overlay takes a full second to finish opening or closing.

## Source

- `src/styles/tokens.scss`, `src/styles/fonts.scss`, `src/styles/fonts/`, `src/styles/tokens.contrast.test.ts`
- `src/utils/theme/antd.theme.ts`, `src/utils/antd.constants.ts`, `src/utils/antd.segmented.keyboard.test.tsx`
- `src/views/Panel/`, `src/views/ComingSoon/`, `src/views/BedView/`, `src/views/ConsoleEntryList/`
- `src/containers/ConnectionPopover/`, `src/containers/StopButton/`, `src/containers/StopHotkey/`
- `src/utils/states/ui.overlay.state.ts`, `src/utils/states/interfaces/OverlayRegistryPayload.ts`
- `src/utils/hooks/use.overlay.registration.ts`
- `src/utils/test.support/antd.test.provider.tsx`, `src/utils/test.support/resize.observer.mock.ts`, `vitest.setup.ts`
