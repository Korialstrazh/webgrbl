---
title: Machine control
created: 2026-10-31
---

# Machine control

Machine profiles hold the facts that differ from laser to laser, so the app can drive any GRBL laser: bed size, rated power, `$30` S max, origin corner, homing switches, air assist and jog speed. The active profile sizes the bed and will cap the laser pointer's power.

## Key Takeaways

- **Model.** `MachineProfile` (`id`, `name`, `maxPowerWatts`, `workAreaXMm`, `workAreaYMm`, `sValueMax`, `originCorner`, `hasAirAssist`, `hasHomingSwitches`, `jogFeedRate`). `newMachineProfile(overrides)` fills the defaults ("My laser", 400 x 400 mm, 10 W, S max 1000, front-left, no air assist, no homing, jog 1500 mm/min) and a new `crypto.randomUUID()` id.
- **Validation.** `getMachineProfileErrors(profile)` returns one `{field, messageKey, messageParameters?}` per invalid field: name required, 0 < watts <= 500, 0 < work area <= 5000 mm (`BED_MAX_TRAVEL_MM`), S max an integer 1..100000, jog feed 100..10000 mm/min. Bounds live in `machine.profile.constants.ts` and are interpolated into the messages.
- **Storage.** `MACHINE_PROFILES_STORAGE` keeps `{ version: 1, activeProfileId, profiles }` in `localStorage` under `webgrbl.machineProfiles`. Reads go through type guards; corrupt, missing or blocked storage reads as an empty document; profiles failing range validation are dropped and a dangling `activeProfileId` is cleared. Writes swallow storage errors.
- **Import and export.** `getMergedProfilesDocument(current, imported)` validates the import and appends its profiles, giving clashing ids a new id; `undefined` means invalid input. `getProfilesExportText` writes the document as indented JSON.
- **Slice `machineProfile`.** State is the stored document. Actions: `MachineProfilesLoaded`, `MachineProfileSaved` (upsert by id), `MachineProfileDeleted` (deleting the active profile clears `activeProfileId`), `ActiveMachineProfileSelected` (an unknown id is ignored), `MachineProfilesImported` (takes over the merged document), `MachineProfileReadFromLaserRequested`, `MachineProfileUpdateFromLaserAccepted`. Selectors: `selectMachineProfilesDocument`, `selectMachineProfiles`, `selectMachineProfile(id)`, `selectActiveMachineProfile`.
- **Reading a laser.** `getProfileValuesFromSettings(settings)` maps `$130` -> X, `$131` -> Y, `$30` -> S max, `$22 === '1'` -> homing and `$32 === '1'` -> laser mode. Values are checked by building a candidate profile and running the profile validation, so the ranges have one owner; an invalid value falls back to the default. Setting numbers are `GRBL_SETTING_*` in `grbl.constants.ts` (X/Y travel in `bed.constants.ts`).
- **Saga `watchMachineProfiles`.** At start it loads the stored document (`call` on `MACHINE_PROFILES_STORAGE`) and puts `MachineProfilesLoaded`; after every saved, deleted, selected or imported change it stores the document again.
- **On connect** (`ConnectionEstablished`): with no active profile, it creates "My laser" from the laser's values, makes it active and shows the info toast `TOAST_PROFILE_CREATED`. With an active profile whose work area differs from `$130`/`$131`, it shows the warning toast `TOAST_PROFILE_DIFFERS` (both sizes) and changes nothing; the toast points the user to the Machine profiles dialog. With `$32` off it shows the warning `TOAST_LASER_MODE_OFF`.
- **Update from the laser.** `MachineProfileUpdateFromLaserAccepted` and `MachineProfileReadFromLaserRequested` apply the connected laser's work area, S max and homing to that profile and save it (which persists it). They do nothing while disconnected, since empty settings would reset the profile to defaults, or for an unknown id. The read also repeats the laser-mode warning.
- **Bed.** `BedPanel` passes `selectActiveMachineProfile` to `getBedDimensions`; a valid profile work area wins over `$130`/`$131` and shows no placeholder, connected or not (see [[app-shell]]).
- **Tests.** Saga tests run `newStore` against a `SimulatedLaserTransport` over a shared `GrblSimulator` whose settings are changed before connecting, with fake timers and the jsdom `localStorage` cleared around each test.

## Source

- `src/utils/profiles/` (`machine.profile.constants.ts`, `new.machine.profile.ts`, `get.machine.profile.errors.ts`, `is.machine.profile.ts`, `is.machine.profiles.document.ts`, `is.machine.origin.corner.ts`, `machine.profiles.storage.ts`, `get.merged.profiles.document.ts`, `get.profiles.export.text.ts`, `get.profile.values.from.settings.ts`, `interfaces/`)
- `src/utils/states/machine.profile.state.ts`, `src/utils/states/machine.profile.saga.ts`, `src/utils/states/interfaces/MachineProfileIdPayload.ts`, `MachineProfileSavedPayload.ts`, `MachineProfilesDocumentPayload.ts`
- `src/utils/states/root.reducer.ts`, `src/utils/states/root.saga.ts`
- `src/utils/grbl/grbl.constants.ts` (setting numbers)
- `src/utils/bed/get.bed.dimensions.ts`, `src/containers/BedPanel/`
- `tools/localization/default.csv` (`TOAST_PROFILE_CREATED`, `TOAST_PROFILE_DIFFERS`, `TOAST_LASER_MODE_OFF`, `MACHINE_PROFILE_ERROR_*`)
