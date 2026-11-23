---
title: Getting-Started Handbook
created: 2026-11-23
provenance: plan docs/superpowers/plans/2026-11-23-handbook-and-about.md, Task 4; every claim checked against source on 2026-11-23
---

# Getting-Started Handbook

The "?" help menu in the top bar opens **Getting started**, a six-step pager that walks a new user from material to a running job and what to do when something goes wrong. Each step is an entry in a registry (title key, ordered body keys, decorative animation). The pager renders the body keys in order as short paragraphs. All text lives in `tools/localization/default.csv` (English only).

## Key Takeaways

- **Six steps, in this order:** Choose the material, Connect and set up the laser, Import a design, Frame and aim, Start the job, When something goes wrong.
- **Text is verified against code, not docs** (runbook `in-app-handbook-maintenance` §1–2). Each quoted label below has its CSV key and render site.
- **Corrections to the plan outline found in the code:** the profiles dialog is "Laser profiles", not "Machine profiles". Max power is "Laser power (W)" in that dialog. The P key *toggles* the pointer (it is not hold), and works only when connected, idle and with no job running. The on-screen "Hold to fire" button is the hold variant. Esc does not stop while a panel is open unless "Esc stops over panels too" is on. Stop holds motion, waits, then soft-resets GRBL. Alarms clear with **Unlock** in the Status card (shown only in Alarm) or by homing. The Frame button's caption is "Frame". The job's Start button's caption is "Start". The progress label "Job progress" is only an aria-label, so the text says "progress bar".
- **Changing a step:** edit the CSV, run `npm run locales:update`, and adjust `bodyKeys` in `handbook.steps.ts`. The registry test fails on any key without English text.

## Claim to source map

| Claim / label | Key | Proof |
|---|---|---|
| Material panel, Material list | `DESIGN_MATERIAL_TITLE`, `BURN_PREVIEW_MATERIAL_LABEL` | `src/containers/DesignPanel/index.tsx`, `src/containers/ProjectMaterialSelect/index.tsx` |
| "Add material…", Name, Thickness (mm), Save; new material becomes project material | `BURN_PREVIEW_ADD_MATERIAL`, `MATERIAL_DIALOG_*` | `src/containers/ProjectMaterialSelect/index.tsx`, `src/containers/MaterialDialog/index.tsx` (dispatches `ProjectMaterialSelected`) |
| Library opens Materials with presets | `MATERIAL_SECTION_LIBRARY_CAPTION`, `MATERIAL_LIBRARY_TITLE`, `MATERIAL_SECTION_PRESETS_HINT` | `src/containers/MaterialSection/index.tsx`, `src/containers/MaterialLibraryDrawer/index.tsx` |
| Connection pill in top bar; "Add port", "Connect", "Simulated laser (no hardware)" | `CONNECTION_POPOVER_*` | `src/containers/TopBar/index.tsx`, `src/containers/ConnectionPopover/index.tsx` |
| "Laser profiles" in top bar; "Laser power (W)"; "Read from laser"; Save | `TOP_BAR_MENU_MACHINE_PROFILES`, `MACHINE_PROFILES_*` | `src/containers/TopBar/index.tsx`, `src/containers/MachineProfilesDialog/` |
| "Import SVG" in top bar | `TOP_BAR_MENU_IMPORT_SVG` | `src/containers/TopBar/index.tsx`, `src/containers/SvgImportButton/index.tsx` |
| Layers per colour, Burn order | `LAYERS_PURPOSE_CAPTION` | `src/containers/LayersSection/index.tsx`, `ProjectLayer` interface (colour) |
| Mode, Speed (mm/min), Max power (%), Passes, Line/Fill help, "Use preset" | `LAYER_SETTINGS_*` | `src/containers/LayerSettingsDrawer/` |
| Frame (caption), guide light that never burns, blocked when off the bed | `MACHINE_JOB_FRAME_CAPTION`, `FRAME_POWER_*`, `FRAME_START_BLOCKED_BED_OVERRUN` | `src/containers/MachinePanel/JobCard/FrameControls/index.tsx` |
| P toggles the pointer; only connected, idle, no job | `POINTER_TOGGLE_KEY` | `src/containers/PointerHotkey/index.tsx`, `src/utils/machine/get.can.fire.laser.pointer.ts` |
| "Hold to fire" | `MACHINE_LASER_FIRE` | `src/containers/MachinePanel/JobCard/LaserPointerRow/PointerFireButton/index.tsx` |
| Start, safety checklist, "I have done all of the above", "Start job" | `MACHINE_START_JOB_CAPTION`, `SAFETY_CHECKLIST_*` | `src/containers/JobStartButton/index.tsx`, `src/containers/JobSafetyChecklistDialog/index.tsx` |
| Status, Pause, Resume in the Job card | `JOB_RUN_STATUS_LABEL`, `JOB_PAUSE`, `JOB_RESUME` | `src/containers/MachinePanel/JobCard/` |
| Stop stays on screen above dialogs | `MACHINE_CONTROL_STOP` | `src/containers/StickyStopBar/index.tsx`, `src/containers/StopButton/index.tsx` |
| Stop / Esc: halt, then soft reset | — | `src/containers/StopHotkey/index.tsx`, `src/utils/grbl/grbl.stop.sequence.ts` |
| "Esc stops over panels too" in Stop settings | `STOP_SETTINGS_*` | `src/containers/StopSettingsButton/index.tsx` |
| Alarm, Unlock in the Status card | `MACHINE_CONTROL_ALARM_NOTE`, `MACHINE_CONTROL_UNLOCK` | `src/containers/MachinePanel/MachineResetUnlock/index.tsx` |
| "Connection lost" toast | `TOAST_CONNECTION_LOST` | `src/utils/states/grbl.controller.event.actions.ts` |
| Messages | `MESSAGE_HISTORY_OPEN` | `src/containers/MessageHistoryButton/index.tsx` |

Related: [[ui-layout]], [[vision]].

## Source

- `src/containers/HandbookDialog/handbook.steps.ts`
- `src/containers/HandbookDialog/index.tsx`
- `src/views/HandbookAnimations/`
- `tools/localization/default.csv`
