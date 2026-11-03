---
title: Running jobs
created: 2026-11-03
---

# Running jobs

Roadmap item 5, slice 1. Simulator-tested only. User steps: `docs/howto/running-jobs.md`. Later slices: `docs/superpowers/specs/2026-11-03_(03)_running-jobs.spec.md`.

## Key Takeaways

- **Start conditions.** `selectJobStartBlockedReasonKey` is shared by `JobCard` and `runGrblJob`, so the saga does not rely on a disabled button. Toolpath warnings block a start.
- **End of a job.** The last `ok` means buffered, not burned. The run stays `finishing` until the next Idle report. A stop, reset, alarm or controller reset during that wait gives `interrupted`, because a reset also leaves the machine Idle.
- **Connection end.** The reducer marks an active run `interrupted`, because the saga is cancelled with the connection.
- **Locks.** During a run, `submitGrblConsoleCommand` and `submitGrblMachineLine` drop lines, `getMoveAvailability` and `getCanFireLaserPointer` refuse, and the air switch is off. `LeavePageGuard` also warns.

## Source

- `src/utils/states/job.run.state.ts`, `job.run.saga.ts`, `job.run.status.constants.ts`, `job.start.blocked.reason.selector.ts`, `grbl.console.command.saga.ts`
- `src/containers/MachinePanel/JobCard/`
