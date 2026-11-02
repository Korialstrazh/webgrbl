# Machine control

The Move card, the Laser pointer card and the Machine profiles dialog drive a GRBL laser by hand. This page shows how a control sends a command, how the pointer stays safe, and how profiles work. Design details: `docs/wiki/architecture/machine-control.md`.

## What the user gets

- **Move card** (`src/containers/MachinePanel/MoveCard/`): while no laser is connected one line, "Connect to move", with a Show button that opens the disabled controls (the "Connect to move" hint stays beside Hide while they are open); the controls (`MoveControls/`) are centred: a 3 x 3 jog pad, step sizes 0.1 / 1 / 10 / 50 mm, a jog speed saved to the active profile, Set zero, and Home when the profile has homing switches. Unlock and Reset are in the Status card.
- **Laser pointer card** (`src/containers/MachinePanel/LaserCard/`): while no laser is connected one line, "Connect to use", with a Show button (both cards use `CollapsedCardToggle` from `src/views/`); the controls are power 0.1..5 % of S max (the connected laser's reported `$30`, else the active profile's), a hold-to-fire button, and an air assist switch for profiles with air assist. Frame job, still coming soon, sits on the Job card below Export G-code and Start job.
- **Machine profiles** (`src/containers/MachineProfilesDialog/`, opened from the top bar): bed size, rated power, `$30`, origin corner, homing switches, air assist and jog speed per laser, with import, export and "Read from connected laser" (disabled with a tooltip while no laser is connected). The S max field explains `$30` from an info icon, and Delete stays disabled for the only profile. The active profile's name is shown in the connection pill.

## Send a command from a control

Build the line with a pure builder from `src/utils/machine/` and dispatch `MachineLineRequested`. Controls never talk to the controller directly, and the line is dropped while disconnected.

```tsx
const { canJog }: MoveAvailability = getMoveAvailability({
  isConnected,
  machineState: machineStatus?.machineState,
  hasHomingSwitches,
  isPointerFiring,
});

<Button size={ANTD_BUTTON_SIZE_LARGE} disabled={!canJog} onClick={() => {
  dispatch(new MachineLineRequested({ line: getJogCommand(JOG_DIRECTION.EAST, 10, 1500) }));
}}>
```

- Lines: `$J=G91 G21 X10 F1500` (jog), `$J=G90 G21 X0 Y0 F...` (go to work zero), `$H` (home), `G10 L20 P1 X0 Y0` (set zero, kept by Stop and reset), `M8` / `M9` (air).
- Gate every control with `getMoveAvailability` or `getCanFireLaserPointer`; a disabled button is the only guard the UI adds, the saga checks again where it matters.
- Numbers go through `getFormattedGcodeNumber` (3 decimals, never `-0`, never locale text).

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

`npm run dev`, then connect the simulated laser in the connection popover: jog and Set zero move the head and the zero marker on the bed. To see a pointer cut-off, hold the fire button and switch tab: the button releases.

Hardware check: a known follow-up, deferred on 2026-10-31 because the ACMER laser was not available. Still to verify in Chrome: jog in every direction at 1 and 10 mm, go to zero, Set zero then Stop keeps the zero marker, Home and air assist if fitted, the pointer at 1 % shows a dot and switches off on release, Alt-Tab and after 10 s, and whether a stationary pointer lights at all on this firmware. Stock GRBL with laser mode on (`$32=1`) keeps a stationary pointer dark; the card's note says so in plain words.

## Tests

- Builders and profile helpers: unit tests next to the files.
- Cards and dialog: `index.test.tsx` in each container (render inside `AntdTestProvider`).
- Sagas: `newStore` over a `SimulatedLaserTransport` with fake timers.
