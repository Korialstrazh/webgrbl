# Running a job

**Not yet verified on a real laser.** Everything here has only run against the GRBL simulator.

1. Connect the laser, then wait for the toolpath to be ready. If Start job is off, its tooltip says why.
2. Press **Start job** in the Job card, check the material, focus and work zero, then confirm with **Start and fire**.
3. The Job card shows Running, Finishing, then Finished, or "Stopped before the end", and Paused during a hold. STOP works throughout.

While a job runs, the Job card shows a progress bar, lines answered and elapsed time. A line counts when the laser has answered it, which is slightly ahead of the burn because GRBL buffers lines, and the elapsed time keeps counting during a pause. **Pause** holds the job, and **Resume** continues once the machine has stopped; after a safety door opened, Resume also waits until the door is closed. Pause is off when laser mode is off (`$32=0`), because the beam could stay on while the head stands still; use STOP then. The app reads `$32` when it connects, so reconnect after changing it in the console.

While a job runs, the console, jog, home, set zero, pointer and air assist are locked. After a lost connection the laser may still run what it has buffered, and the app cannot stop it, so use the machine's own power switch or emergency stop.

The Job card shows a stepper (Profile, Artwork, Material, Connect) and, under it, one filled button for the current required step: **Set up laser**, **Import SVG** or **Connect laser**. Material is recommended, not required (Start job does not need it): while no material is chosen its step shows a hollow, thin dotted ring with a small skip mark (a dash in a dot) on its corner, unlike the solid ring of a to-do step, and a small italic "optional" under its name, and it never becomes the next step, so the stepper agrees with Start. It opens what the step opens and starts nothing: **Connect laser** (and the Connect step) connects in one click when a port is already chosen, sending only the same connect request as the popover's Connect; with no port chosen it opens the connection popover, which opens beside the connection pill so it never covers this button. **Import SVG** opens the same file picker as the top bar; once the artwork arrives the focus moves on to it on the bed, so the button (now the next step) is not left looking chosen. The steps are one tab stop; move between them with the arrow keys, Home and End. Filled orange is kept for this button and for Start. The chevron in the Job card heading folds the card to its facts and Start; the app remembers the fold. The card never folds by itself; when the cards below it do not fit, the right column shows a normal scrollbar and its bottom edge fades under a shadow from the Stop bar, so Move is a scroll away.

## Frame job

**Not yet verified on a real laser.** The checks on the ACMER are pending: the dot visible at about 0.05 W including at corners, dark while paused, and dark when the head stops. The dot uses `M4`, so it goes dark when the head stands still and dims at corners.

Frame job traces the job with a dim dot, so you can see where it lands before you burn. Watch the dot to answer three questions: does the job stay within the limits of the laser, can the head travel the whole path without getting stuck, and is the sheet flat (a wider or blurrier spot shows where it rises or dips).

1. Connect the laser, wait for the toolpath to be ready and set work zero where the job should start.
2. In the Job card, choose the **Grid** (Outline only, no grid, 1 cm, 2 cm or 5 cm), a **Margin** in mm (0 by default), which grows the rectangle on all four sides, and a **Frame speed** in mm/min (6000 by default, 100 to 10000). All three are saved per machine profile. A field corrects itself only when you leave it or press Enter: left empty it gives the saved value back, and a number outside the range is held at the nearest limit. The frame time shown in the card uses the same speed, but it is a lower bound: GRBL caps every move at the machine's `$110` and `$111` limits, so a slower machine takes longer. A faster trace may also change how visible the dot is; this is not verified on a real laser.
3. Check the dot power shown in the card: it is 0.05 W and assumes the maximum watts of the named machine profile (10 W until you change it), so set the real laser power in the profile first.
4. Press **Frame job**. There is no confirmation. The head traces the rectangle around the job, then the grid lines, switches the dot off and returns to where it started.
5. **Pause**, **Resume** and **STOP** work as for a job. The dot is off while paused. While a frame runs, the same locks as for a job apply.

Frame job is off (no fill, a solid grey outline and a small amber lock inline before its word, 4 px from it, so it never covers the icon or the word, like Start while it cannot run; a ready Export is quiet, with a grey outline and muted text that brighten on hover or focus, so it never outshines Start or Frame), with the reason in its tooltip (an off Start or Frame still takes keyboard focus, so Tab reaches it, the tooltip opens on focus and a screen reader reads the reason; pressing it does nothing) and behind the amber info icon in the Job card heading (hover or focus it for one shared reason, "Connect the laser to start or frame.", while neither can run for want of a connection), and a few plain words always show right under each locked button, one reason per button ("Warnings", "Off bed", "No layer on" and so on; a reason a to-do step of the readiness row already says, such as "Offline" while Connect is to do or "No artwork" while Artwork is, is left out, so the button keeps only its padlock), so a touch screen without hover shows it too, when the job cannot start, when laser mode is not confirmed on (`$32=1`, read at connect), when there is nothing to burn, or when the frame would leave the bed. A message then names the edge and by how many mm the frame goes past it. Work zero counts as the origin of the bed, so this check only tells you the frame fits from where work zero is; it is a first filter. The app does not know how far the head can really travel.

**The machine reports a limit only if it can.** Without soft limits (`$20=1` and a homed machine) or hard limit switches, GRBL reports nothing when the head reaches the end of its travel, and the head can stall against the frame of the machine. The app cannot detect that, so watch the head and press STOP. If the machine does report an alarm, the frame ends and the card says so; clear the alarm before framing again.

For developers: `runGrblFrame` in `src/utils/states/frame.run.saga.ts` runs the frame from the program of `src/utils/frame/`. `runGrblJob` in `src/utils/states/job.run.saga.ts` runs the job, and `selectJobStartBlockedReasonKey` holds the start conditions. Design: [the spec](../superpowers/specs/2026-11-03_(03)_running-jobs.spec.md).

If you send `$32=` or `$RST=` in the console after connecting, Pause stays off until you reconnect, because the app reads settings only when it connects. Other ways of changing the setting, such as the machine's own screen, are not seen.

## Stable layout while the machine works

Nothing in the Job card changes size when the machine turns busy, a run starts or ends, or an action locks:

- A locked Start, Frame or Export shows why as a small amber dot on the top corner of its button (`ActionLockNote`); hover, tap or focus it for the reason (for example "Busy" while the laser moves). The dot floats over the button, so it never pushes the buttons down.
- The run status (Running, Paused, Finished...) is a blue dot with the same tooltip, in a slot that is always reserved in the facts line; screen readers hear it from a hidden live region.
- The header keeps a slot for the reasons icon, so the fold button never moves.
