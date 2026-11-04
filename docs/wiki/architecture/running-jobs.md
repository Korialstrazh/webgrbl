---
title: Running jobs
created: 2026-11-03
---

# Running jobs

Roadmap item 5, slice 1. Simulator-tested only. User steps: `docs/howto/running-jobs.md`. Later slices: `docs/superpowers/specs/2026-11-03_(03)_running-jobs.spec.md`.

## Key Takeaways

- **Start conditions.** `selectJobStartBlockedReasonKey` is shared by `JobCard` and `runGrblJob`, so the saga does not rely on a disabled button. Toolpath warnings block a start.
- **End of a job.** The last `ok` means buffered, not burned. The run stays `finishing` until the next Idle report. A stop, reset, alarm or controller reset gives `interrupted`, because a reset also leaves the machine Idle. The saga watches for a stop or reset from the start of the run, not only during that wait, because the last lines can still be answered while a stop waits for the machine to come to rest.
- **Stop keeps the locks.** After a stop request the run stays active until `MachineStopFinished`, which `runGrblMachineStop` puts when the stop sequence ends. A line typed earlier would be wiped by the reset.
- **Progress.** `GrblProgramStreamer` emits `PROGRAM_PROGRESS` when a real run starts and for each answered line, not during a check. Answered lines run slightly ahead of the burn, as GRBL buffers them, so `JobRunProgress` keeps the bar neutral at 100% instead of showing the antd success mark.
- **Pause.** `selectJobPauseControl` decides between pause, resume and their blocked forms, and `runGrblJobPauseCommand` repeats that check. Resume is offered at `Hold:0` and `Door:0`, the states where GRBL accepts it. `JobCard` shows Paused while one of `JOB_PAUSED_CONTROLS` is offered. Pause is refused unless `$32` reads `1`, because without laser mode the beam can stay on during a hold. Known gap: `grblSettings` is only read in the handshake, so a `$32=0` typed in the console after connecting is not seen until the next connect.
- **Stale `$32`.** Settings are read at connect only, so a console line writing `$32=` or `$RST=` sets `isLaserModeUnconfirmed`, which blocks Pause until the next `ConnectionEstablished`. Other consumers of `selectGrblSettings` still see the old values.
- **Connection end.** The reducer marks an active run `interrupted`, because the saga is cancelled with the connection.
- **Air assist.** A job that ended early ended in a reset, and a finished program may end with `M9`, so `runGrblJob` then puts `MachineAirAssistChanged` off. During a run the switch does not follow the `M8` and `M9` of the program.
- **Confirmation.** The Start job `Popconfirm` registers in the overlay registry, because it is in the main view: Escape only closes it, without also stopping the machine. It closes when the start gets blocked.
- **Same program as the export.** `getProjectGcodeText` writes the G-code for both.
- **Locks.** During a run, `submitGrblConsoleCommand` and `submitGrblMachineLine` drop lines, `getMoveAvailability` and `getCanFireLaserPointer` refuse, and the air switch is off. `LeavePageGuard` also warns.

## Source

- `src/utils/states/job.run.state.ts`, `job.run.saga.ts`, `job.run.status.constants.ts`, `job.start.blocked.reason.selector.ts`, `job.pause.control.constants.ts`, `job.pause.control.selector.ts`, `grbl.job.pause.saga.ts`, `project.gcode.text.saga.ts`, `grbl.console.command.saga.ts`, `grbl.machine.line.saga.ts`
- `src/utils/grbl/grbl.program.streamer.ts`, `interfaces/GrblProgramProgressEvent.ts`
- `src/containers/MachinePanel/JobCard/`
