# Workbench shell

The app is one screen, the Workbench, made of five regions plus overlays. This page shows which container owns what and how to add a feature. Design details: `docs/wiki/architecture/app-shell.md` and `docs/wiki/architecture/ui-components.md`.

## Regions

`AppRoute` (`src/routes/AppRoute/`) composes the regions. From 1280 px they sit side by side (antd flex Layout); narrower they stack.

From 1280 px the design panel, the bed and the machine panel sit in an antd `Splitter` (`src/routes/AppRoute/PanelSplitter/`): the user drags the bars between them to resize them. The top bar and the status strip are not part of it.

The splitter sizes are controlled percentages, so the bars also work from the keyboard. antd's own drag bars cannot take the focus, so `SplitterHandles` (`src/views/SplitterHandles/`) lays one focusable `role="separator"` handle over each bar ("Resize the design panel", "Resize the machine panel", "Resize the console") with `aria-orientation` and the bar position, minimum and maximum in percent (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, from `getSplitterBarRange`). The arrow keys along the bar direction move it one `SPLITTER_KEYBOARD_STEP_REM` (1 rem), Home and End move it to the ends of its range (`getSplitterKeyTargetPercent`, `getMovedSplitterSizes` in `src/utils/layout/`), and the new sizes are stored like a drag (`PanelSizesResized`, `ConsoleSizeResized`). The handles let the pointer through to the antd bars; the grip shows on hover over a bar and on focus of a handle with the shared focus ring.

- Defaults: the design panel 20.5 rem (328 px, wide enough for a layer name such as "Shading (black)" on one line), the machine panel 22 rem, the bed takes the rest (`DESIGN_PANEL_DEFAULT_WIDTH_REM`, `MACHINE_PANEL_DEFAULT_WIDTH_REM` in `src/utils/layout.constants.ts`, matching `layout.scss`).
- Minimum widths: design 16.25 rem, bed 30 rem, machine 20 rem (`*_MIN_WIDTH_REM`); maximum widths: design and machine 28 rem (`*_MAX_WIDTH_REM`), so a wide screen gives its extra width to the bed. All are turned into pixels with the root font size, so they follow the user's font size.
- Stored sizes open as stored, except that a side panel whose share would break its minimum or maximum on this screen opens at that limit and the bed takes the difference (`getPanelDefaultSizes`). The limits also hold while dragging.
- When a drag ends, the sizes are stored as percentages of the workbench width in IndexedDB (table `appState`, key `panelSizes`, `PANEL_SIZES_REPOSITORY`), through `PanelSizesResized` and `panel.layout.saga.ts`. They are not stored on every move.
- At start the saga reads them (`PanelSizesLoaded`); the wide workbench waits for that read, so it opens with the stored sizes instead of jumping from the defaults. If the read neither resolves nor rejects within `PANEL_SIZES_READ_TIMEOUT_MS` (1,500 ms, a `race` with `delay`), the defaults apply, so the panels always appear. A stored value with the wrong count, a number that is not finite or not above 0, or a sum more than 1 away from 100 is ignored, and the defaults apply. A failed read or write is logged and the defaults or the current sizes stay.
- The console is a panel, not an overlay. The Console toggle button (`aria-pressed`) in the status strip dispatches `ConsoleOpenChanged` (`selectIsConsoleOpen`, not stored). In a wide window the middle column is a vertical `Splitter` (`src/routes/AppRoute/BedColumnSplitter/`): the bed on top (minimum 22 rem, `BED_PANEL_MIN_HEIGHT_REM`) and, while open, the console below it (`ConsoleDock`, minimum 11.5 rem, `CONSOLE_PANEL_MIN_HEIGHT_REM`: the header, three log lines and the input). Its height is a controlled percentage of the column, default 30 % (`CONSOLE_PANEL_DEFAULT_SIZE_PERCENT`); a drag end stores it through `ConsoleSizeResized` (`appState` key `consolePanelSize`). The bed panel stays mounted while the console opens and closes. In a narrow window one region shows at a time, and the open console is a short bottom sheet over it (`ConsoleDock`, absolute inside the regions box, at most 12 rem or 45 % tall, headed by the same terminal icon as its toggle), so Stop in the sticky bar stays free.
- Below 1280 px there is no splitter: the regions stack as before. Crossing the breakpoint mounts the panels again.

| Region | Container | Holds |
| --- | --- | --- |
| Top bar | `TopBar` | title, project and menus, undo/redo, autosave, update prompt, `ConnectionPill` with its `ConnectionPopover`; below 1000 px Machine profiles moves into `TopBarOverflowMenu` |
| Left | `DesignPanel` | Material (the select, Design view only), Layers (with Add test sample below the list, Design view only), Objects |
| Centre | `BedPanel` | header on one row at 1368 px in Design view (`ToolpathToolbar` in Toolpath view, the zoom cluster, `BedMoreToolsMenu` and last the view switch in a fixed grid slot, so it never moves between views; the tools take a row of their own below the switch when the bed is under 62 rem; `BedMoreToolsMenu` is a More button that lists the unbuilt Edit nodes, Align and 3D as disabled entries with a Soon tag and a one-line description), `BedViewport` (the zoomable `BedView` with `BedRulers` and `BedZoomControls`), `SimulationPlaybackBar` with the job size, `ToastStack`; host element for bed-region dialogs and drawers. The console panel sits below it |
| Right | `MachinePanel` | main task first: Status (its heading line only, with "Not connected" and a secondary (outlined) Connect button, while disconnected; the top-bar pill is the main way to connect; in a narrow panel the header group drops under the title instead of being cut, else readout plus Reset/Unlock), Job (a readiness row, then one filled action per state: the next step (on an empty bed the Design step shows "Show drop zone", which moves the focus to the empty-bed card's Import SVG rather than adding a third import button), or Start job once it can run; Frame job with its settings gear and a quiet, faintly outlined Export G-code below it; a line under the actions says why Start and Frame are off, unless the next-step button already asks for the same, as Connect laser does), Move and Laser pointer (each one line, "Connect to move" or "Connect to use" with a Show button, while disconnected, through `CollapsedCardToggle`; the hint stays beside Hide when the card is open, so the disabled controls still say why), so the disconnected panel fits a 703 px window without scrolling, in a scrolling area that fades out at the bottom when cut off, and STOP in a footer below it when wide |
| Bottom | `StatusStrip` | job size (a short "Open the Toolpath view" hint until the toolpath is ready) and estimate of the ready toolpath at every width, the live bed cursor in mm (hidden, keeping its room, until the pointer is over the bed), an Offline note while the browser has no network, Console toggle |

Empty readouts show one mark everywhere, the em dash (`MISSING_VALUE_TEXT`).

After a successful connect the connection popover closes by itself and focus returns to the pill; a failed connect keeps it open with the reason below the Connect button (`selectConnectFailureKey`). The connection pill shows only the laser connection: state, firmware, machine profile, port ("No port chosen" until the user picks one: no port, not even the simulated laser, is preselected on a fresh start; a port, or the simulated laser, the user connected to before is chosen again), and "Connect" while no laser is connected, the same label as the Status card button; its `aria-label` reads "Connection: ... Open the connection menu." The browser's network state is not in the pill. The popover's open state lives in the `uiOverlay` slice (`ConnectionPopoverOpenChanged`, `selectIsConnectionPopoverOpen`), so the Status card's Connect button opens the same popover as the pill.

## Add a feature to a region

Every unbuilt control is wrapped, one control at a time, in `ComingSoon` (`src/views/ComingSoon/`): the control itself is a real antd control with `disabled`, shown as plain muted text and icon with no fill and no outline, so with its tag it reads as a note and never as a working control, and a small neutral "Soon" tag (`SoonTag`, `src/views/SoonTag/`) sits right after it. The description shows in a tooltip below the control (so it never covers the top bar) on hover over the wrapper, because a disabled button fires no pointer events, or when the tag takes the keyboard focus. Unbuilt bed tools and views (Edit nodes, Align, 3D) are not shown one by one but listed in the bed header's More menu (`BED_COMING_SOON_TOOLS`), so the header stays one row. Never leave an enabled-looking control that does nothing on click, and never put two controls under one tag. Only real controls get a Soon tag: a Soon control is never a solid primary button, and a card, panel or menu that would hold nothing but a placeholder is left off the screen and listed as planned in `docs/wiki/product/ui-layout.md`. Keep the main screen at about four Soon tags. To build one:

1. Replace the `ComingSoon` block with your real component in the owning container (or a new child container next to it).
2. Put state and dispatching in a container; keep pure drawing in `src/views/`. Build controls from antd (`Button`, `Switch`, `Checkbox`, `Input`, `Segmented`, `Popover`, and selects and sliders as needed; dialogs and drawers only through `AppModal`, `BedRegionModal` or `BedRegionDrawer`) with prop values from `src/utils/antd.constants.ts`; do not write new self-built buttons or toggles. Machine controls use `size={ANTD_BUTTON_SIZE_LARGE}` (44 px), icon-only buttons need an `aria-label`, and a `Switch` sits in a `<label>` with visible text.
3. A control inside `ComingSoon` is `disabled` and has no handler. Once it is real, remove the wrapper and the `disabled`.
4. Add strings to the localization CSV (see `docs/howto/localization.md`) and use `t(DEFAULT.<KEY>)`.

## Bed zoom and pan

`BedViewport` (`src/containers/BedViewport/`) wraps `BedView` and owns the session-only viewport (`BedViewport` in `src/utils/bed/interfaces/`: zoom against the fitted bed and the view centre in bed SVG mm). It starts fitted and starts over when the bed size changes (`BedPanel` keys it by the bed size). `BedPanel` keeps the latest viewport in a `KeptBedViewportRef` and passes it as `keptViewportRef`, so leaving for the 3D view (which unmounts the viewport) and coming back keeps the zoom and pan; opening the console only changes the screen size, so a zoomed view keeps its zoom and a fitted one re-fits. A new bed size empties the kept viewport.

- Mouse wheel: zooms around the pointer, gently (`BED_WHEEL_ZOOM_PER_PIXEL` 0.0006: 6 to 15 % per notch) in a wide window; in a narrow window, where the page scrolls, only Ctrl or Cmd plus the wheel zooms (`useBedWheelZoom`).
- Pan: drag with the middle mouse button, or hold Space over the bed and drag (`useBedPanGesture`). The press is caught in the capture phase, so selecting and dragging objects keep their own left drag.
- Buttons and keys: the cluster in the bed header beside the view switch (`BedZoomControls`: bed colour, zoom out, the zoom in %, zoom in, Fit; `BedViewport` renders it through a portal into the header slot, so nothing floats over the drawing and Fit uses the whole bed box) and the keys `+` / `=`, `-` and `0` (`useBedZoomHotkeys`, same guards as the other app shortcuts).
- Fit and the zoom label (the readout is a plain percent; the Fit button shows as pressed while the view is fitted, and at phone width the readout is hidden so the group fits): Fit leaves `BED_FIT_MARGIN_PX` (16 px) free on each side of the bed. The zoom is relative to the fitted bed; a tooltip on the readout explains it. It is not a real 1:1 scale.
- Limits and steps: `MIN_BED_ZOOM` 0.5, `MAX_BED_ZOOM` 40, `BED_ZOOM_STEP_FACTOR` 1.25 (`src/utils/bed/bed.zoom.constants.ts`).

The zoom is the SVG `viewBox` (`getBedViewBox`, shaped like the view so a zoomed bed fills it), so every pointer position read through the SVG's screen matrix (`getBedSvgPoint` in `BedObjects`) is already in bed mm; new pointer code must read positions the same way, or through `getBedViewPoint` from the viewport, never from raw pixels. Markers divide their size by the zoom (`BedZoomContext`), handles follow the view box through `useBedPixelsPerMm`. The rulers sit in bands of their own (`BedRulers`, `getBedRulers`): a 1.25 rem band along the top (bed X) and the left (machine Y, its labels turned to run upwards), each with its own background, long ticks at the labelled steps and short ticks at a fifth of a step, and a corner square that names the unit. The drawing area starts where the bands end (`$bed-ruler-band-size` in `layout.scss`), so no label sits on the grid or the artwork and the first X and Y labels never meet; it is the element that takes the pointer and that `useBedScreenSize` measures, so pointer positions stay in bed mm. The labels keep a fixed `0.6875rem` font and a step that keeps them 3 rem apart. The status strip's Cursor readout reads the bed point through `BED_CURSOR_STORE`, which hands it on at most once per animation frame, outside redux.

## Overlays and Escape

- Never use a raw antd `Modal` or `Drawer`. Pick the wrapper by size:
  - **Large editing dialogs** (palette, machine profiles, open project) use `AppModal` (`src/containers/AppModal/`): rendered into the page body with a mask over the whole window, centred, `width: min(maxWidth, 100vw - 2rem)` (`getAppModalWidth`), and the body scrolls inside the window height, so the form and the close button are never cut off. Their two-column content stacks below 48 rem.
  - **Small confirmations** use `BedRegionModal` (`src/containers/BedRegionModal/`) and drawers use `BedRegionDrawer` (`src/containers/BedRegionDrawer/`): they render into the bed region below the bed header (the `bedBody` element of `BedPanel`), so they never cover the bed toolbar, with a mask over the bed only, so STOP stays visible and clickable (the drawer mask is clear, so the bed stays in view; a click on it still closes the drawer).
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

- Escape rule: `StopHotkey` stops the machine only when connected **and** no overlay is registered open. antd closes the overlay on Escape after `StopHotkey` (capture phase) has already seen it registered, so one press never does both. A forgotten registration would make Escape stop the machine while the overlay is open. Exception: when the app preference `isEscStoppingWithOverlayOpen` (`appPreferences` slice, stored in the `appState` row `escStopsWithOverlayOpen`, set from the `StopSettingsButton` gear beside STOP, whose popover points at the gear with an arrow and explains the option in one line) is on, `StopHotkey` also stops with an overlay open; antd still closes the overlay on the same press. It defaults to off.
- antd `Popover` moves no focus: move focus into it on open and back to the opener on close, as `ConnectionPopover` does. The dialog and drawer wrappers handle focus themselves: `AppModal` traps focus like any antd modal (STOP is under its mask; Escape closes the dialog first, a second Escape stops); `BedRegionModal` closes on Escape and returns focus to the opener but does not trap Tab (rc-dialog only locks focus when its wrap is `position: fixed`, and the wrapper makes it absolute), so STOP stays reachable by keyboard; the drawer traps focus while open, and STOP stays clickable with the mouse.
- Tests that open antd overlays render inside `AntdTestProvider` (`src/utils/test.support/antd.test.provider.tsx`), which turns antd motion off for jsdom.

## One STOP

Exactly one STOP is rendered: `StopButton`, an antd `Button` with `type="primary"`, `danger` and `size="large"`. `AppRoute` calls `useIsWideLayout()` once and passes `isWide` to `MachinePanel`: wide shows `StopButton` in a footer below the panel's scrolling cards (never over them), narrow shows `StickyStopBar` (rendered by `AppRoute`). Disconnected, STOP has the disabled look with a dark red outline (`--color-danger-disabled-border`), a readable `--color-text-muted` label and an unplugged icon, with a visually hidden "Laser not connected" description (`aria-describedby`); it turns solid red only when it can act; it shows its Esc shortcut (`aria-keyshortcuts="Escape"`). Do not add further STOP buttons or call the hook elsewhere for this.

## Tokens and fonts

- All colours, radii, spacing, fonts and sizes are CSS custom properties in `src/styles/tokens.scss`; use `var(--...)` only (never raw hex or px). Notable ones: `--color-danger-button` for danger buttons (contrast), `--target-min` (2.75 rem machine-control target), `--control-height`, `--focus-outline-width` / `--focus-outline-offset` with `--color-focus-ring`, `--radius-pill`.
- The bed work surface defaults to a light grey (`DEFAULT_BED_COLOUR`, `--color-bed-surface`, black artwork 9.2:1) while the area around it, the ruler bands and the panel chrome stay dark. Anything drawn on the bed uses the `--color-bed-*` tokens (grid, accent, laser head, danger, travel, ink, text, chip border), never the chrome colours. The grid tokens are mixed from the bed colour itself (darker on a light bed, lighter on a dark one), so the grid keeps the hue of any bed colour.

## Bed colour

The user picks the bed colour from the swatch button at the start of the zoom cluster in the bed header (`BedColourPicker`, an antd `ColorPicker` with named, keyboard-reachable preset buttons Grey (default), Light grey, White, Dark grey and Plywood (`BED_COLOUR_PRESETS`), a note that a very dark bed hides black artwork, and Reset to default). The button is a paint-bucket icon beside a bed-shaped swatch of the current colour with a light edge, so even a dark bed shows on the toolbar; like the zoom buttons beside it, it has no caption, and its tooltip and accessible name are "Bed colour". The Design / Toolpath / 3D captions use the body size in the full text colour. On a dark bed (`data-bed-tone="on-dark"`) the design view draws a light halo around every object (two crisp 1 px white drop shadows and a soft 3 px glow, `BedObjectGraphic` styles), so black fills and pure blue strokes stay legible; layer colours, the saved bed colour, the toolpath and the G-code do not change.

- State and storage: `bedAppearance` slice (`BedColourChanged`, `BedColourLoaded`, `selectBedColour`); `bed.appearance.saga.ts` reads `BED_COLOUR_REPOSITORY` at start under the panel sizes read timeout and stores changes app-wide (not per project) in `appState` key `bedColour`, debounced by `BED_COLOUR_STORE_DEBOUNCE_MS`. A missing or invalid stored value (`getValidBedColour`: six-digit hex only) keeps the default.
- Applying it: `BedPanel` sets `--color-bed-surface` inline on the bed area and `data-bed-tone` from `getBedOverlayTone`, which compares the colour's relative luminance (`getColourRelativeLuminance`) with `BED_OVERLAY_TONE_LUMINANCE_THRESHOLD` (0.179, where black and white marks contrast equally). `tokens.scss` defines an `--color-bed-on-light-*` and an `--color-bed-on-dark-*` set; `[data-bed-tone='on-dark']` switches the `--color-bed-*` tokens to the light marks. Each set keeps 4.5:1 for marks and text and 3:1 for markers against the default bed of its side (`tokens.contrast.test.ts`).
- A new mark on the bed must use a `--color-bed-*` token and get a value in both sets.
- New colours must keep 4.5:1 text contrast (`tokens.contrast.test.ts`). The focus ring (`--color-focus-ring`, the accent) must keep 3:1 on every surface; it is the one ring for every control: a global `:focus-visible` rule, and antd's `colorPrimaryBorder` and `lineWidthFocus` tokens.
- Splitter bars take their colours from the `Splitter` component tokens: a border-coloured line with a muted 2 rem grip at rest, the accent on hover and drag.
- Icons come from `@ant-design/icons` (outline set, pinned to the version antd resolves) and keep the control's `aria-label`; never use Unicode glyphs (arrows, crosses, carets, playback symbols) as icons. The jog pad turns one `ArrowUpOutlined` with its `rotate` prop (`JOG_ARROW_ROTATION_DEG`).
- Inter and JetBrains Mono are self-hosted in `src/styles/fonts/` (`fonts.scss`); do not load fonts from a CDN, the app works offline.
- antd components get the same look through `ANTD_THEME` (`src/utils/theme/antd.theme.ts`), whose values mirror `tokens.scss` (checked by `antd.theme.test.ts`). A new colour used by antd goes into both files.
- The default panel widths and the top bar (3.5 rem) and status strip (3 rem) heights live in `src/styles/layout.scss`.

## Bed sizing

`getBedDimensions` (`src/utils/bed/`) sizes the bed from the active machine profile (`selectActiveMachineProfile`), or else from GRBL `$130` (X) and `$131` (Y) max travel in mm:

- An active profile with a work area above 0 and at most 5000 mm sets the size, connected or not, with no placeholder.
- Each value must be a finite number above 0 and at most 5000 mm; otherwise a 400 mm square is drawn.
- Disconnected: the 400 mm square with the "no machine" placeholder. Connected without usable `$130`/`$131`: the square with the "size unknown" placeholder.
- `BedView` draws the head crosshair at the machine position and the work zero marker from the work coordinate offset. A head outside the bed is clamped to the nearest edge and the aria label says it is outside the bed.

## Icon notes

A short note shown as an info (or other) icon in a tinted circle (`TooltipNoteIcon`) opens its text in a popover on hover, on a tap or click, and on Enter or Space, so no note depends on hover alone.
