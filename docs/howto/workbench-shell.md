# Workbench shell

The app is one screen, the Workbench, made of five regions plus overlays. This page shows which container owns what and how to add a feature. Design details: `docs/wiki/architecture/app-shell.md` and `docs/wiki/architecture/ui-components.md`.

## Regions

`AppRoute` (`src/routes/AppRoute/`) composes the regions. From 1280 px they sit side by side (antd flex Layout); narrower they stack.

From 1280 px the design panel, the bed and the machine panel sit in an antd `Splitter` (`src/routes/AppRoute/PanelSplitter/`): the user drags the bars between them to resize them. The top bar and the status strip are not part of it.

- Defaults: the design panel 18.75 rem (300 px), the machine panel 22 rem, the bed takes the rest (`DESIGN_PANEL_DEFAULT_WIDTH_REM`, `MACHINE_PANEL_DEFAULT_WIDTH_REM` in `src/utils/layout.constants.ts`, matching `layout.scss`).
- Minimum widths: design 16.25 rem, bed 30 rem, machine 20 rem (`*_MIN_WIDTH_REM`), turned into pixels with the root font size, so they follow the user's font size.
- When a drag ends, the sizes are stored as percentages of the workbench width in IndexedDB (table `appState`, key `panelSizes`, `PANEL_SIZES_REPOSITORY`), through `PanelSizesResized` and `panel.layout.saga.ts`. They are not stored on every move.
- At start the saga reads them (`PanelSizesLoaded`); the wide workbench waits for that read, so it opens with the stored sizes instead of jumping from the defaults. If the read neither resolves nor rejects within `PANEL_SIZES_READ_TIMEOUT_MS` (1,500 ms, a `race` with `delay`), the defaults apply, so the panels always appear. A stored value with the wrong count, a number that is not finite or not above 0, or a sum more than 1 away from 100 is ignored, and the defaults apply. A failed read or write is logged and the defaults or the current sizes stay.
- The console is a panel, not an overlay. The Console switch in the status strip dispatches `ConsoleOpenChanged` (`selectIsConsoleOpen`, not stored). In a wide window the middle column is a vertical `Splitter` (`src/routes/AppRoute/BedColumnSplitter/`): the bed on top (minimum 22 rem, `BED_PANEL_MIN_HEIGHT_REM`) and, while open, the console below it (`ConsoleDock`, minimum 7.5 rem). Its height is a controlled percentage of the column, default 30 % (`CONSOLE_PANEL_DEFAULT_SIZE_PERCENT`); a drag end stores it through `ConsoleSizeResized` (`appState` key `consolePanelSize`). The bed panel stays mounted while the console opens and closes. In a narrow window the open console stacks below the bed.
- Below 1280 px there is no splitter: the regions stack as before. Crossing the breakpoint mounts the panels again.

| Region | Container | Holds |
| --- | --- | --- |
| Top bar | `TopBar` | title, project and menus, undo/redo, autosave, update prompt, `ConnectionPill` with its `ConnectionPopover`; below 1000 px Machine profiles and Materials move into `TopBarOverflowMenu` |
| Left | `DesignPanel` | Layers, Objects, Material (coming soon) |
| Centre | `BedPanel` | header (editing tools in Design view, `ToolpathToolbar` in Toolpath view, view switch), `BedView`, `SimulationPlaybackBar` with the job size, `ToastStack`; host element for dialogs and drawers. The console panel sits below it |
| Right | `MachinePanel` | status, reset/unlock, Move, Laser pointer, Pre-flight, Job cards in a scrolling area, and STOP in a footer below it when wide |
| Bottom | `StatusStrip` | readouts (cursor and job size coming soon), estimate, Console toggle |

## Add a feature to a region

Regions for unbuilt features are wrapped in `ComingSoon` (`src/views/ComingSoon/`): the control stays visible at 0.8 opacity and inert, with a small neutral "Soon" tag beside it; the description shows in a tooltip on hover or when the tag takes the keyboard focus, so the notice never adds a line. To build one:

1. Replace the `ComingSoon` block with your real component in the owning container (or a new child container next to it).
2. Put state and dispatching in a container; keep pure drawing in `src/views/`. Build controls from antd (`Button`, `Switch`, `Checkbox`, `Input`, `Segmented`, `Popover`, and selects and sliders as needed; dialogs and drawers only through `BedRegionModal` / `BedRegionDrawer`) with prop values from `src/utils/antd.constants.ts`; do not write new self-built buttons or toggles. Machine controls use `size={ANTD_BUTTON_SIZE_LARGE}` (44 px), icon-only buttons need an `aria-label`, and a `Switch` sits in a `<label>` with visible text.
3. Never dispatch from inside `ComingSoon`: it renders children inert and stops events, and its handlers are `doNothing`. Once a block is real, remove the wrapper.
4. Add strings to the localization CSV (see `docs/howto/localization.md`) and use `t(DEFAULT.<KEY>)`.

## Overlays and Escape

- Always open a dialog with `BedRegionModal` (`src/containers/BedRegionModal/`) and a drawer with `BedRegionDrawer` (`src/containers/BedRegionDrawer/`); never use a raw antd `Modal` or `Drawer`. The wrappers render into the bed region with a mask over the bed only, so STOP stays visible and clickable (the drawer mask is clear, so the bed stays in view; a click on it still closes the drawer); they register as open overlays themselves and close on Escape through `onClose`.

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

Exactly one STOP is rendered: `StopButton`, an antd `Button` with `type="primary"`, `danger` and `size="large"`. `AppRoute` calls `useIsWideLayout()` once and passes `isWide` to `MachinePanel`: wide shows `StopButton` in a footer below the panel's scrolling cards (never over them), narrow shows `StickyStopBar` (rendered by `AppRoute`). Disconnected, STOP keeps a red outline and red text, and it shows its Esc shortcut (`aria-keyshortcuts="Escape"`). Do not add further STOP buttons or call the hook elsewhere for this.

## Tokens and fonts

- All colours, radii, spacing, fonts and sizes are CSS custom properties in `src/styles/tokens.scss`; use `var(--...)` only (never raw hex or px). Notable ones: `--color-danger-button` for danger buttons (contrast), `--target-min` (2.75 rem machine-control target), `--control-height`, `--focus-outline-width` / `--focus-outline-offset` with `--color-focus-ring`, `--radius-pill`.
- New colours must keep 4.5:1 text contrast (`tokens.contrast.test.ts`). The focus ring (`--color-focus-ring`, the accent) must keep 3:1 on every surface; it is the one ring for every control: a global `:focus-visible` rule, and antd's `colorPrimaryBorder` and `lineWidthFocus` tokens.
- Splitter bars take their colours from the `Splitter` component tokens: a border-coloured line with a muted 2 rem grip at rest, the accent on hover and drag.
- Inter and JetBrains Mono are self-hosted in `src/styles/fonts/` (`fonts.scss`); do not load fonts from a CDN, the app works offline.
- antd components get the same look through `ANTD_THEME` (`src/utils/theme/antd.theme.ts`), whose values mirror `tokens.scss` (checked by `antd.theme.test.ts`). A new colour used by antd goes into both files.
- The default panel widths and the top bar (3.5 rem) and status strip (3 rem) heights live in `src/styles/layout.scss`.

## Bed sizing

`getBedDimensions` (`src/utils/bed/`) sizes the bed from the active machine profile (`selectActiveMachineProfile`), or else from GRBL `$130` (X) and `$131` (Y) max travel in mm:

- An active profile with a work area above 0 and at most 5000 mm sets the size, connected or not, with no placeholder.
- Each value must be a finite number above 0 and at most 5000 mm; otherwise a 400 mm square is drawn.
- Disconnected: the 400 mm square with the "no machine" placeholder. Connected without usable `$130`/`$131`: the square with the "size unknown" placeholder.
- `BedView` draws the head crosshair at the machine position and the work zero marker from the work coordinate offset. A head outside the bed is clamped to the nearest edge and the aria label says it is outside the bed.
