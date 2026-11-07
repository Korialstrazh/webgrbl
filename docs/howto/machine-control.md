# Machine control

The Move card, the Laser pointer card and the Machine profiles dialog drive a GRBL laser by hand. This page shows how a control sends a command, how the pointer stays safe, and how profiles work. Design details: `docs/wiki/architecture/machine-control.md`.

## What the user gets

- **Position card** (`src/containers/MachinePanel/PositionCard/`), right above Move (in the narrow layout too): the work position (target icon) and the laser position (home icon) on X, Y and Z, three decimals, updated from each status report. It only reads `selectMachineStatus`; nothing is sent. While no laser is connected it shows only its heading with a plug badge ("Connect to see the position", a click opens the connection popover) and no numbers. It holds positions only.
- **Status card** (`src/containers/MachinePanel/MachineStatusCard/`), right above Position and shown only while connected: compact (`Panel isCompact`): its header line holds `MachineStatusRow/`, feed (gauge icon) in mm/min and power (bolt icon) as a percent of S max (the same figure as the laser chip), each with a short visible caption and the value in full text colour, then the state as a coloured dot and word (`MachineStateReadout`); its one body row holds the small Reset (rotate icon) and Unlock (unlock icon) buttons; Unlock is the primary (filled) button while it can be pressed, in Alarm, and wears the locked look (solid grey outline, dark fill) otherwise. Position is compact too, so Move starts higher on a 900 px screen.
- **Move card** (`src/containers/MachinePanel/MoveCard/`): while no laser is connected one line, "Connect to move", with a Show button that opens the disabled controls (the "Connect to move" hint stays beside Hide while they are open); the controls (`MoveControls/`) are centred: a 3 x 3 jog pad, step sizes 0.1 / 1 / 10 / 50 mm, a jog speed saved to the active profile (it accepts an empty or unfinished value while you type and corrects it only on blur or Enter: empty gives the saved speed back, a number past 100–10000 mm/min is held at the limit), and, beside the jog speed in one row, Set zero (target icon) and Home (home icon) when the profile has homing switches. Unlock and Reset are in the Status card.
- **Double-click to move** (off by default): the gear beside STOP has the checkbox "Double-click bed moves laser" (its detail behind an info icon) (`BedDoubleClickMovePreferenceChanged`, stored app-wide in the IndexedDB `appState` row `bedDoubleClickMovesLaser`, read at start like the Esc choice). When on, a double-click on empty bed in the Design view (the `BedObjects` surface, never an object) sends one absolute jog to that point at the Move panel's jog speed. It is silently ignored unless connected and `Idle`, with no job or frame running, the pointer off and no overlay open. The laser stays off, and STOP and Escape cancel it like any jog.
- **Laser chip** (`src/containers/LaserStateChip/`, top bar, only while connected): a read-only state from `selectLaserChipState` and `selectLaserChipPowerPercent`, sending nothing. "Laser off" with the laser icon in green when the last report shows zero power; "Firing nn %" in amber (the reported power as a percent of S max, at most 100) when it shows power; "Pointer on" in red while the pointer is held; "Job running" during a job between burns; "Power unknown" before the first report. The tooltip says it is the last report. The short word stays beside the icon below 1000 px (the connection pill is compact there) and from 1280 px; between those widths and at phone width the chip keeps its icon and colour.
- **Laser pointer card** (`src/containers/MachinePanel/LaserCard/`): while no laser is connected one line, "Connect to use", with a Show button (both cards use `CollapsedCardToggle` from `src/views/`); the controls are power 0.1..5 % of S max (the connected laser's reported `$30`, else the active profile's), a hold-to-fire button with a bulb icon, a short line "Off on release, after 10 s" whose info icon opens the full firmware note on hover, tap or keyboard focus, and an air assist switch for profiles with air assist. Frame job sits on the Job card below Export G-code and Start job (see `docs/howto/running-jobs.md`).
- **Machine profiles** (`src/containers/MachineProfilesDialog/`, opened from the top bar): bed size, rated power, `$30`, origin corner, homing switches, air assist and jog speed per laser, with import, export and "Read from laser" (disabled with a tooltip while no laser is connected). The S max field explains `$30` from an info icon, and Delete stays disabled for the only profile. Saving a profile makes it active only while no profile is active; it never replaces an active one. Each other row has a **Use** button, and the active row shows a filled Active badge. The active profile's name is shown in the connection pill.

## Send a command from a control

Build the line with a pure builder from `src/utils/machine/` and dispatch `MachineLineRequested`. Controls never talk to the controller directly, and the line is dropped while disconnected and during a job run.

```tsx
const { canJog }: MoveAvailability = getMoveAvailability({
  isConnected,
  machineState: machineStatus?.machineState,
  hasHomingSwitches,
  isPointerFiring,
  isJobRunActive,
});

<Button size={ANTD_BUTTON_SIZE_LARGE} disabled={!canJog} onClick={() => {
  dispatch(new MachineLineRequested({ line: getJogCommand(JOG_DIRECTION.EAST, 10, 1500) }));
}}>
```

- Lines: `$J=G91 G21 X10 F1500` (jog), `$J=G90 G21 X0 Y0 F...` (go to work zero), `$J=G90 G21 X120 Y80 F1500` (bed double-click, `getBedDoubleClickJogCommand`, which gates and clamps in one pure function), `$H` (home), `G10 L20 P1 X0 Y0` (set zero, kept by Stop and reset), `M8` / `M9` (air).
- Gate every control with `getMoveAvailability` or `getCanFireLaserPointer`; a disabled button is the only guard the UI adds, the saga checks again where it matters.
- Numbers go through `getFormattedGcodeNumber` (3 decimals, never `-0`, never locale text).

### Move to a bed point

```ts
const line: string | undefined = getBedDoubleClickJogCommand({
  isPreferenceOn, isConnected, machineState, isJobRunActive, isPointerFiring, isOverlayOpen,
  bedPoint: getBedMachinePoint(svgPoint, bedHeightMm),
  machineArea: selectToolpathMachineArea(state),
  feedRate: activeProfile?.jogFeedRate ?? DEFAULT_MACHINE_JOG_FEED_RATE,
});
```

- The bed point becomes a work position through `getClampedWorkPositionFromBedPoint`: the same origin mapping the bed uses to draw the head (`getBedPointFromWorkPosition`; it only mirrors axes, so it is its own inverse), then held inside the profile's work area. Z is never sent.
- Read the state at the moment of the click (`useAppStore().getState()`, see `useBedDoubleClickMove`), not from the last render.

## Add a pointer control safely

The pointer is a hold: `LaserPointerFireRequested` on press, `LaserPointerReleaseRequested` on release. The saga (`src/utils/states/laser.pointer.saga.ts`) switches it off on the first of: release, window blur, hidden tab, disconnect or lost connection, Stop, an alarm, and 10 seconds.

- A fire control must request release on every way a press can end: `pointerup`, `pointerleave`, `pointercancel`, `blur`, key up and unmount (see `PointerFireButton`). Release while not firing is harmless.
- React only to the primary pointer button, and ignore key repeat.
- Never send `M3` from anywhere else. The power is clamped to 0.1..5 % by `getClampedPointerPowerPercent` and scaled by `getPointerSValueMax`, so the laser's own `$30` sets the cap.

## Profiles

```ts
const profile: MachineProfile = newMachineProfile({ name: 'ACMER', workAreaXMm: 410, workAreaYMm: 400 });
dispatch(new MachineProfileSaved({ profile }));
dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
```

- Profiles live in `localStorage` under `webgrbl.machineProfiles` (invalid ones are dropped on load).
- On the first connection with no profile, "My laser" is created from `$130`, `$131`, `$30` and `$22`. A different work area later only shows a warning.
- Only values the laser reports validly are read; a default is never taken for a reading.
- Read the active profile through `selectActiveMachineProfile`, never from storage.

## Try it

`npm run dev`, then connect the simulated laser in the connection popover: jog and Set zero move the head and the zero marker on the bed. Turn on the double-click move in the gear beside STOP and double-click empty bed: the head and the Position card follow. To see a pointer cut-off, hold the fire button and switch tab: the button releases.

Hardware check: a known follow-up, deferred on 2026-10-31 because the ACMER laser was not available. Still to verify in Chrome: jog in every direction at 1 and 10 mm, go to zero, Set zero then Stop keeps the zero marker, Home and air assist if fitted, the pointer at 1 % shows a dot and switches off on release, Alt-Tab and after 10 s, and whether a stationary pointer lights at all on this firmware. The pointer sends `M3` and a feed-only `G1 F100`; stock GRBL keeps `M3` lit without motion, so it should light there, but that is not verified on hardware, and the card's firmware note still says some firmwares keep the laser off while the head stands still.

## Tests

- Builders and profile helpers: unit tests next to the files.
- Cards and dialog: `index.test.tsx` in each container (render inside `AntdTestProvider`).
- Sagas: `newStore` over a `SimulatedLaserTransport` with fake timers.
