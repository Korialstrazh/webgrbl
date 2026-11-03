---
title: Running jobs
created: 2026-11-03
---

# Running jobs

Roadmap item 5, slice 1. Simulator-tested only. User steps: `docs/howto/running-jobs.md`. Later slices: `docs/superpowers/specs/2026-11-03_(03)_running-jobs.spec.md`.

## Key Takeaways

- **Start conditions.** `selectJobStartBlockedReasonKey` is shared by `JobCard` and `runGrblJob`, so the saga does not rely on a disabled button. Toolpath warnings block a start.
- **End of a job.** The last `ok` means buffered, not burned. The run stays `finishing` until the next Idle report. A stop, reset, alarm or controller reset gives `interrupted`, because a reset also leaves the machine Idle. The saga watches for a stop or reset from the start of the run, not only during that wait, because the last lines can still be answered while a stop waits for the machine to come to rest.
- **Connection end.** The reducer marks an active run `interrupted`, because the saga is cancelled with the connection.
- **Air assist.** A job that ended early ended in a reset, and a finished program may end with `M9`, so `runGrblJob` then puts `MachineAirAssistChanged` off. During a run the switch does not follow the `M8` and `M9` of the program.
- **Confirmation.** The Start job `Popconfirm` registers in the overlay registry, because it is in the main view: Escape only closes it, without also stopping the machine. It closes when the start gets blocked.
- **Same program as the export.** `getProjectGcodeText` writes the G-code for both.
- **Locks.** During a run, `submitGrblConsoleCommand` and `submitGrblMachineLine` drop lines, `getMoveAvailability` and `getCanFireLaserPointer` refuse, and the air switch is off. `LeavePageGuard` also warns.

## Source

- `src/utils/states/job.run.state.ts`, `job.run.saga.ts`, `job.run.status.constants.ts`, `job.start.blocked.reason.selector.ts`, `project.gcode.text.saga.ts`, `grbl.console.command.saga.ts`, `grbl.machine.line.saga.ts`
- `src/containers/MachinePanel/JobCard/`
