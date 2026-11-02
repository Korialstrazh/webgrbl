# Workbench shell

The app is one screen, the Workbench, made of five regions plus overlays. This page shows which container owns what and how to add a feature. Design details: `docs/wiki/architecture/app-shell.md` and `docs/wiki/architecture/ui-components.md`.

## Regions

`AppRoute` (`src/routes/AppRoute/`) composes the regions. From 1280 px they sit side by side (antd flex Layout); narrower they stack.

From 1280 px the design panel, the bed and the machine panel sit in an antd `Splitter` (`src/routes/AppRoute/PanelSplitter/`): the user drags the bars between them to resize them. The top bar and the status strip are not part of it.

- Defaults: the design panel 18.75 rem (300 px), the machine panel 22 rem, the bed takes the rest (`DESIGN_PANEL_DEFAULT_WIDTH_REM`, `MACHINE_PANEL_DEFAULT_WIDTH_REM` in `src/utils/layout.constants.ts`, matching `layout.scss`).
- Minimum widths: design 16.25 rem, bed 30 rem, machine 20 rem (`*_MIN_WIDTH_REM`), turned into pixels with the root font size, so they follow the user's font size.
- When a drag ends, the sizes are stored as percentages of the workbench width in IndexedDB (table `appState`, key `panelSizes`, `PANEL_SIZES_REPOSITORY`), through `PanelSizesResized` and `panel.layout.saga.ts`. They are not stored on every move.
- At start the saga reads them (`PanelSizesLoaded`); the wide workbench waits for that read, so it opens with the stored sizes instead of jumping from the defaults. If the read neither resolves nor rejects within `PANEL_SIZES_READ_TIMEOUT_MS` (1,500 ms, a `race` with `delay`), the defaults apply, so the panels always appear. A stored value with the wrong count, a number that is not finite or not above 0, or a sum more than 1 away from 100 is ignored, and the defaults apply. A failed read or write is logged and the defaults or the current sizes stay.
- The console is a panel, not an overlay. The Console switch in the status strip dispatches `ConsoleOpenChanged` (`selectIsConsoleOpen`, not stored). In a wide window the middle column is a vertical `Splitter` (`src/routes/AppRoute/BedColumnSplitter/`): the bed on top (minimum 22 rem, `BED_PANEL_MIN_HEIGHT_REM`) and, while open, the console below it (`ConsoleDock`, minimum 11.5 rem, `CONSOLE_PANEL_MIN_HEIGHT_REM`: the header, three log lines and the input). Its height is a controlled percentage of the column, default 30 % (`CONSOLE_PANEL_DEFAULT_SIZE_PERCENT`); a drag end stores it through `ConsoleSizeResized` (`appState` key `consolePanelSize`). The bed panel stays mounted while the console opens and closes. In a narrow window the regions stack with the bed first, then the open console, the design panel and the machine panel.
- Below 1280 px there is no splitter: the regions stack as before. Crossing the breakpoint mounts the panels again.

| Region | Container | Holds |
| --- | --- | --- |
| Top bar | `TopBar` | title, project and menus, undo/redo, autosave, update prompt, `ConnectionPill` with its `ConnectionPopover`; below 1000 px Machine profiles moves into `TopBarOverflowMenu` |
| Left | `DesignPanel` | Layers, Objects (the Material panel is planned and not shown) |
| Centre | `BedPanel` | header (editing tools in Design view, `ToolpathToolbar` in Toolpath view, view switch), `BedViewport` (the zoomable `BedView` with `BedRulers` and `BedZoomControls`), `SimulationPlaybackBar` with the job size, `ToastStack`; host element for bed-region dialogs and drawers. The console panel sits below it |
| Right | `MachinePanel` | main task first: Status (one "Not connected" line while disconnected, else readout plus Reset/Unlock), Job, Move, Laser pointer, in a scrolling area that fades out at the bottom when cut off, and STOP in a footer below it when wide |
| Bottom | `StatusStrip` | job size and estimate of the ready toolpath, the live bed cursor in mm, Console toggle |

## Add a feature to a region

Regions for unbuilt features are wrapped in `ComingSoon` (`src/views/ComingSoon/`): the control stays visible at 0.8 opacity and inert, with a small neutral "Soon" tag beside it; the description shows in a tooltip on hover or when the tag takes the keyboard focus, so the notice never adds a line. Only real controls get a Soon tag: a Soon control is never a solid primary button (Start job is a disabled default button), and a card, panel or menu that would hold nothing but a placeholder is left off the screen and listed as planned in `docs/wiki/product/ui-layout.md`. Keep the main screen at about four Soon tags. To build one:

1. Replace the `ComingSoon` block with your real component in the owning container (or a new child container next to it).
2. Put state and dispatching in a container; keep pure drawing in `src/views/`. Build controls from antd (`Button`, `Switch`, `Checkbox`, `Input`, `Segmented`, `Popover`, and selects and sliders as needed; dialogs and drawers only through `AppModal`, `BedRegionModal` or `BedRegionDrawer`) with prop values from `src/utils/antd.constants.ts`; do not write new self-built buttons or toggles. Machine controls use `size={ANTD_BUTTON_SIZE_LARGE}` (44 px), icon-only buttons need an `aria-label`, and a `Switch` sits in a `<label>` with visible text.
3. Never dispatch from inside `ComingSoon`: it renders children inert and stops events, and its handlers are `doNothing`. Once a block is real, remove the wrapper.
4. Add strings to the localization CSV (see `docs/howto/localization.md`) and use `t(DEFAULT.<KEY>)`.

## Bed zoom and pan

`BedViewport` (`src/containers/BedViewport/`) wraps `BedView` and owns the session-only viewport (`BedViewport` in `src/utils/bed/interfaces/`: zoom against the fitted bed and the view centre in bed SVG mm). It starts fitted and starts over when the bed size changes (`BedPanel` keys it by the bed size).

- Mouse wheel: zooms around the pointer in a wide window; in a narrow window, where the page scrolls, only Ctrl or Cmd plus the wheel zooms (`useBedWheelZoom`).
- Pan: drag with the middle mouse button, or hold Space over the bed and drag (`useBedPanGesture`). The press is caught in the capture phase, so the Select and Move tools keep their own left drag.
- Buttons and keys: the cluster in the bottom-right corner (`BedZoomControls`: zoom out, the zoom in %, zoom in, Fit) and the keys `+` / `=`, `-` and `0` (`useBedZoomHotkeys`, same guards as the other app shortcuts).
- Limits and steps: `MIN_BED_ZOOM` 0.5, `MAX_BED_ZOOM` 40, `BED_ZOOM_STEP_FACTOR` 1.25 (`src/utils/bed/bed.zoom.constants.ts`).

The zoom is the SVG `viewBox` (`getBedViewBox`, shaped like the view so a zoomed bed fills it), so every pointer position read through the SVG's screen matrix (`getBedSvgPoint` in `BedObjects`) is already in bed mm; new pointer code must read positions the same way, or through `getBedViewPoint` from the viewport, never from raw pixels. Markers divide their size by the zoom (`BedZoomContext`), handles follow the view box through `useBedPixelsPerMm`. The rulers are an HTML overlay (`BedRulers`, `getBedRulers`) with a fixed `0.6875rem` font and a label step that keeps labels 3 rem apart. The status strip's Cursor readout reads the bed point through `BED_CURSOR_STORE`, which hands it on at most once per animation frame, outside redux.

## Overlays and Escape

- Never use a raw antd `Modal` or `Drawer`. Pick the wrapper by size:
  - **Large editing dialogs** (palette, machine profiles, open project) use `AppModal` (`src/containers/AppModal/`): rendered into the page body with a mask over the whole window, centred, `width: min(maxWidth, 100vw - 2rem)` (`getAppModalWidth`), and the body scrolls inside the window height, so the form and the close button are never cut off. Their two-column content stacks below 48 rem.
  - **Small confirmations** use `BedRegionModal` (`src/containers/BedRegionModal/`) and drawers use `BedRegionDrawer` (`src/containers/BedRegionDrawer/`): they render into the bed region with a mask over the bed only, so STOP stays visible and clickable (the drawer mask is clear, so the bed stays in view; a click on it still closes the drawer).
  - All three register as open overlays themselves and close on Escape through `onClose`.

```tsx
<AppModal isOpen={isOpen} overlayIdPrefix={MATERIAL_DIALOG_OVERLAY_ID} maxWidth={MATERIAL_DIALOG_WIDTH} title={titleText} onClose={closeDialog}>
  {contentComponent}
</AppModal>
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
- antd `Popover` moves no focus: move focus into it on open and back to the opener on close, as `ConnectionPopover` does. The dialog and drawer wrappers handle focus themselves: `AppModal` traps focus like any antd modal (STOP is under its mask; Escape closes the dialog first, a second Escape stops); `BedRegionModal` closes on Escape and returns focus to the opener but does not trap Tab (rc-dialog only locks focus when its wrap is `position: fixed`, and the wrapper makes it absolute), so STOP stays reachable by keyboard; the drawer traps focus while open, and STOP stays clickable with the mouse.
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
