# Workbench shell

The app is one screen, the Workbench, made of five regions plus overlays. This page shows which container owns what and how to add a feature. Design details: `docs/wiki/architecture/app-shell.md` and `docs/wiki/architecture/ui-components.md`.

## Regions

`AppRoute` (`src/routes/AppRoute/`) composes the regions. From 1280 px they sit side by side (antd flex Layout); narrower they stack.

From 1280 px the design panel, the bed and the machine panel sit in an antd `Splitter` (`src/routes/AppRoute/PanelSplitter/`): the user drags the bars between them to resize them. The top bar and the status strip are not part of it.

- Defaults: the design panel 17.5 rem, the machine panel 22 rem, the bed takes the rest (`DESIGN_PANEL_DEFAULT_WIDTH_REM`, `MACHINE_PANEL_DEFAULT_WIDTH_REM` in `src/utils/layout.constants.ts`, matching `layout.scss`).
- Minimum widths: design 14 rem, bed 20 rem, machine 18 rem (`*_MIN_WIDTH_REM`), turned into pixels with the root font size, so they follow the user's font size.
- When a drag ends, the sizes are stored as percentages of the workbench width in IndexedDB (table `appState`, key `panelSizes`, `PANEL_SIZES_REPOSITORY`), through `PanelSizesResized` and `panel.layout.saga.ts`. They are not stored on every move.
- At start the saga reads them (`PanelSizesLoaded`); the wide workbench waits for that read, so it opens with the stored sizes instead of jumping from the defaults. A stored value with the wrong count, a number that is not finite or not above 0, or a sum more than 1 away from 100 is ignored, and the defaults apply. A failed read or write is logged and the defaults or the current sizes stay.
- The console overlay sits outside the splitter, so `AppRoute` puts the side column widths into `--design-column-width` and `--machine-column-width` on the workbench element, while dragging and after loading; the overlay lines up with them.
- Below 1280 px there is no splitter: the regions stack as before. Crossing the breakpoint mounts the panels again.

| Region | Container | Holds |
| --- | --- | --- |
| Top bar | `TopBar` | title, project and menus (coming soon), undo/redo, autosave, update prompt, `ConnectionPill` with its `ConnectionPopover` |
| Left | `DesignPanel` | Layers, Objects, Material (coming soon) |
| Centre | `BedPanel` | toolbar (coming soon), `BedView`, `ToastStack`; host element for dialogs and drawers |
| Right | `MachinePanel` | status, reset/unlock, Move, Laser pointer, Pre-flight, Job cards, STOP when wide |
| Bottom | `StatusStrip` | readouts (coming soon), Console toggle; the console opens as an overlay above the strip |

## Add a feature to a region

Regions for unbuilt features are wrapped in `ComingSoon` (`src/views/ComingSoon/`). To build one:

1. Replace the `ComingSoon` block with your real component in the owning container (or a new child container next to it).
2. Put state and dispatching in a container; keep pure drawing in `src/views/`. Build controls from antd (`Button`, `Switch`, `Checkbox`, `Input`, `Segmented`, `Popover`, and selects and sliders as needed; dialogs and drawers only through `BedRegionModal` / `BedRegionDrawer`) with prop values from `src/utils/antd.constants.ts`; do not write new self-built buttons or toggles. Machine controls use `size={ANTD_BUTTON_SIZE_LARGE}` (44 px), icon-only buttons need an `aria-label`, and a `Switch` sits in a `<label>` with visible text.
3. Never dispatch from inside `ComingSoon`: it renders children inert and stops events, and its handlers are `doNothing`. Once a block is real, remove the wrapper.
4. Add strings to the localization CSV (see `docs/howto/localization.md`) and use `t(DEFAULT.<KEY>)`.

## Overlays and Escape

- Always open a dialog with `BedRegionModal` (`src/containers/BedRegionModal/`) and a drawer with `BedRegionDrawer` (`src/containers/BedRegionDrawer/`); never use a raw antd `Modal` or `Drawer`. The wrappers render into the bed region with a mask over the bed only, so STOP stays visible and clickable; they register as open overlays themselves and close on Escape through `onClose`.

```tsx
<BedRegionModal isOpen={isOpen} overlayIdPrefix={MATERIAL_DIALOG_OVERLAY_ID} title={titleText} onClose={closeDialog}>
  {contentComponent}
</BedRegionModal>
```

- Every container that owns an antd `Popover` must call `useOverlayRegistration(OVERLAY_ID_PREFIX, isOpen)` from `src/utils/hooks/use.overlay.registration.ts`, with the same `isOpen` it passes to the overlay's `open`. The hook adds a unique id (prefix plus `useId()`) to the `uiOverlay` slice while open and removes it on close or unmount.

```tsx
useOverlayRegistration(CONNECTION_POPOVER_OVERLAY_ID, isOpen);

return (
  <Popover open={isOpen} onOpenChange={handleOpenChange} trigger={ANTD_POPOVER_TRIGGER_CLICK} content={contentComponent}>
    {children}
  </Popover>
);
```

- Escape rule: `StopHotkey` stops the machine only when connected **and** no overlay is registered open. antd closes the overlay on Escape after `StopHotkey` (capture phase) has already seen it registered, so one press never does both. A forgotten registration would make Escape stop the machine while the overlay is open.
- antd `Popover` moves no focus: move focus into it on open and back to the opener on close, as `ConnectionPopover` does. The dialog and drawer wrappers handle focus themselves: the dialog closes on Escape and returns focus to the opener but does not trap Tab (rc-dialog only locks focus when its wrap is `position: fixed`, and the wrapper makes it absolute), so STOP stays reachable by keyboard; the drawer traps focus while open, and STOP stays clickable with the mouse.
- Tests that open antd overlays render inside `AntdTestProvider` (`src/utils/test.support/antd.test.provider.tsx`), which turns antd motion off for jsdom.

## One STOP

Exactly one STOP is rendered: `StopButton`, an antd `Button` with `type="primary"`, `danger` and `size="large"`. `AppRoute` calls `useIsWideLayout()` once and passes `isWide` to `MachinePanel`: wide shows `StopButton` pinned at the bottom of the panel, narrow shows `StickyStopBar` (rendered by `AppRoute`). Do not add further STOP buttons or call the hook elsewhere for this.

## Tokens and fonts

- All colours, radii, spacing, fonts and sizes are CSS custom properties in `src/styles/tokens.scss`; use `var(--...)` only (never raw hex or px). Notable ones: `--color-danger-button` for danger buttons (contrast), `--target-min` (2.75 rem machine-control target), `--control-height`, `--focus-outline-width` / `--focus-outline-offset` with `--color-focus-ring`, `--radius-pill`.
- New colours must keep 4.5:1 text contrast (`tokens.contrast.test.ts`).
- Inter and JetBrains Mono are self-hosted in `src/styles/fonts/` (`fonts.scss`); do not load fonts from a CDN, the app works offline.
- antd components get the same look through `ANTD_THEME` (`src/utils/theme/antd.theme.ts`), whose values mirror `tokens.scss` (checked by `antd.theme.test.ts`). A new colour used by antd goes into both files.
- The default panel widths live in `src/styles/layout.scss`; the console overlay reads the current column widths from `--design-column-width` and `--machine-column-width`, which default to them.

## Bed sizing

`getBedDimensions` (`src/utils/bed/`) sizes the bed from the active machine profile (`selectActiveMachineProfile`), or else from GRBL `$130` (X) and `$131` (Y) max travel in mm:

- An active profile with a work area above 0 and at most 5000 mm sets the size, connected or not, with no placeholder.
- Each value must be a finite number above 0 and at most 5000 mm; otherwise a 400 mm square is drawn.
- Disconnected: the 400 mm square with the "no machine" placeholder. Connected without usable `$130`/`$131`: the square with the "size unknown" placeholder.
- `BedView` draws the head crosshair at the machine position and the work zero marker from the work coordinate offset. A head outside the bed is clamped to the nearest edge and the aria label says it is outside the bed.
