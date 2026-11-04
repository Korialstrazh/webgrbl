# Running a job

**Not yet verified on a real laser.** Everything here has only run against the GRBL simulator.

1. Connect the laser, then wait for the toolpath to be ready. If Start job is off, its tooltip says why.
2. Press **Start job** in the Job card, check the material, focus and work zero, then confirm with **Start and fire**.
3. The Job card shows Running, Finishing, then Finished, or "Stopped before the end", and Paused during a hold. STOP works throughout.

While a job runs, the Job card shows a progress bar, lines answered and elapsed time. A line counts when the laser has answered it, which is slightly ahead of the burn because GRBL buffers lines, and the elapsed time keeps counting during a pause. **Pause** holds the job, and **Resume** continues once the machine has stopped; after a safety door opened, Resume also waits until the door is closed. Pause is off when laser mode is off (`$32=0`), because the beam could stay on while the head stands still; use STOP then. The app reads `$32` when it connects, so reconnect after changing it in the console.

While a job runs, the console, jog, home, set zero, pointer and air assist are locked. After a lost connection the laser may still run what it has buffered, and the app cannot stop it, so use the machine's own power switch or emergency stop.

For developers: `runGrblJob` in `src/utils/states/job.run.saga.ts` runs the job, and `selectJobStartBlockedReasonKey` holds the start conditions. Design: [the spec](../superpowers/specs/2026-11-03_(03)_running-jobs.spec.md).
