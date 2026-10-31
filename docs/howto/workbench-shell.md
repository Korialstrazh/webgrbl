# Workbench shell

The app is one screen, the Workbench, made of five regions plus overlays. This page shows which container owns what and how to add a feature. Design details: `docs/wiki/architecture/app-shell.md` and `docs/wiki/architecture/ui-components.md`.

## Regions

`AppRoute` (`src/routes/AppRoute/`) composes the regions. From 1280 px they form a grid; narrower they stack.

| Region | Container | Holds |
| --- | --- | --- |
| Top bar | `TopBar` | title, project and menus (coming soon), undo/redo, autosave, update prompt, `ConnectionPill` with its `ConnectionPopover` |
| Left | `DesignPanel` | Layers, Objects, Material (coming soon) |
| Centre | `BedPanel` | toolbar (coming soon), `BedView`, `ToastStack` |
| Right | `MachinePanel` | status, reset/unlock, Move, Laser pointer, Pre-flight, Job cards, STOP when wide |
| Bottom | `StatusStrip` | readouts (coming soon), Console toggle; the console opens as an overlay above the strip |

## Add a feature to a region

Regions for unbuilt features are wrapped in `ComingSoon` (`src/views/ComingSoon/`). To build one:

1. Replace the `ComingSoon` block with your real component in the owning container (or a new child container next to it).
2. Put state and dispatching in a container; keep pure drawing in `src/views/`.
3. Never dispatch from inside `ComingSoon`: it renders children inert and stops events, and its handlers are `doNothing`. Once a block is real, remove the wrapper.
4. Add strings to the localization CSV (see `docs/howto/localization.md`) and use `t(DEFAULT.<KEY>)`.

## Overlays and Escape

- Every Popover, Dialog or Drawer owner (a container) must call `useOverlayRegistration(OVERLAY_ID_PREFIX, isOpen)` from `src/utils/hooks/use.overlay.registration.ts`. The hook adds a unique id (prefix plus `useId()`) to the `uiOverlay` slice while open and removes it on close or unmount.

```tsx
useOverlayRegistration(CONNECTION_POPOVER_OVERLAY_ID, isOpen);

return <Popover isOpen={isOpen} onClose={onClose} anchorLabel={label}>...</Popover>;
```

- Escape rule: `StopHotkey` stops the machine only when connected **and** no overlay is registered open. Overlays close on Escape themselves and stop the event, so one press never does both. A forgotten registration would make Escape stop the machine while the overlay is open.

## One STOP

Exactly one STOP is rendered. `AppRoute` calls `useIsWideLayout()` once and passes `isWide` to `MachinePanel`: wide shows `StopButton` pinned at the bottom of the panel, narrow shows `StickyStopBar` (rendered by `AppRoute`). Do not add further STOP buttons or call the hook elsewhere for this.

## Tokens and fonts

- All colours, radii, spacing, fonts and sizes are CSS custom properties in `src/styles/tokens.scss`; use `var(--...)` only (never raw hex or px). Notable ones: `--color-danger-button` for danger buttons (contrast), `--target-min` (2.75 rem machine-control target), `--control-height`, `--focus-outline-width` / `--focus-outline-offset` with `--color-focus-ring`, `--radius-pill`.
- New colours must keep 4.5:1 text contrast (`tokens.contrast.test.ts`).
- Inter and JetBrains Mono are self-hosted in `src/styles/fonts/` (`fonts.scss`); do not load fonts from a CDN, the app works offline.
- Panel widths shared with overlays (`Drawer` avoids the machine panel) live in `src/styles/layout.scss`.

## Bed sizing

`getBedDimensions` (`src/utils/bed/`) sizes the bed from GRBL `$130` (X) and `$131` (Y) max travel in mm:

- Each value must be a finite number above 0 and at most 5000 mm; otherwise a 400 mm square is drawn.
- Disconnected: the 400 mm square with the "no machine" placeholder. Connected without usable `$130`/`$131`: the square with the "size unknown" placeholder.
- `BedView` draws the head crosshair at the machine position and the work zero marker from the work coordinate offset. A head outside the bed is clamped to the nearest edge and the aria label says it is outside the bed.
