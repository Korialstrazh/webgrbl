---
title: Machine Control (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# Machine Control

How the user drives the machine by hand in LaserGRBL: jogging (buttons, keyboard, double-click on the preview, continuous jog, Z), homing, unlock, soft reset, feed hold/resume, set work zero, realtime overrides, the status/position readouts, user-defined custom buttons (which also provide framing and laser test-fire), keyboard hotkeys, and picking which laser head usage is logged against.

## Key Takeaways

- Every manual action is gated by a `Can*` predicate over connection state, machine status and the cached `$$` config (e.g. homing needs `$22=1`). Copy the gate table in [[#LG-CTRL-23 Command availability gates]]: it decides which buttons are enabled.
- Jogging uses GRBL 1.1 `$J=` when the detected version is 1.1 or later. Older GRBL, Smoothie and Marlin get emulated jogging with plain `G91`/`G1`/`G90`. In step mode a jog is fire-and-forget: releasing the button does **not** cancel it. Only continuous jog sends jog-cancel `0x85`.
- Continuous jog (off by default) is a "latest target wins" mailbox. The TX loop sends `0x85` and then one `$J=G53` move to the machine edge (`$130`/`$131`). It runs only when nothing is waiting for an `ok`, and Z is never continuous.
- Realtime override bytes are never sent straight from the UI. The UI sets a target percentage. `ManageOverrides()` then sends **at most one** step byte per override each time it runs, and it runs only when a status report carries an `Ov:` field (or when an override slider is released). So the value creeps towards the target over several status reports.
- "Set zero" sends `G92 X0 Y0 Z0`, a temporary offset that is lost on reset in GRBL 1.1. `G10 L20` is never used. "Home" in the jog pad means moving to work origin (`$J=G90X0Y0`); it does **not** run `$H`.
- Framing and laser test-fire are not built-in features. They come from the shipped **default custom buttons** (Frame, Focus, Blink, Center, Corner). Their G-code uses `[expr]` placeholders that are filled from the job bounding box and `$30`.
- Custom buttons come in 3 types (Button, TwoState, Push) and 5 enable conditions. Their G-code lines can also be single realtime bytes (`ctrl-x`, `?`, `!`, `~`, `0xNN`).
- Hotkeys are an action-to-key table with a full default set (numpad jog, F5 run, Ctrl+X reset, …). Key repeat is suppressed, and key-up stops a held jog or releases a push button. Hotkeys are switched off while the manual-command textbox has focus.
- Upstream bugs and dead code not to copy: the `WPos.X/Y/Z` expression variables return **machine** position, `JogStateChange` is never raised, and `Move2DControl` is compiled but never used.

## Features

### LG-CTRL-01 Jog panel (directional pad, step and speed)

- **What it does:** A 3x3 pad of 8 direction buttons (N, NE, E, SE, S, SW, W, NW) around a centre "Home" button, plus a vertical **speed** slider and a **step** slider. Each press jogs the X/Y axes by one step at the chosen feed.
- **Where in the UI:** `JogForm` user control in the left panel of the main window. The whole panel is disabled unless `JogEnabled` (checked every UI timer tick).
- **Options & defaults:**
  - Speed slider: setting `Jog Speed`, default **1000** mm/min. Minimum 10. The maximum is re-read every 1 s as `max($110, $111)` from the cached config (falls back to 4000 when unknown). Keyboard/hotkey increments are max/10 (large) and max/20 (small). The label shows `F<value>` and the tooltip `Speed: <value>`.
  - Step slider (`StepBar`): discrete values **0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200** mm. Setting `Jog Step`, default **10**. A stored value snaps to the nearest entry.
  - Step slider hidden when `Enable Continuous Jog` is on (no steps in continuous mode).
- **Behaviour & gotchas:**
  - Mouse down on a direction runs `JogToDirection(dir, fast = right button)`. **Right-click jogs at F100000**, which GRBL clamps to the max rate. Mouse up calls `JogAbort()`, which does nothing in step mode.
  - Speed and step are mirrored into `Core.JogSpeed` / `Core.JogStep` and also exposed as the `jogspeed` / `jogstep` variables for custom buttons.
  - `UserControls/Move2DControl.cs` (a circular jog widget with 1/5/10/50/100/200 rings and a speed bar) is **dead code**: compiled but never instantiated.
- **Upstream source:** [`LaserGRBL/JogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/JogForm.cs) (`JogForm`, `StepBar`, `DirectionButton`, `DirectionStepButton`), [`LaserGRBL/JogForm.Designer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/JogForm.Designer.cs), [`LaserGRBL/UserControls/Move2DControl.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/Move2DControl.cs) (unused)
- **webgrbl notes:** Status: done. Built as the Move card ([[machine-control]]). The 3 x 3 pad sends one `$J=` line per click (clicks, not pointer-held jogs, so no release handling is needed); the step is a `Segmented` of 0.1 / 1 / 10 / 50 mm (default 10) and the jog speed is a number input saved to the active profile (100..10000 mm/min, default 1500). Not taken: the right-click rapid and the step slider's finer and larger steps. The pad is enabled only when connected and Idle or Jog. Original advice: Use pointer events (`pointerdown`/`pointerup`/`pointercancel` plus `setPointerCapture`) so touch and pen behave like the mouse. Treat `pointercancel` and `lostpointercapture` as a release, otherwise a jog can get "stuck" on touch screens. Replace right-click-for-fast with a visible "rapid" modifier, since right-click is not available on touch. Clamp the speed slider to the max rate the machine reports instead of polling every second. Store speed and step per machine profile.

### LG-CTRL-02 Step jog command generation

- **What it does:** Turns a direction plus step plus speed into G-code, depending on firmware capability.
- **Where in the UI:** The jog pad, jog hotkeys, and Z buttons. Click-to-jog uses the same logic with an absolute target.
- **Options & defaults:** `SupportTrueJogging` = detected GRBL version ≥ 1.1 (always `false` for Smoothie and Marlin).
- **Behaviour & gotchas:**
  - GRBL ≥ 1.1 (`EnqueueJogV11`): `$J=G91` plus axis words plus `F<speed>`. Diagonals combine X and Y with the **same step on each axis**, so the real distance is step·√2. Steps are formatted with invariant culture as `"0.0"` (one decimal, so 0.1 survives; finer values would be rounded). Example: NE, step 10, F1000 → `$J=G91X10.0Y10.0F1000`.
  - Directions map to axes as: E = +X, W = −X, N = +Y, S = −Y, Zup = +Z, Zdown = −Z.
  - Home direction → `$J=G90X0Y0F<speed>` (move to **work** origin).
  - Absolute target (click-to-jog) → `$J=G90X<x>Y<y>F<speed>` with `"0.00"` formatting.
  - Legacy (GRBL < 1.1 or no version): three queued lines `G91`, `G1X..Y..F<speed>`, `G90`. Home becomes `G90` + `G1X0Y0F<speed>`, and absolute targets become `G90` + `G1X..Y..F..`. Legacy jogging is allowed only when Idle or Run and **not** in a program.
  - Jog commands go into the normal send queue (`EnqueueCommand`), not straight to the port. Requests made while `!JogEnabled` are silently dropped.
  - When soft limits are on (`$20=1`), absolute targets are clamped to `[-WCO, $130-WCO]` × `[-WCO, $131-WCO]` (`LimitToBound`). Relative step jogs are **not** clamped (GRBL rejects them with error 15).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`JogToDirection`, `JogToPosition`, `EnqueueJogV11`, `EnqueueJogV09`, `LimitToBound`, `JogEnabled`, `SupportTrueJogging`)
- **webgrbl notes:** Status: done. `getJogCommand(direction, stepMm, feedRate)` ([[machine-control]]) uses the locale-independent `getFormattedGcodeNumber` (3 decimals, never `-0`) and always `$J=G91 G21`. A diagonal moves the full step on each axis, as in LaserGRBL. Not done: the legacy `G91`/`G1` fallback for GRBL older than 1.1, the diagonal correction and client-side clamping of relative jogs. Original advice: Build jog strings with a locale-independent number formatter (never `toLocaleString`). Support 0.01 mm steps by formatting to 3 decimals. Consider dividing a diagonal step by √2 (optional, shown in the UI) so the travelled distance matches the step. Clamp relative jogs client-side as well when soft limits are known, to avoid error 15 noise.

### LG-CTRL-03 Continuous jog

- **What it does:** While a direction is held, the head keeps moving towards the machine edge and stops on release.
- **Where in the UI:** Settings, "Enable Continuous Jog". Affects the jog pad, jog hotkeys and click-to-jog.
- **Options & defaults:** `Enable Continuous Jog`, default **false**. Requires GRBL ≥ 1.1.
- **Behaviour & gotchas:**
  - A single-slot mailbox (`ContinuousJog`) holds the latest request: direction, position or Abort. The TX thread (`HandleContinuosJog`) reads it only when **no command is waiting for an `ok`**.
  - If the previous request was not an Abort, it first sends realtime **`0x85` (jog cancel)**.
  - Direction → `$J=G53` with X = `$130` (E) or `0` (W), Y = `$131` (N) or `0` (S), plus `F<speed>`. This is an absolute machine-coordinate move to the table edge, e.g. `$J=G53X300.0Y200.0F1000` for NE.
  - Position → `$J=G90X..Y..F..`. Home → `$J=G90X0Y0F..`.
  - Release → Abort request → `0x85` only. Rapid repeated requests collapse into the newest one.
  - Z directions throw if routed here, so Z always uses step jog ([[#LG-CTRL-04 Z jog]]).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ContinuousJog`, `HandleContinuosJog`, `ContinuousJogToDirection`, `ContinuousJogAbort`)
- **webgrbl notes:** Status: not started. Make sure a release always sends `0x85`, even when the tab loses focus (`blur` / `visibilitychange`), the pointer leaves the window, or the serial write queue is backed up. Write realtime bytes on a separate priority path that bypasses the line queue. Machines without homing have meaningless `G53` limits: offer "jog N mm per tick, repeat while held" as a safer alternative to edge targets. Make continuous jog the default when `$J` is supported, as other senders do.

### LG-CTRL-04 Z jog

- **What it does:** Six buttons for Z up/down by 0.1, 1 and 10 mm.
- **Where in the UI:** A Z column next to the jog pad, visible only when "Enable Z Jog Control" is on. Hotkeys Numpad + / Numpad − use the current XY step.
- **Options & defaults:** Setting key `Enale Z Jog Control` (sic), default **false**. When enabled it also forces the Z coordinate into the position overlay.
- **Behaviour & gotchas:** Always step mode: `$J=G91Z<±step>F<speed>`, or legacy `G91`/`G1Z..`/`G90`. Right-click means F100000. There is no mouse-up handler on the Z buttons.
- **Upstream source:** [`LaserGRBL/JogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/JogForm.cs) (`OnZJogButtonMouseDown`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`EnqueueJogV11`)
- **webgrbl notes:** Status: not started. Use a separate Z feed (`$112` is usually much lower than `$110`) instead of reusing the XY jog speed. Show Z controls automatically when the status report shows a non-zero Z or `$132 > 0`.

### LG-CTRL-05 Click-to-jog on the preview

- **What it does:** Double-clicking a point in the preview moves the head there.
- **Where in the UI:** The preview panel, both the GDI `GrblPanel` and the OpenGL `GrblPanel3D`. The on-screen tips read "JOG: Double click in any point (or double tap)".
- **Options & defaults:** Setting `Click N Jog`, default **true**.
- **Behaviour & gotchas:** Screen to world coordinates (work coordinates) → `JogToPosition(target, fast = right button)`. Right-double-click means F100000. Uses `$J=G90X..Y..` (or the continuous-jog mailbox when continuous jog is on, or legacy `G90`/`G1`). Soft-limit clamping applies. See [[lg-preview]] for coordinate mapping.
- **Upstream source:** [`LaserGRBL/UserControls/GrblPanel.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel.cs) (`GrblPanel_MouseDoubleClick`), [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`GrblPanel3D_DoubleClick`)
- **webgrbl notes:** Status: not started. Use `dblclick` plus a custom double-tap detector, because mobile browsers swallow `dblclick` or use it for zoom (set `touch-action: none` on the canvas). Show a crosshair or ghost target before the move. Optionally add "click to set work zero here" as a separate mode.

### LG-CTRL-06 Go to work origin ("Home" jog button)

- **What it does:** Moves the head back to work X0 Y0.
- **Where in the UI:** The centre button of the jog pad (house icon). Hotkey **Numpad 5**.
- **Options & defaults:** none.
- **Behaviour & gotchas:** `$J=G90X0Y0F<jogspeed>` (legacy: `G90` + `G1X0Y0F..`). This is **not** a homing cycle, and Z is not moved. The button was meant to hide during Jog state (`JogStateChange`), but that event is never raised, so it is always visible.
- **Upstream source:** [`LaserGRBL/JogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/JogForm.cs), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`EnqueueJogV11`, `HandleContinuosJog`)
- **webgrbl notes:** Status: done. The pad's centre button is labelled Origin and sends `getGoToWorkZeroCommand(feedRate)` = `$J=G90 G21 X0 Y0 F...` ([[machine-control]]); the separate Home button runs `$H`. Not done: go to machine home and go to job start. Original advice: Label it "Go to origin" rather than "Home" to avoid confusion with `$H`. Consider adding "go to machine home position" (`$J=G53X0Y0`) and "go to job start".

### LG-CTRL-07 Homing cycle

- **What it does:** Runs GRBL's homing cycle.
- **Where in the UI:** "Homing ($H)" button in the control strip next to the preview, menu **Grbl → Homing**, hotkey **Ctrl+H**.
- **Options & defaults:** The button and menu item are visible only when cached `$22` ≠ 0 (`HomingEnabled`; defaults to true when no config is known). Enabled only when `CanDoHoming` = connected, status Idle or Alarm, and homing enabled.
- **Behaviour & gotchas:** Queues `$H` as a normal line. The menu path calls `SendHomingCommand()` directly (no `Can` check; it relies on the menu-enabled state). Smoothie and Marlin inherit `$H` unchanged. "Run from position" and "Resume job" can prepend `$H` to a job (see [[lg-streaming]]).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`GrblHoming`, `SendHomingCommand`, `CanDoHoming`), [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs) (`BtnHoming`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MnGoHome_Click`)
- **webgrbl notes:** Status: done. The Home button sends `$H` and is shown only when the active profile has homing switches; it is enabled when connected and Idle or Alarm ([[machine-control]]). The `Home` status is shown by the machine state readout. Not done: per-axis homing and a dedicated homing-time handling. Original advice: Homing can take tens of seconds with no `ok`. Show a "homing…" state driven by the `Home` status and do not time it out like a normal command. Offer per-axis homing (`$HX`, `$HY`) when the grblHAL build reports support for it.

### LG-CTRL-08 Unlock / kill alarm

- **What it does:** Clears the GRBL alarm lock.
- **Where in the UI:** "Grbl Unlock ($X)" button (visible only for Firmware = Grbl), menu **Grbl → Unlock** (hidden for Smoothie/Marlin via `UIShowUnlockButtons`), hotkey **Ctrl+U**.
- **Options & defaults:** Enabled when `CanUnlock` = connected and status Idle or Alarm.
- **Behaviour & gotchas:** Queues `$X`. For Smoothie and Marlin `SendUnlockCommand` is a no-op. The UI gives no warning that unlocking without homing leaves the machine position untrusted.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`GrblUnlock`, `SendUnlockCommand`, `CanUnlock`)
- **webgrbl notes:** Status: done. The Unlock button sits next to Reset in the Status card, enabled in Alarm (see [[app-shell]]). Not done: the decoded alarm with context actions and the one-click unlock from the startup `[MSG:]`. Original advice: On `ALARM:n`, show the decoded alarm ([[lg-grbl-configuration]]) with context-specific actions: "Home" for alarms 1/3/6–9, "Unlock" for alarm 2. Also handle the `[MSG:'$H'|'$X' to unlock]` startup message by offering a one-click unlock.

### LG-CTRL-09 Soft reset

- **What it does:** Sends GRBL's realtime soft reset, aborting motion and clearing the queue.
- **Where in the UI:** "Grbl Reset (ctrl-x)" button, menu **Grbl → Reset**, hotkey **Ctrl+X**.
- **Options & defaults:** Enabled when connected. A reset is also sent automatically on connect when `Reset Grbl On Connect` is on (default **true**, never for Smoothie; see [[lg-connection]]).
- **Behaviour & gotchas:**
  - If a program is running and no issue is recorded yet, the issue is recorded as `ManualReset` (not shown to the user). Then: clear the send queue, the pending queue and the sent log; set used buffer to 0; end the job timer; reset override targets and current values to 100; send realtime **`0x18`**.
  - Smoothie sends the text `reset\r\n` instead. Marlin sends nothing.
  - A custom button line `ctrl-x` also sends `0x18`, but bypasses the queue clearing.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`GrblReset`, `InternalReset`, `SendBoardResetCommand`), [`LaserGRBL/Core/SmoothieCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/SmoothieCore.cs)
- **webgrbl notes:** Status: not started. Send `0x18` through the priority realtime path and flush any buffered writes in the `WritableStream` before it. After a reset, expect the welcome banner and re-sync state (version, `$$` if needed). Consider a big always-visible E-stop-style button, while making clear that a soft reset is not a hardware E-stop.

### LG-CTRL-10 Feed hold / resume

- **What it does:** Pauses and resumes motion in real time.
- **Where in the UI:** "Feed Hold" and "Resume" buttons in the control strip, hotkeys **F6** (pause) and **F7** (resume). Job-level pause/abort semantics are in [[lg-streaming]].
- **Options & defaults:** Hold is enabled in `Run`. Resume is enabled in `Door`, `Hold`, `Cooling` or `AutoHold`.
- **Behaviour & gotchas:** Hold sends `!` (`0x21`) and remembers that the user requested it. Resume sends `~` (`0x7E`). A GRBL `Hold` status not requested by the user is shown as the synthetic status **AutoHold**. A hold requested by auto-cooling is shown as **Cooling**. `SafetyDoor()` (`@`, `0x40`) exists but is unused.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`FeedHold`, `CycleStartResume`, `SafetyDoor`, `ParseMachineStatus`)
- **webgrbl notes:** Status: not started. Realtime bytes must not wait behind a full line buffer. Write them immediately on the port writer, outside the character-counting accounting.

### LG-CTRL-11 Set work zero

- **What it does:** Makes the current position the work origin.
- **Where in the UI:** "Set zero point (G92)" button in the control strip, hotkey **Ctrl+Z**.
- **Options & defaults:** Enabled when `CanDoZeroing` = connected, Idle, and the work position is **not** already 0,0,0.
- **Behaviour & gotchas:** Queues `G92 X0 Y0 Z0`, which always zeroes Z as well. There is no G10 L20 / G54 persistence and no "reset zero" (`G92.1`) button. Users clear it with a soft reset or a custom button. Job resume can re-apply a remembered WCO with `G92 X.. Y.. Z..` (see [[lg-streaming]]).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`SetNewZero`, `CanDoZeroing`)
- **webgrbl notes:** Status: done. The Set zero button sends `G10 L20 P1 X0 Y0` (XY only, persistent in EEPROM, so Stop or a reset keeps the zero) and is enabled when connected and Idle ([[machine-control]]). Not done: `G92` as a temporary alternative, per-axis zero and a clear-offset button. Original advice: Offer both `G10 L20 P1 X0 Y0` (persistent in EEPROM, survives a reset) and `G92` (temporary), plus per-axis zero and "clear offset" (`G92.1` or `G10 L2 P1 X0 Y0 Z0`). Default to XY only for lasers.

### LG-CTRL-12 Realtime overrides (feed, rapid, power)

- **What it does:** Scales feed (G1), rapids (G0) and spindle/laser power (S) live during a job.
- **Where in the UI:** Three status-bar labels `G0 [1.00x]`, `G1 [1.00x]`, `S [1.00x]` (visible only when GRBL ≥ 1.1). They are light pink above 100 %, light blue below, and use normal colours at 100 %. Clicking any of them opens a popup with three sliders (`LabelTB`): **Rapid** with 3 notches (25 %, 50 %, 100 %), and **Linear** and **Power** (10–200 %, small step 5, large step 10). Each slider has a reset button; double-click also resets. Nine optional hotkeys exist (unassigned by default).
- **Options & defaults:** Targets start at 100 and are reset to 100 by soft reset. Hotkey steps: feed and power ±1 within 10–200, default = 100. Rapid up doubles (max 100) and down halves (min 25).
- **Behaviour & gotchas:**
  - The UI only sets **targets** (`TOverrideG0/G1/S`). `ManageOverrides()` compares the target with the current value from the status report `Ov:feed,rapid,spindle` and sends **one** byte per override per call:
    - Feed: target = 100 and current ≠ 100 → `0x90`. Otherwise diff ≥ +10 → `0x91`, diff ≤ −10 → `0x92`, +1..9 → `0x93`, −1..−9 → `0x94`.
    - Power (spindle): `0x99` reset, `0x9A` +10, `0x9B` −10, `0x9C` +1, `0x9D` −1 (same rules).
    - Rapid: `0x95` (100 %), `0x96` (50 %), `0x97` (25 %).
  - `ManageOverrides()` runs only when a status report contains `Ov:` or when a slider is released. GRBL sends `Ov:` only every few reports or when the value changes, so a hotkey change may apply only after the next `Ov:` refresh. Several calls are needed to converge (e.g. 100→137 = +10,+10,+10,+1×7).
  - Not used: spindle stop `0x9E`, coolant toggles `0xA0`/`0xA1`.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ManageOverrides`, `ParseOverrides`, `ChangeOverrides`, `HotKeyOverride`, `TOverrideG0/G1/S`), [`LaserGRBL/UserControls/LabelTB.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/LabelTB.cs), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`RefreshOverride`, `GetOvMenu`)
- **webgrbl notes:** Status: not started. Keep the target-versus-actual reconciliation, but run it on every status report (or right after the user changes a value) and send the full sequence of step bytes at once, since they are idempotent increments. Show actual and target values side by side. Put the sliders on the main screen (as persistent controls) rather than in a popup. Add the spindle/laser-stop toggle (`0x9E`) as a "laser off while held" safety feature.

### LG-CTRL-13 Machine status display

- **What it does:** Shows the GRBL state in the status bar.
- **Where in the UI:** Status bar label `TTTStatus`. Double-clicking it opens the online help page `https://lasergrbl.com/usage/machine-status/`.
- **Options & defaults:** none.
- **Behaviour & gotchas:**
  - States (`MacStatus`): Disconnected, Connecting, Idle, Run, Hold, Door, Home, Alarm, Check, Jog, Queue, Cooling\*, AutoHold\*, Tool (grblHAL). \* = synthetic. The text after `:` (substate, e.g. `Hold:0`) is dropped.
  - Colours: Alarm = red with white text. Door, Hold, Cooling and AutoHold = dark orange. Run, Jog and Check = light green. Others use the default colours.
  - While a program runs, `Idle` is shown as `Run` (works around GRBL reporting Idle during `G4` dwell).
  - Text is localised via `MacStatus<Name>` strings. Cooling, AutoHold, Queue and Tool have no translation and show their raw enum names.
  - Status is polled with `?` (`0x3F`) on a timer whose period comes from the threading mode (see [[lg-streaming]]). Marlin uses `M114\n` (only when not running). VigoWork uses `0x88`.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`MacStatus`, `ParseMachineStatus`, `ManageRealTimeStatus`, `QueryPosition`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`TimerUpdate`)
- **webgrbl notes:** Status: not started. An unknown state string currently throws inside `Enum.Parse` (and the exception is swallowed). Map unknown states to an "Unknown" status instead. Show substates (e.g. `Door:1` "door open, waiting") and pair each state with the action it allows (Alarm → Unlock/Home).

### LG-CTRL-14 Position display (machine vs work coordinates)

- **What it does:** Shows machine and work coordinates and the live feed and power.
- **Where in the UI:** Overlay in the top-right corner of the preview. In the 3D/OpenGL panel the rows are `MCO X Y [Z]` (machine position), `WCO X Y [Z]` (the label says WCO but the value is the **work position**, shown only when the work offset ≠ 0), `PTR X Y` (world position under the mouse), then `F <feed>` and `S <power>` once either is non-zero. The GDI panel shows MPos and, below it, WPos. The head position marker in the preview is drawn at the work position.
- **Options & defaults:** Z column shown if MPos.Z ≠ 0, WPos.Z ≠ 0, or `Enale Z Jog Control` is on.
- **Behaviour & gotchas:**
  - GRBL 1.1 report fields: `MPos:` or `WPos:` (whichever `$10` selects), `WCO:` (sent only occasionally), `FS:f,s` or `F:f`, `Bf:blocks,bytes`, `Ov:`. The core always stores **MPos** and **WCO** and derives `WPos = MPos − WCO`. When only WPos is reported, `MPos = WCO + WPos`, using the last known WCO.
  - GRBL 0.9 format `<Idle,MPos:x,y,z,WPos:x,y,z>` → WCO = MPos − WPos.
  - The version is guessed from the report shape when unknown: contains `|` and no `Pin:` → 1.1. `|` with `Pin:` → 1.0c. Otherwise → 0.9.
  - Smoothie: `F:` carries `f,s`. Marlin: `X:.. Y:.. Z:.. E:.. Count …` from `M114` is parsed as MPos and forces status Idle.
  - The last WCO is remembered for job resume.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ManageRealTimeStatus`, `ParseMPos`, `ParseWPos`, `ParseWCO`, `ParseFS`, `StatusReportVersion`, `WorkPosition`), [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs), [`LaserGRBL/UserControls/GrblPanel.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel.cs), [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs)
- **webgrbl notes:** Status: not started. Label the readouts clearly ("Machine" / "Work" / "Offset"). Honour `$13` (inch reports), which LaserGRBL ignores. Show the active WCS (G54…) from the `$G` parser state. Put the coordinates in a proper DOM panel (accessible, copyable) rather than painting them on the canvas.

### LG-CTRL-15 Custom buttons: types and enable conditions

- **What it does:** User-defined buttons that send G-code snippets.
- **Where in the UI:** The flow area to the right of the fixed control buttons under the preview. Right-click on empty space shows the hint "Right click here to add custom buttons" and the menu Add / Import / Export / Lock buttons. Right-clicking a button offers "Remove button" and "Edit button". Each button is 49×49 px. Hotkeys **Ctrl+1 … Ctrl+0** trigger buttons 1–10.
- **Options & defaults:** Fields per button: `guid`, `Image` (bitmap scaled to 48×48; used in legacy-icon mode), `Caption` (in non-legacy mode, a name like `mdi-<name>` or `Frame`/`Center`/`Corner`/`Focus`/`Blink` selects a built-in icon, and the caption label links to pictogrammers.com/library/mdi), `ToolTip` (**required**), `GCode` (**required**), `GCode2` (required for TwoState and Push), `EnableStyle`, `ButtonType`.
  - `ButtonType`: **Button** (0) sends GCode on click. **TwoStateButton** (1) toggles, sending GCode on the "on" click and GCode2 on the "off" click; the pressed state is highlighted and is **not persisted**. **PushButton** (2) sends GCode on mouse down and GCode2 on mouse up (hold-to-run).
  - `EnableStyle`: **Always** (0), **Connected** (1), **Idle** (3) = status Idle, **Run** (4) = status Run, **IdleProgram** (10) = Idle and a program is loaded.
- **Behaviour & gotchas:** Only the left mouse button triggers. A disabled button is drawn greyed. When buttons are unlocked for reordering they are disabled and hatched. Hotkey activation emulates mouse down on key-down and mouse up plus click on key-up, so Push buttons work from the keyboard.
- **Upstream source:** [`LaserGRBL/CustomButton.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CustomButton.cs) (`CustomButton`, `EnableStyles`, `ButtonTypes`, `EnabledNow`), [`LaserGRBL/CustomButtonForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CustomButtonForm.cs), [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs) (`CustomButtonIB`, `RefreshCustomButtons`, `MyFlowPanel`)
- **webgrbl notes:** Status: not started. Push buttons that fire the laser while held are dangerous if the mouse-up is lost: release on `pointercancel`, `blur` and `visibilitychange`, and add a maximum hold time. Persist the TwoState state (or derive it from the machine state). Use an icon library bundled offline (e.g. MDI SVGs in the PWA cache) instead of user bitmaps.

### LG-CTRL-16 Custom button code language (placeholders, expressions, realtime bytes)

- **What it does:** Lets button G-code compute values and send realtime commands.
- **Where in the UI:** The GCode and GCode2 fields of the custom button editor. The help text reads: "Use dot as decimal separator. Support math expression in square brackets: i.e. G0 X[left-5] Y[bottom-5]. Available variables: left, right, top, bottom, width, height.. (and more)". Link: `https://lasergrbl.com/usage/custom-buttons/`.
- **Options & defaults:** —
- **Behaviour & gotchas:**
  - The code is trimmed and split on newlines. Empty lines are skipped. Each `[ … ]` group is evaluated and replaced with the result formatted as `0.000` (invariant culture). If evaluation fails, the bracket text is left unchanged.
  - Variables: `left`, `right`, `top`, `bottom`, `width`, `height` (the loaded job's drawing bounding box, all 0 if no valid range); `jogstep`, `jogspeed`; `WCO.X/Y/Z`, `MPos.X/Y/Z`, `WPos.X/Y/Z` (**bug: WPos returns machine position**); and every numeric `$n` from the cached config (e.g. `$30`, `$110`). `$30` defaults to 1000 when missing.
  - Operators (custom evaluator): `+ - * / ^`, parentheses, `abs()`, `sign()`, `neg()`, comparisons `== != < > <= >=`, logical `&& ||`, and `true`/`false`.
  - After substitution, a line that equals `ctrl-x` (any case), `?`, `!`, `~` or `0xNN` (a hex byte) is sent as a **realtime byte** (`0x18`, `0x3F`, `0x21`, `0x7E`, the parsed byte). `!` also marks the hold as user-requested. Every other line is queued as a normal command.
  - The same engine runs the job header, pass and footer snippets (see [[lg-gcode-files]]).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ExecuteCustomCode`, `EvaluateExpression`, `EvaluateCB`, `IsImmediate`, `GetImmediate`), [`LaserGRBL/Tools/ExpressionEvaluator.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/ExpressionEvaluator.cs)
- **webgrbl notes:** Status: not started. Implement a small safe expression parser; never use `eval` or `Function`. Fix the WPos variables. Add `min()`/`max()`, `WPos` computed correctly, `S` max `$30`, and the job origin. Validate snippets in the editor with a live preview of the expanded G-code against the current job. Keep the same bracket syntax so exported LaserGRBL buttons can be reused.

### LG-CTRL-17 Custom button management: storage, import/export, reorder

- **What it does:** Persists, shares and rearranges custom buttons.
- **Where in the UI:** Right-click menu of the custom button area: "Add custom button", "Import custom buttons", "Export custom buttons" (enabled only if at least one button exists), "Lock buttons" (toggle). Unchecking "Lock buttons" enables drag-and-drop reordering.
- **Options & defaults:** User file `%AppData%/LaserGRBL/CustomButtons.bin`. On first run it is seeded by copying `StandardButtons.zbn` from the install folder. Legacy migration reads the setting `Custom Buttons`.
- **Behaviour & gotchas:**
  - File format: LaserGRBL `Tools.Serializer`. A text header of 5 comment lines (`<!-- RemotingBase SerializerVersion: v1.0 -->`, `<!-- Serialization Mode: Binary -->`, `<!-- Encription: Disabled -->`, `<!-- Compression: Enabled -->`, `<!-- OBJECT DATA BEGIN HERE-->`) is followed by a **raw-deflate** stream of a .NET `BinaryFormatter` `List<CustomButton>` (images are embedded PNG bitmaps). Export file filter: `ZippedButton|*.zbn`, default name `CustomButtons.zbn`. Import accepts `*.zbn;*.gz`.
  - Import: if buttons already exist, a Yes/No/Cancel prompt asks "Remove actual buttons?" (Yes = replace, No = append). Then each button is confirmed one by one with `Import "<tooltip>"?`.
  - Reorder saves immediately. Add, edit and remove also save. Remove asks for confirmation.
  - A `.zbn` file passed on the command line or dropped on the window is imported (see [[lg-app-features]]).
- **Upstream source:** [`LaserGRBL/CustomButton.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CustomButton.cs) (`CustomButtons.LoadFile`, `SaveFile`, `Import`, `Export`, `Reorder`), [`LaserGRBL/Tools/Serializer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/Serializer.cs), [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs) (`ImportButton`, `MnUnlockButtonClick`)
- **webgrbl notes:** Status: not started. Store buttons in IndexedDB. Export and import JSON (with SVG/MDI icon names) through the File System Access API, with a download/upload fallback. A browser cannot deserialize .NET BinaryFormatter, so `.zbn` import would need a hand-written NRBF reader: treat it as optional and low priority. Show a single import dialog with checkboxes instead of one prompt per button.

### LG-CTRL-18 Default button set: framing and laser test fire

- **What it does:** The five shipped buttons provide framing, positioning and focus/test-fire.
- **Where in the UI:** The custom button area on first run (from `StandardButtons.zbn`).
- **Options & defaults:** decoded from `StandardButtons.zbn`, in order:

| # | Caption | Tooltip | Type | Enabled | GCode | GCode2 |
|---|---|---|---|---|---|---|
| 1 | Center | Move to the center of the frame | Button | IdleProgram | `G0 X[left+width/2] Y[bottom+height/2]` | — |
| 2 | Corner | Move to down left corner | Button | IdleProgram | `G0 X[left] Y[bottom]` | — |
| 3 | Frame | Framing - Laser ON - Low Power (3%) | Button | IdleProgram | `G0 X[left] Y[bottom]` / `M3 S[$30*3/100] F1000` / `G1 Y[top]` / `G1 X[right]` / `G1 Y[bottom]` / `G1 X[left]` / `M5` / `G0 X0 Y0` | — |
| 4 | Focus | Turn on laser for focusing (3%) | TwoStateButton | Idle | `M3 S[$30*3/100]` / `G1 F1000` | `M5 S0` / `G0` |
| 5 | Blink | Laser 10% | PushButton | Idle | `M3 S[$30*10/100]` / `G1 F1000` | `M5 S0` / `G0` |

- **Behaviour & gotchas:**
  - Framing traces the job's bounding box with the laser at 3 % of `$30` and F1000, then returns to work 0,0. It is **laser-on** framing: there is no laser-off "travel only" variant.
  - Focus and Blink send `M3 S..` followed by `G1 F1000` (a modal switch to G1 with no axis words, so nothing moves), and turn off with `M5 S0` + `G0`. Whether the beam actually fires while stationary depends on the firmware. Stock GRBL 1.1 with `$32=1` keeps the laser off when there is no motion, so on that firmware these buttons fire only with `$32=0`. Some vendor firmwares may behave differently. The UI shows no warning about this.
  - Laser usage below 3 % power is not counted towards laser life (framing and focus).
- **Upstream source:** [`LaserGRBL/StandardButtons.zbn`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StandardButtons.zbn), [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs) (icon mapping in `RefreshCustomButtons`)
- **webgrbl notes:** Status: in progress. Test fire is done and improved beyond LaserGRBL ([[machine-control]]): a hold-to-fire laser pointer at 0.1..5 % of S max (default 1 %) that switches off on release, window blur, a hidden tab, disconnect, Stop, alarm and after 10 s, with the approximate watts shown for the active profile. Whether a stationary pointer lights depends on the firmware: pending the hardware check on the ACMER laser. Framing is not built: the Frame job button is shown as coming soon. Original advice: Make framing a first-class feature: laser-off and low-power variants, frame the real job outline (convex hull) or the bounding box, include the job origin offset, and run it with `$J=` moves so it can be cancelled with `0x85`. For test fire, add an explicit power and duration control with a countdown and an auto-off timeout (e.g. `M3 S..` + `G1 F..` + `G4 P<t>` + `M5`), shown with a clear safety warning. Ship these as built-ins, not as deletable custom buttons.

### LG-CTRL-19 Hotkeys: actions and default bindings

- **What it does:** Keyboard shortcuts for most actions.
- **Where in the UI:** Active anywhere in the main window. Menu **Grbl → Hotkeys** opens the editor ([[#LG-CTRL-20 Hotkey editor]]).
- **Options & defaults:** stored in setting `Hotkey Setup`. Missing actions are added at startup. A default key that collides with a user-assigned key is set to None. Default bindings:

| Action (id) | Default key | Effect |
|---|---|---|
| ConnectDisconnect (10) | F12 | Toggle connection (asks for confirmation if a job is running) |
| Connect (11) | — | Open port |
| Disconnect (12) | — | Close port |
| OpenFile (20) | Ctrl+O | Open file dialog |
| ReopenLastFile (21) | Ctrl+R | Reload last file |
| SaveFile (22) | Ctrl+S | Save G-code |
| ExecuteFile (23) | F5 | Run job |
| AbortFile (24) | Ctrl+F5 | Abort job |
| HelpOnline (30) | Ctrl+F1 | Open lasergrbl.com/usage |
| AutoSizeDrawing (40) | Ctrl+A | Preview zoom to fit |
| ZoomInDrawing (41) | Ctrl+Numpad + | Preview zoom in |
| ZoomOutDrawing (42) | Ctrl+Numpad − | Preview zoom out |
| Reset (100) | Ctrl+X | Soft reset |
| Homing (101) | Ctrl+H | `$H` |
| Unlock (102) | Ctrl+U | `$X` |
| PauseJob (103) | F6 | Feed hold `!` |
| ResumeJob (104) | F7 | Resume `~` |
| SetNewZero (105) | Ctrl+Z | `G92 X0 Y0 Z0` |
| JogHome (1000) | Numpad 5 | Go to work origin |
| JogN / NE / E / SE / S / SW / W / NW (1001–1008) | Numpad 8 / 9 / 6 / 3 / 2 / 1 / 4 / 7 | Jog |
| JogUp (1009) | Numpad + | Z up |
| JogDown (1010) | Numpad − | Z down |
| JogStepIncrease / Decrease (1020/1021) | Numpad * / Numpad / | Step slider ±1 notch |
| JogSpeedIncrease / Decrease (1030/1031) | — | Speed slider ± large step |
| OverridePowerDefault / Up / Down (1100–1102) | — | Power override 100 / +1 / −1 |
| OverrideLinearDefault / Up / Down (1110–1112) | — | Feed override 100 / +1 / −1 |
| OverrideRapidDefault / Up / Down (1120–1122) | — | Rapid 100 / ×2 / ÷2 |
| CustomButton1 … CustomButton10 (2000–2009) | Ctrl+1 … Ctrl+9, Ctrl+0 | Press custom button n |

- **Behaviour & gotchas:**
  - Handled in `MainForm.ProcessCmdKey`. A key combination is processed only when it differs from the previous one (OS auto-repeat is ignored). `OnKeyUp` clears it and calls `ManageHotKeys(None)`, which runs `JogAbort()` if a jog key was used and releases emulated custom buttons.
  - Matching is exact (modifiers included). A matched hotkey returns `true` and swallows the key.
  - Jog hotkeys call `JogToDirection(dir, fast=false)`, so they repeat only through continuous jog. Step and speed hotkeys work only when `JogEnabled`.
  - Hotkeys are suspended while the manual-command textbox has focus (`SuspendHK`).
  - The menus do not show the shortcut text (the code to do so is commented out).
- **Upstream source:** [`LaserGRBL/HotKeysManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotKeysManager.cs) (`HotKey.Actions`, `AddAllFeatures`, `ManageHotKeys`, `PerformAction`, `EmulateCustomButtonDown/Up`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`ProcessCmdKey`, `OnKeyUp`), [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`SuspendHK`)
- **webgrbl notes:** Status: not started.
  - Browser conflicts: Ctrl+O, Ctrl+S, Ctrl+R, F5, Ctrl+F5, F12, Ctrl+1…0, Ctrl+A, Ctrl+H, Ctrl+U and Ctrl+Z are reserved or have browser meanings. Some can be blocked with `preventDefault()` (Ctrl+S, Ctrl+O, F5 in most browsers). **Ctrl+1…9, Ctrl+W/T/N and F11 cannot be overridden reliably**, and Ctrl+Z/X clash with text editing.
  - Pick web-safe defaults (e.g. Alt+digit for custom buttons, Space for hold, Esc for jog cancel or reset with confirmation). In an installed PWA window, the Keyboard Lock API (`navigator.keyboard.lock()`) can capture more keys, but only in fullscreen.
  - Use `KeyboardEvent.code` (physical key; distinguishes Numpad keys) for jog and ignore `event.repeat`. Handle key-up on `blur` and `visibilitychange` so a jog never sticks.
  - Ignore hotkeys when focus is in any `input`, `textarea` or `contenteditable`, not just the console box.
  - Show the shortcut hints in menus and tooltips (LaserGRBL dropped this).

### LG-CTRL-20 Hotkey editor

- **What it does:** Edit and remove shortcuts with duplicate detection.
- **Where in the UI:** Menu **Grbl → Hotkeys** opens `HotkeyManagerForm`: a grid with the columns Action (enum name) and Shortcut, plus Save and Cancel buttons.
- **Options & defaults:** —
- **Behaviour & gotchas:** Select a row and press a combination to assign it. A combination is valid only if it contains at least one letter, digit, numpad digit or F1–F24 key. Modifier-only combinations and Numpad + − * / are therefore **not assignable in the editor**, although they are used as defaults. Delete clears the row. Rows sharing a combination are marked "Duplicated value!" and Save is disabled. Save replaces the whole table and persists it.
- **Upstream source:** [`LaserGRBL/HotkeyManagerForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotkeyManagerForm.cs) (`ProcessCmdKey`, `ComputeErrors`), [`LaserGRBL/HotKeysManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotKeysManager.cs) (`ValidShortcut`, `GetEditList`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`WriteHotkeys`)
- **webgrbl notes:** Status: not started. Capture with `keydown` on a focused "press a key" field, store `code` plus modifiers, and display a localised label (`navigator.keyboard.getLayoutMap()` where available). Warn when a binding is browser-reserved. Use friendly action names (i18n) instead of enum names. Add "reset to defaults".

### LG-CTRL-21 Laser head selection (laser life counter)

- **What it does:** When several laser modules are registered, asks at connect which module is mounted, so that usage time is logged against it.
- **Where in the UI:** `LaserSelector` modal dialog with one combo box, shown on connect. Modules are managed in the Laser Usage dialog (status bar hours label or menu **Grbl → Laser Lifespan**; see [[lg-app-features]]).
- **Options & defaults:** Setting `Last laser used` (guid). Combo order: last used first, then alive modules by monitoring date (newest first), then dead modules.
- **Behaviour & gotchas:** No dialog when 0 modules are registered (no tracking), when exactly 1 is registered (alive or dead), or when exactly one is alive (it is chosen automatically). Cancelling the dialog leaves the module unset (the exception is caught and nothing is tracked). This only affects usage statistics; nothing is sent to the machine.
- **Upstream source:** [`LaserGRBL/LaserSelector.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LaserSelector.cs), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`LaserLifeHandler.OnConnect`, `LaserLifeCounter`)
- **webgrbl notes:** Status: not started. Tie the laser module to a machine profile (webgrbl can remember the port with `SerialPort.getInfo()` USB vendor/product IDs), and use the module to preset the max power and material library entries.

### LG-CTRL-22 Firmware-specific control differences

- **What it does:** Changes how controls behave depending on the selected firmware type (Settings → Firmware: Grbl, Smoothie, Marlin, VigoWork; changing it needs a restart).
- **Where in the UI:** Settings dialog. The main menu title shows the core type, and the window title gets ` (for <Type>)` for non-GRBL firmware.
- **Options & defaults:** `Firmware Type`, default **Grbl**.
- **Behaviour & gotchas:**

| Aspect | Grbl | Smoothie | Marlin | VigoWork |
|---|---|---|---|---|
| Status query | `?` | `?` (plus `\n` at init) | `M114\n` (skipped while running) | `0x88` |
| Jogging | `$J=` if ≥1.1 | legacy G91/G1 | legacy G91/G1 | `$J=` if ≥1.1 |
| Soft reset | `0x18` | `reset\r\n` | nothing | `0x18` |
| Reset on connect | per setting | never | per setting (no-op) | per setting |
| Unlock button/menu | yes | hidden, no-op | hidden, no-op | yes |
| Grbl Configuration menu | yes | hidden | hidden | yes |
| Streaming | setting | forced Synchronous | forced Synchronous | buffer fixed at 127 |

- **Upstream source:** [`LaserGRBL/Core/SmoothieCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/SmoothieCore.cs), [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs), [`LaserGRBL/Core/VigoCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/VigoCore.cs)
- **webgrbl notes:** Status: not started. Model firmware as a strategy interface (`queryStatus`, `jog`, `reset`, `unlock`, `capabilities`) and choose it automatically from the welcome banner where possible, rather than through a setting that needs a restart. Probably start with GRBL/grblHAL only.

### LG-CTRL-23 Command availability gates

- **What it does:** Decides which controls are enabled.
- **Where in the UI:** Every control button, menu item and hotkey.
- **Options & defaults:** —
- **Behaviour & gotchas:** "connected" means status ∉ {Disconnected, Connecting}.

| Gate | Condition |
|---|---|
| `JogEnabled` | GRBL ≥1.1: connected and (Idle or Jog). Legacy: connected and (Idle or Run) and no program running |
| `CanDoHoming` | connected and (Idle or Alarm) and `$22` ≠ 0 |
| `CanUnlock` | connected and (Idle or Alarm) |
| `CanResetGrbl` | connected |
| `CanDoZeroing` | connected and Idle and WPos ≠ (0,0,0) |
| `CanFeedHold` | connected and Run |
| `CanResumeHold` | connected and (Door, Hold, Cooling or AutoHold) |
| `CanSendManualCommand` | connected and no program running |
| `CanReadWriteConfig` | connected and no program running and (Idle or Alarm) |
| Custom button | per `EnableStyle` (see LG-CTRL-15) |

- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`Can*` properties, `JogEnabled`), [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs) (`TimerUpdate`)
- **webgrbl notes:** Status: in progress. Partly done ([[machine-control]]): `getMoveAvailability` gates jog (connected, Idle or Jog), Home (homing switches, Idle or Alarm) and Set zero (Idle); `getCanFireLaserPointer` gates the pointer (connected, Idle); both refuse during a job run ([[running-jobs]]); Unlock needs Alarm. The remaining gates come with their features. Original advice: Derive these as pure selectors from a single machine-state store, so React re-renders on changes instead of polling a timer. Unit-test the table.

## Upstream Source

- [`LaserGRBL/JogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/JogForm.cs) - jog pad, step and speed sliders, Z buttons
- [`LaserGRBL/UserControls/Move2DControl.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/Move2DControl.cs) - unused circular jog widget
- [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) - jog generation, continuous jog, reset/hold/resume/homing/unlock/zero, overrides, status parsing, custom-code evaluator, gates, laser life
- [`LaserGRBL/Core/SmoothieCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/SmoothieCore.cs), [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs), [`LaserGRBL/Core/VigoCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/VigoCore.cs) - firmware variants
- [`LaserGRBL/CustomButton.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CustomButton.cs), [`LaserGRBL/CustomButtonForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CustomButtonForm.cs) - custom button model, storage, editor
- [`LaserGRBL/StandardButtons.zbn`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StandardButtons.zbn) - default button set
- [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs) - control strip buttons and custom button area
- [`LaserGRBL/HotKeysManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotKeysManager.cs), [`LaserGRBL/HotkeyManagerForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotkeyManagerForm.cs) - hotkeys and editor
- [`LaserGRBL/UserControls/LabelTB.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/LabelTB.cs) - override sliders
- [`LaserGRBL/UserControls/GrblPanel.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel.cs), [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) - click-to-jog and position overlay
- [`LaserGRBL/LaserSelector.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LaserSelector.cs) - laser module picker
- [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) - menus, status bar, override labels, key dispatch
- [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) - continuous jog, Z jog, click-n-jog and reset-on-connect options
- [`LaserGRBL/Tools/ExpressionEvaluator.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/ExpressionEvaluator.cs) - `[expr]` evaluator
