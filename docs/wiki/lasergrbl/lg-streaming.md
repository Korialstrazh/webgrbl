---
title: Job Streaming & Console (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# Job Streaming & Console

This article covers how LaserGRBL feeds G-code to the controller over an open connection: flow control, status polling, realtime commands and overrides. It also covers the job lifecycle (start, passes, pause, abort, completion), run-from-line and resume-after-interruption, error, alarm and hang handling, and the console (command log plus manual command entry). For opening the link and firmware detection, see [[lg-connection]].

## Key Takeaways

- **Pipeline.** Each core has one send queue, one "pending" FIFO (sent, awaiting `ok`/`error`) and one append-only "sent" list. The sent list doubles as the console log and the preview's executed marker. A TX loop sends, an RX loop parses lines, and both run under one lock.
- **Default flow control: Buffered.** This is Grbl character counting. A line is sent only if `usedBuffer + len(line incl. \n) <= bufferSize`. Each `ok`/`error` frees the oldest pending line's length. `bufferSize` is 127 by default and auto-detected via `$I` `[OPT:]` or the first `Bf:` value.
- **Lines are compacted before sending.** Non-`$` lines are uppercased (file content) and all spaces are stripped. `$` lines are sent as-is. `$n=value` (EEPROM write) lines force synchronous behaviour until acked.
- **Status polling.** `?` (0x3F) is sent on a timer: 250 ms with the effective default "UltraFast" threading mode, configurable 200–2000 ms. Grbl 1.1 `<State|MPos|WPos|WCO|Bf|FS|F|Ov>` reports are parsed; 0.9 comma format is supported. Status reports are not shown in the console.
- **Errors never stop a job.** They are counted (warning sound, `[N lines, E errors, time]` summary). `RepeatOnError` mode retries a failed line up to 3 times. Alarms only flag an "issue"; the queue keeps streaming.
- **Abort is soft.** It clears LaserGRBL's queue and enqueues `M5`, with no feed hold and no reset, so the controller finishes whatever is already in its RX and planner buffers. Reset (`0x18`) is the hard stop.
- **Interrupted jobs resume.** The Resume dialog uses an issue code (StopResponding, UnexpectedReset, ManualReset, UnexpectedDisconnect, ManualDisconnect, ManualAbort, MachineAlarm) to suggest where to restart: 17 lines back (planner depth), the last sent line, a specific line, or from the beginning. It can optionally re-home and restore WCO via `G92`.
- **Lifecycle extras.** Before every job start (not between passes) a 5-second safety countdown appears. The custom header is pushed before the job, passes code between loops, and the footer after the last loop.
- **Browser notes.** Run the streaming engine in a Web Worker or dedicated module to keep it off the UI thread. Web Serial writes are async (await the `WritableStreamDefaultWriter`), so character counting must count bytes actually written, and realtime bytes must bypass the line queue with no awaiting behind a long write.

## Features

### LG-STRM-01 G-code line model (`GrblCommand`)

- **What it does:** Represents one line to send, its parsed words, its serialized form and its result.
- **Where in the UI:** Each line becomes a row in the console ([[#LG-STRM-21 Command log / console|LG-STRM-21]]).
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  - **Construction:**
    - The line is trimmed.
    - It is uppercased unless `preservecase` is set. Manual commands, custom code, header/footer and config writes preserve case; file lines are uppercased.
    - An optional retry count can be attached.
  - **Serialization (`SerialData`):**
    - Lines not starting with `$` have all spaces removed. This includes spaces inside `( comments )`.
    - `$` lines are sent verbatim.
    - `\r`, `\n` and spaces are trimmed, then a single `\n` is appended.
  - **Parsing (`BuildHelper`):**
    - Runs only for non-`$` lines and on demand.
    - `;` ends the line; `( … )` is a comment.
    - Letters start words; digits, `.` and `-` accumulate the number.
    - Each letter is kept once (the last one wins on duplicates; this throws and is swallowed).
    - Exposes `G`, `M`, `X/Y/Z/I/J/R/F/S/P/T`, `IsMovement`, `IsArcMovement`, `IsPause` (G4), `IsLaserON` (M3/M4), `IsM5`, `IsSetWCO` (G92), `IsWriteEEPROM` (`$n=…`).
  - **Status** is derived from the result text: `null` = Queued, `""` = WaitingResponse, `OK…` = ResponseGood, `ERROR…` = ResponseBad, anything else = InvalidResponse.
  - **Error decoding:** `error:N` shows a brief text and a tooltip description from `error_codes.csv` ([[lg-connection]] LG-CONN-16).
- **Upstream source:** [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`GrblCommand`, `SerialData`, `BuildHelper`, `Status`, `GetResult`, `GrblMessage`), [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) (`StatePositionBuilder`, modal state)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Keep an immutable `{ raw, wire, words }` record. Compute `wire` at load time in a worker, not per send.
  - Do not strip spaces inside comments; better, strip comments entirely, which saves RX buffer.
  - Strip only spaces that Grbl ignores; do not strip spaces inside string args of grblHAL/FluidNC `$` commands.
  - Precompute byte length with `TextEncoder`, since non-ASCII in comments makes char count differ from byte count.

### LG-STRM-02 Buffered streaming (character counting) & buffer size

- **What it does:** Keeps the controller's serial RX buffer as full as possible without overflowing it. This is the standard Grbl "character-counting" protocol.
- **Where in the UI:**
  - Settings > Protocol > "Streaming Mode: [Default Buffered]" (info: `https://lasergrbl.com/configuration/#streaming-mode`).
  - Status bar buffer gauge, tooltip `Buffer: used/size Free:n`.
- **Options & defaults:**
  - `Streaming Mode` = `Buffered`.
  - Buffer size starts at 127 on every connect.
- **Behaviour & gotchas:**
  - **Sending:**
    - `CanSend` = there is a next line and `usedBuffer + SerialData.Length <= BufferSize`.
    - On send, the line is marked "sending", appended to the sent log and the pending FIFO, removed from the queue and written, and `usedBuffer += length`.
    - On each `ok`/`error`, the head of the pending FIFO gets the result, is dequeued, and `usedBuffer -= its length` (floored at 0).
  - **Auto-sizing:**
    - Forced from `$I` `[OPT:…,…,rx]` when rx > 127.
    - Otherwise taken only once, while still at 127, from the status field `Bf:blocks,rxFree`, and only when rxFree is a known size: 128 (Grbl 1.1), 254 (Ortur), 255 (Grbl-Mega fixed), 256 (Grbl-Mega), 10240 (Grbl-LPC). This guards against noise.
    - VigoWork is fixed at 127.
  - **Firmware overrides:** Smoothie and Marlin cores force Synchronous regardless of the setting.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`CanSend`, `PeekNextCommand`, `HasSpaceInBuffer`, `SendLine`, `SendToSerial`, `ManageCommandResponse`, `ParseBf`, `EnlargeBuffer`, `BufferSize`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Port as a pure state machine (`onLineQueued`, `onAck`, `canSend`) with exhaustive unit tests, then drive it with the TS emulator ([[lg-connection]] LG-CONN-06).
  - Count UTF-8 bytes.
  - Consider leaving a small safety margin (e.g. bufferSize − 1) for injected realtime bytes on clones.
  - Expose a "planner/RX buffer" live chart in a diagnostics panel.

### LG-STRM-03 Synchronous & RepeatOnError streaming modes

- **What it does:** Provides alternatives to buffered streaming for unreliable links or firmware without character-counting support.
- **Where in the UI:** Settings > Protocol > Streaming Mode: `Buffered`, `Synchronous`, `RepeatOnError`.
- **Options & defaults:** `Buffered` (default).
- **Behaviour & gotchas:**
  - **Synchronous:** the next line is sent only when nothing is pending (send-response). The buffer-space check still applies.
  - **RepeatOnError:** synchronous, plus a retry rule. While a program runs, if a line returns `error`, nothing else is pending, and it has been retried fewer than 3 times, a copy with `RepeatCount+1` is put in a one-slot retry queue that is sent before the normal queue. The retry shows in the console as `<line> (Retry n)`.
  - Retries do not advance the executed counter or progress time; errors still increment the error count.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`StreamingMode`, `PeekNextCommand`, `RemoveManagedCommand`, `ManageCommandResponse`, `mRetryQueue`)
- **webgrbl notes:** Status: not started.
  - Keep all three modes; they are cheap.
  - Retrying on error is dubious for motion lines (the line may have partially executed); it is mainly useful for noisy links causing `error:1`/`error:2` from corrupted bytes. Explain this in the UI.

### LG-STRM-04 EEPROM-write synchronisation

- **What it does:** Avoids losing serial data while Grbl writes settings to EEPROM, during which Grbl cannot receive.
- **Where in the UI:** Implicit.
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  - If the head of the pending FIFO is a `$n=value` line, `PeekNextCommand` returns nothing, so no further line is sent until that line is acked, in any streaming mode.
  - A good ack also updates the cached configuration with the written value.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`PeekNextCommand`, `ManageCommandResponse`), [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`IsWriteEEPROM`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Keep this behaviour.
  - Extend it to the other EEPROM-writing commands Grbl documents (`G10 L2/L20`, `G28.1`, `G30.1`, `$N0=`, `$RST=`, `$I=`), which the upstream comment flags as missing.

### LG-STRM-05 Threading mode (poll rate & loop timing)

- **What it does:** Trades CPU and serial load against responsiveness by setting the status poll period and the TX/RX loop sleeps.
- **Where in the UI:** Settings > Protocol > "Threading Mode" (info: `https://lasergrbl.com/configuration/#threading-mode`).
- **Options & defaults:**

  | Mode | `?` period (ms) | TX sleep idle/busy (ms) | RX sleep idle/busy (ms) |
  | --- | --- | --- | --- |
  | Insane | 200 | 1 / 0 | 0 / 0 |
  | UltraFast | 250 | 1 / 0 | 0 / 0 |
  | Fast | 500 | 5 / 1 | 1 / 0 |
  | Quiet | 1000 | 10 / 2 | 1 / 1 |
  | Slow | 2000 | 15 / 4 | 2 / 1 |

  - The default is inconsistent. The label says "[Default Fast]" and the constructor default is Fast, but the runtime getter and the Settings combo default to UltraFast. Effective default when never saved: UltraFast (250 ms).
  - Upgrading from versions before 4.5.0 migrates Insane/UltraFast to Fast.
- **Behaviour & gotchas:**
  - TX loop per tick:
    1. Connect-timeout check.
    2. Continuous-jog handling ([[lg-machine-control]]).
    3. Send at most one line if possible.
    4. Auto-cooling check.
    5. `?` if the poll timer expired.
    6. Hang detection.
    7. Choose the sleep: short sleep if more can be sent.
  - The poll period re-reads the setting every tick, so changes apply live.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ThreadingMode`, `ThreadTX`, `ThreadRX`, `CurrentThreadingMode`)
- **webgrbl notes:** Status: not started.
  - No threads in the browser. Use an event-driven sender: try to send on enqueue and on each ack, plus a `setInterval` poll. Expose only "status poll interval" (default 250 ms; 200–1000 ms).
  - Background tabs throttle timers to at most once per second (or worse). Run the streamer in a dedicated Worker, which is less throttled, and keep the tab alive during jobs, warning the user if hidden.

### LG-STRM-06 Status polling & report parsing

- **What it does:** Tracks machine state, position, offsets, buffer, feed/spindle and overrides.
- **Where in the UI:**
  - Status bar state label.
  - Position readouts and preview cursor ([[lg-preview]]).
  - Override labels.
  - Buffer gauge.
- **Options & defaults:** Poll period from [[#LG-STRM-05 Threading mode (poll rate & loop timing)|LG-STRM-05]].
- **Behaviour & gotchas:**
  - **Query byte by firmware:**
    - Grbl/Smoothie: `?` (0x3F), muted in the log.
    - VigoWork: 0x88.
    - Marlin: `M114\n` when not running.
  - **Grbl 1.1 reports** (`<…>` containing `|`):
    - The first field is the state; text after `:` is dropped (`Hold:0`, `Door:1`).
    - `MPos:` sets the machine position.
    - `WPos:` sets MPos = WCO + WPos.
    - `WCO:` sets the work offset (remembered as "last known WCO" for resume).
    - `Bf:` sets blocks and RX free ([[#LG-STRM-02 Buffered streaming (character counting) & buffer size|LG-STRM-02]]).
    - `FS:f,s` sets feed and spindle; `F:f` sets feed with spindle 0 (Smoothie parses `F:f,s`).
    - `Ov:feed,rapid,spindle` updates the overrides ([[#LG-STRM-09 Realtime overrides|LG-STRM-09]]).
    - Other fields (`Pn`, `A`, `Ln`, …) are ignored.
  - **Grbl 0.9 reports:** `<Idle,MPos:x,y,z,WPos:x,y,z>`, with WCO computed as MPos − WPos.
  - **Version fallback:** the report version is guessed from the format if the welcome banner was never seen ([[lg-connection]] LG-CONN-09).
  - **Timers:** each report restarts the "last status" timer (used by hang detection). Any position change restarts the "last activity" timer.
  - **Gotchas:**
    - The state is parsed with `Enum.Parse` against `Idle, Run, Hold, Door, Home, Alarm, Check, Jog, Queue, Tool` (case-sensitive). States outside this list (e.g. Grbl `Sleep`) throw and are only logged, so the state stays stale.
    - F and S are also fed to the laser-usage counter ([[lg-app-features]]).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`QueryPosition`, `ManageRealTimeStatus`, `ParseMachineStatus`, `ParseMPos`, `ParseWPos`, `ParseWCO`, `ParseBf`, `ParseFS`, `ParseF`, `ParseOverrides`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Write a tolerant parser (unit-tested with real report fixtures) that handles `Sleep`, grblHAL `Tool`, and FluidNC extra fields, and keeps unknown fields in a map for display.
  - With `$10` configured, Grbl may omit `WCO` in most reports; keep the last WCO, as LaserGRBL does.
  - Show the `Pn:` pin states (limit, probe, door) in a diagnostics widget, which LaserGRBL lacks.

### LG-STRM-07 Machine states & status display

- **What it does:** Shows the controller state, with LaserGRBL-specific refinements.
- **Where in the UI:**
  - Status-bar state label, coloured:
    - red: Alarm
    - orange: Door, Hold, Cooling, AutoHold
    - light green: Run, Jog, Check
    - neutral: others
  - The window title and button enablement follow the state.
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  - **States:** `Disconnected, Connecting, Idle, Run, Hold, Door, Home, Alarm, Check, Jog, Queue, Cooling, AutoHold, Tool`.
  - **Remapping:**
    - `Idle` while a program is running is shown as `Run`; Grbl reports Idle during `G4` dwell.
    - `Hold` caused by auto-cooling becomes `Cooling` ([[#LG-STRM-24 Automatic cooling cycles|LG-STRM-24]]).
    - `Hold` not requested by the user (M0, firmware) becomes `AutoHold`.
    - Leaving any hold state clears both "hold by user" and "hold by cooling" flags.
  - **Side effects of state changes:**
    - Entering a non-Run/Idle state during a job pauses the job timer; returning resumes it.
    - `Disconnected` zeroes F/S.
    - Connect and disconnect sounds play ([[lg-app-features]]).
  - **Enablement rules:**
    - CanSendFile: connected, has program, Idle or Check, queue empty, not already starting.
    - CanAbort: connected, has program, and (Run, any hold, or queue not empty).
    - CanFeedHold: Run.
    - CanResume: Door or any hold.
    - CanReset: connected.
    - CanSendManualCommand: connected and not in program.
    - CanReadWriteConfig: connected, not in program, Idle or Alarm.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`MacStatus`, `SetStatus`, `ParseMachineStatus`, `Can*` properties), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`TimerUpdate`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Derive all button enablement from one selector over `{connection, machineState, job}` so rules stay consistent.
  - Show substate (`Hold:0` vs `Hold:1`, `Door:0..3`) and a human hint per state ("Alarm: press Unlock or Home").
  - Provide colour-blind-safe status colours plus an icon.

### LG-STRM-08 Realtime commands: feed hold, resume, soft reset, safety door

- **What it does:** Sends single-byte commands that bypass the line queue and act immediately.
- **Where in the UI:**
  - Preview toolbar buttons: Reset (lightning icon), Stop/Hold, Resume ([[lg-machine-control]]).
  - Menu Grbl > Reset.
  - Hotkeys (defaults):
    - Ctrl+X: Reset
    - F6: Pause job
    - F7: Resume job
  - Custom code (`!`, `~`, `?`, `ctrl-x`, `0xNN`; [[#LG-STRM-10 Job start (Send to machine)|LG-STRM-10]]).
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  - **Feed hold:** `!` (0x21), only when Run. Sets the "hold by user" flag, or the cooling flag when used by auto-cooling.
  - **Cycle start/resume:** `~` (0x7E), when Door or any hold. Clears both hold flags.
  - **Safety door:** `@` (0x40). The API exists but nothing in the UI calls it.
  - **Reset** (`GrblReset`, enabled whenever connected):
    1. If a job is running, raise issue `ManualReset`.
    2. Clear the queue, pending lines and the console log.
    3. Zero the buffer counter and end the job timer.
    4. Reset target and current overrides to 100.
    5. Send `0x18`. Smoothie sends `reset\r\n` instead; Marlin sends nothing.
    - Grbl then prints its banner, which triggers the startup handling again ([[lg-connection]] LG-CONN-09).
  - **Jog cancel:** `0x85` is used by continuous jog ([[lg-machine-control]]).
  - Realtime writes are skipped silently if the port is closed.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`FeedHold`, `CycleStartResume`, `SafetyDoor`, `GrblReset`, `InternalReset`, `SendImmediate`, `SendBoardResetCommand`), [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs), [`LaserGRBL/HotKeysManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotKeysManager.cs)
- **webgrbl notes:** Status: improved (stop holds before the reset and keeps the position) — see [[grbl-engine]].
  - Implement a priority write path. Hold one `WritableStreamDefaultWriter` and serialize writes through a tiny async mutex, so a realtime byte is written right after the current chunk. Never queue it behind pending lines.
  - Large G-code writes should be per-line to keep realtime latency low.
  - Make hold/reset reachable via big always-visible buttons and the keyboard (Space = hold?), also as PWA shortcuts.
  - Consider a "stop" that does hold, waits for Hold:0, then resets, to keep position (Grbl's recommended way to preserve position).

### LG-STRM-09 Realtime overrides

- **What it does:** Adjusts feed (G1), rapid (G0) and power (S) overrides live during a job.
- **Where in the UI:**
  - Status bar labels `G0 [1.00x]`, `G1 [1.00x]`, `S [1.00x]`, coloured pink above 100% and light blue below. Each has a slider drop-down (`LabelTB`): rapid 25/50/100, feed and power 10–200.
  - Hotkey actions Override{Power,Linear,Rapid}{Default,Up,Down}, unbound by default.
  - Visible only for Grbl ≥ 1.1.
- **Options & defaults:**
  - Feed and power: target 100 (range 10–200, ±1 per hotkey press).
  - Rapid: 25/50/100 (hotkey halves or doubles).
  - All are reset to 100 on reset, connect and welcome banner.
- **Behaviour & gotchas:**
  - The UI sets target values. On each status report containing `Ov:`, the core compares target with current and sends at most one byte per axis per report, converging over successive polls.
  - Feed bytes:
    - 0x90: reset to 100 (if target is 100 and current is not)
    - 0x91: +10 (if the gap is ≥ 10)
    - 0x92: −10 (if the gap is ≤ −10)
    - 0x93: +1
    - 0x94: −1
  - Power: 0x99 reset, 0x9A +10, 0x9B −10, 0x9C +1, 0x9D −1.
  - Rapid: 0x95 = 100%, 0x96 = 50%, 0x97 = 25%.
  - Grbl only includes `Ov:` periodically (and after a change), so convergence can take several polls. Without `Ov:` in reports nothing is sent.
  - The override UI itself is shared with [[lg-machine-control]].
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ManageOverrides`, `ParseOverrides`, `ChangeOverrides`, `HotKeyOverride`, `TOverride*`), [`LaserGRBL/UserControls/LabelTB.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/LabelTB.cs), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`RefreshOverride`)
- **webgrbl notes:** Status: not started.
  - Send the computed burst of bytes immediately on slider release (e.g. 0x91 ×3 + 0x93 ×2) instead of one per poll. Then reconcile with the next `Ov:`.
  - Bytes ≥ 0x80 must go as raw bytes. Never send them as UTF-8 text (WebSocket text frames!).
  - Add a laser-specific "power override" readout in % of `$30`.

### LG-STRM-10 Job start (Send to machine)

- **What it does:** Streams the loaded program, wrapped in the custom header (and footer at the end).
- **Where in the UI:**
  - Connection panel Run button (play icon), swapped with Abort while a job runs.
  - Menu File > "Send To Machine".
  - Hotkey F5.
  - Syncro start ([[#LG-STRM-25 Syncro start across instances|LG-STRM-25]]).
- **Options & defaults:**
  - Settings > GCode tab:
    - Header (`GCode.CustomHeader` = `G90 (use absolute coordinates)`): "LaserGRBL will append this GCode before starting any job."
    - Passes (`GCode.CustomPasses`): commented-out Z-sink template.
    - Footer (`GCode.CustomFooter` = `G0 X0 Y0 Z0 (move back to origin)`).
  - Loop count: [[#LG-STRM-12 Multiple passes (loop counter)|LG-STRM-12]].
- **Behaviour & gotchas:**
  - **Fresh start vs resume:** if the job has never run, or the last run completed (`executed == 0` or `executed == target`), the job starts from the beginning. Otherwise the Resume dialog opens ([[#LG-STRM-17 Resume interrupted job|LG-STRM-17]]).
  - **Start from beginning:**
    1. Safety countdown ([[#LG-STRM-11 Safety countdown|LG-STRM-11]]); cancel aborts the start.
    2. Clear the queues and the console log.
    3. Reset the job timer.
    4. Optionally `$H`.
    5. Push the header via custom-code execution.
    6. Clone every file line into the queue.
    7. Start the job timer. The target count is the queue length, which includes the header lines.
  - **Custom-code execution (header, footer, passes, custom buttons):**
    - Split on CRLF; skip blank lines.
    - Substitute `[expr]` with the evaluated value (3 decimals). Variables: `left`, `right`, `top`, `bottom`, `width`, `height` of the drawing, `jogstep`, `jogspeed`, `WCO.X/Y/Z`, `MPos.X/Y/Z`, `WPos.*` (bug: returns MPos), and every numeric `$n` setting (`$30` defaults to 1000 if missing).
    - Lines equal to `ctrl-x`, `?`, `!`, `~` or `0xNN` are sent as realtime bytes (`!` also sets the user-hold flag).
    - Everything else is enqueued, case preserved.
    - Custom buttons are in [[lg-machine-control]].
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`RunProgram`, `RunProgramFromStart`, `OnJobBegin`, `ExecuteCustomCode`, `EvaluateExpression`, `EvaluateCB`, `IsImmediate`, `GCODE_STD_*`), [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`BtnRunProgramClick`), [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs)
- **webgrbl notes:** Status: not started.
  - Stream from a pre-serialized array in a worker. For huge raster files (millions of lines), avoid cloning per line and keep the log virtualized ([[#LG-STRM-21 Command log / console|LG-STRM-21]]).
  - Keep header/footer/passes with the same expression variables, and fix the `WPos` bug.
  - Add a pre-flight check before start: bounds vs `$130/$131`, laser mode `$32`, homing state.
  - Request a Screen Wake Lock for the job duration.

### LG-STRM-11 Safety countdown

- **What it does:** Reminds the user to wear goggles before the laser fires.
- **Where in the UI:** Modal dialog "Safety first!" with the goggles icon, the text "Engraving is about to start. Please wear your safety goggles!", and the buttons `Start (n)` and `Cancel`.
- **Options & defaults:**
  - Settings > Options: "Disable Safety Countdown" (`DisableSafetyCountdown` = `false`).
  - "Quiet Countdown" (`QuietSafetyCountdown` = `false`; disables the beep).
- **Behaviour & gotchas:**
  - Counts down from 5 at 1 s ticks, beeping (`Sound\beep.wav`) on show and on each tick. It auto-starts at 0.
  - Start proceeds immediately; Cancel aborts.
  - Shown before a fresh start, run-from-position and resume. Not shown between passes.
- **Upstream source:** [`LaserGRBL/SafetyCountdown.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SafetyCountdown.cs) (`CanGo`)
- **webgrbl notes:** Status: not started.
  - Use Web Audio for the beep (needs a prior user gesture, which the Send click provides).
  - Make the countdown length configurable.
  - Optionally require an explicit "I'm wearing goggles" checkbox on first run.

### LG-STRM-12 Multiple passes (loop counter)

- **What it does:** Repeats the whole program N times, for cutting thick material.
- **Where in the UI:** Connection panel numeric up-down next to Run (loop counter).
- **Options & defaults:**
  - 1–99, default 1, not persisted.
  - Between-pass code: `GCode.CustomPasses`, default (all commented): `;(Uncomment if you want to sink Z axis)` / `;G91` / `;G0 Z-1` / `;G90`.
- **Behaviour & gotchas:**
  - When a pass completes and the loop count is above 1 (and the state is not `Check`), the core:
    1. Logs `[N lines, E errors, time]`.
    2. Fires `OnProgramEnded`.
    3. Decrements the loop counter; the UI shows it counting down and ends at 1.
    4. Restarts the file with the passes code pushed first. The header is not repeated, there is no countdown, and the global timer keeps running.
  - The footer runs only after the last pass.
  - Check mode (`$C`) never loops.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`OnProgramEnd`, `OnJobCycle`, `LoopCount`), [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`UDLoopCounter_ValueChanged`)
- **webgrbl notes:** Status: not started.
  - Show "pass k of N" rather than mutating the user's counter.
  - Optionally allow per-pass Z step or power ramp as structured fields instead of free G-code.
  - Saving with passes is in [[lg-gcode-files]].

### LG-STRM-13 Job completion

- **What it does:** Detects the end of the job and notifies the user.
- **Where in the UI:**
  - Console diagnostic line `[N lines, E errors, h,m,s]`.
  - "Success" sound.
  - Telegram notification ([[lg-app-features]]).
- **Options & defaults:** `TelegramNotification.Threshold` = 1 min. No notification for jobs shorter than this.
- **Behaviour & gotchas:**
  - The end is detected when, during a program, the queue is empty and nothing is pending, right after an ack.
  - On the last pass:
    1. Log the summary.
    2. Fire `OnProgramEnded` (3D preview refresh).
    3. Push the footer. It is enqueued after the job ends, so it does not count in progress.
    4. Play the success sound.
    5. Send a Telegram "Job Executed" message (lines, errors, time) if enabled and the total time ≥ the threshold.
    6. Marlin only: force `Idle`.
  - Note "complete" means all lines acked, not that motion stopped. Grbl may still be executing the planner buffer.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ManageCommandResponse`, `OnProgramEnd`, `OnJobEnd`)
- **webgrbl notes:** Status: not started.
  - Mark the job finished only when all lines are acked and the state returns to Idle, which is more accurate.
  - Use the Notifications API (and optionally the Badging API) for "job done" when the tab is in the background.
  - Keep a persistent job history (IndexedDB) with duration, errors and file name.

### LG-STRM-14 Abort job

- **What it does:** Stops sending the rest of the job.
- **Where in the UI:**
  - Connection panel Abort button (stop icon; visible while a job is running or the queue is non-empty) with the confirmation "Abort current job?" (default No).
  - Hotkey Ctrl+F5, which aborts without confirmation.
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  1. Raise issue `ManualAbort` (negative code, so no issue dialog).
  2. End the job timer.
  3. Clear LaserGRBL's send queue, then enqueue `M5`.
  - Pending lines are not cleared. No feed hold or reset is sent, so the controller finishes its RX buffer (up to ~127–1024 bytes) and planner (~15 blocks) before the `M5` executes.
  - The next Send offers Resume with "Start again from beginning" preselected.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`AbortProgram`, `CanAbortProgram`), [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`BtnAbortProgram_Click`)
- **webgrbl notes:** Status: not started.
  - Offer two clear actions:
    - "Stop after buffer" (LaserGRBL behaviour).
    - "Stop now": `!`, wait for Hold:0, `0x18`, which keeps position, then optional `$X`.
  - Always ensure the laser is off (`M5`, and S0 for safety).

### LG-STRM-15 Job progress & time projection

- **What it does:** Shows sent and executed progress, elapsed time, and estimated or projected total time.
- **Where in the UI:**
  - Connection panel double progress bar: bar 1 = sent, bar 2 = executed, max = target lines; the text shows elapsed job time.
  - Status bar "Estimated time" (before the job) / "Projected time" (during the job).
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  - The `TimeProjection` object tracks:
    - Target count (queue length at start).
    - Sent and executed counts (excluding retries).
    - Error count.
    - Start/end times, plus a global start/end across passes.
    - Cumulative pause time: pauses start when the state leaves Run/Idle and end on return.
  - Each file line carries a precomputed cumulative estimated time (`TimeOffset`, see [[lg-gcode-files]] / [[lg-preview]]).
  - Projected total = real job time (minus pauses) × estimated total / estimated time of the last executed line, plus pauses.
  - Resume uses `JobContinue` with a correction, so counters reflect file line numbers.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`TimeProjection`: `JobStart`, `JobContinue`, `JobSent`, `JobExecuted`, `JobPause`, `JobResume`, `JobEnd`, `ProjectedTarget`), [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`TimerUpdate`)
- **webgrbl notes:** Status: not started.
  - Show remaining time and ETA clock time, a percentage, and current line / total.
  - Use `performance.now()` (monotonic).
  - Treat "sent − executed" as the buffered lookahead, and render it in the preview.
  - Upstream calls a HiRes timer each tick to detect system sleep. In the browser, detect large timer gaps (`visibilitychange`, resume) and flag possible stalls.

### LG-STRM-16 Run from position

- **What it does:** Starts the loaded program at a chosen line, skipping earlier lines while restoring the modal state.
- **Where in the UI:**
  - Menu File > "Send From Position" (enabled when CanSendFile).
  - Dialog "Run From Position": "This feature allow to run your job starting from a specific line, skipping any previous movement", radio "Run from specific line" with "Line #", checkbox "Do Homing [$H]".
- **Options & defaults:**
  - Line # range 1 … lineCount+1, default 1.
  - Homing checkbox visible only if homing is enabled (`$22`), default unchecked.
- **Behaviour & gotchas:**
  - The `ContinueProgramFromKnown(position, homing, setWco=false)` sequence:
    1. Safety countdown.
    2. Clear the queue; the log is kept.
    3. Log `[resume from #N]`.
    4. Optional `$H`.
    5. Replay lines `0..N-2` through `StatePositionBuilder` to compute the last X/Y/Z/F/S and the modal groups.
    6. Enqueue `G90`.
    7. Enqueue `M5 G0 X… Y… Z… F… S…` (rapid to the position with the laser off, setting feed and power).
    8. Enqueue a line of all "settled" modal words (coordinate system, plane, distance mode, arc distance, feed mode, cutter comp, tool length, program mode, coolant, spindle M3/M4).
    9. Enqueue the remaining lines. If the first motion line has no explicit G word, the computed motion mode (G0/G1/G2/G3) is prepended.
  - The header is not re-sent.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`RunProgramFromPosition`, `ContinueProgramFromKnown`), [`LaserGRBL/RunFromPositionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RunFromPositionForm.cs), [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) (`AnalyzeCommand`, `GetSettledModals`)
- **webgrbl notes:** Status: not started.
  - Let the user pick the start point by clicking the preview path (map click to line) or scrubbing a slider, which beats typing a line number.
  - Show the computed restore preamble before sending.
  - Handle relative-mode (G91) files correctly; upstream forces G90 for the rapid but then restores the settled distance mode.

### LG-STRM-17 Resume interrupted job

- **What it does:** After an interrupted job, offers smart restart points.
- **Where in the UI:**
  - Opens automatically when pressing Send on an incomplete job.
  - Dialog "Resume Job": "LaserGRBL detected last job was not completed!" with the Cause, and the radios:
    - "Start again from beginning [safe]"
    - "Resume some lines before the stop" (shows the line number)
    - "Resume from last command sent" (shows the line number)
    - "Resume from specific line" (Line #)
  - Checkboxes "Redo Homing [$H]" and "Home @ X… Y… [Z…]" (restore WCO).
- **Options & defaults:**
  - "Some lines before" = max(0, executed − 17) + 1 (Grbl planner depth ≈ 16), disabled if that equals 1.
  - "Last sent" = sent + 1.
  - The specific-line spinner defaults to and is capped at last sent + 1.
  - Preselection by cause:
    - StopResponding, UnexpectedReset, ManualReset: "some lines before" (or the beginning if disabled), since the buffers were lost.
    - ManualDisconnect, UnexpectedDisconnect: "last command sent", since the buffers probably completed.
    - ManualAbort: the beginning.
  - "Redo Homing": visible if homing is enabled. Checked if MPos is zero (position likely lost) and the cause is not ManualAbort/ManualReset.
  - "Restore WCO": visible and checked if the current WCO is zero but a last known WCO exists.
- **Behaviour & gotchas:**
  - Choosing the beginning runs [[#LG-STRM-10 Job start (Send to machine)|LG-STRM-10]] with optional homing. Any other choice runs the run-from-position sequence ([[#LG-STRM-16 Run from position|LG-STRM-16]]).
  - With WCO restore, `G92 X Y Z` is enqueued, where cur = (0 if homing else MPos) − last WCO.
  - If resuming mid-job while homing is suggested but unchecked, the dialog warns "It seems that the current position is no longer known by Grbl…" (OK/Cancel).
  - The resume state lives in memory only. It does not survive an app restart; an on-disk version exists but is commented out.
- **Upstream source:** [`LaserGRBL/ResumeJobForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ResumeJobForm.cs), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`UserWantToContinue`, `ContinueProgramFromKnown`, `TimeProjection.LastKnownWCO`, `LastIssue`)
- **webgrbl notes:** Status: not started.
  - Persist job progress (file hash, executed/sent line, last WCO, cause) to IndexedDB every few seconds, so resume works after a tab crash, a browser restart or a USB unplug. A PWA is likely to be closed accidentally, so this matters more than on desktop.
  - Visualize the candidate restart points on the preview.

### LG-STRM-18 Issue detector (job fault detection)

- **What it does:** Classifies why a running job failed and warns the user.
- **Where in the UI:**
  - Modal "Issue detector" dialog with Cause, a link to `https://lasergrbl.com/faq#issues`, and "Do not show again".
  - Settings > Protocol > "Issue detector" checkbox ("LaserGRBL can detect issues and warn the user providing info about how to solve them.").
- **Options & defaults:** `Do not show Issue Detector` = `false`.
- **Behaviour & gotchas:**
  - Issues are recorded only for the first fault while the job is in Run.
  - Detected (positive) issues show the dialog, send a Telegram "Job Issue" message, and play the "Fatal" sound:
    - `StopResponding`: Run plus in program, and no status report for more than max(10 × poll period, 5 s). The Marlin variant also needs 10 s of no reply or motion.
    - `UnexpectedReset`: a welcome banner arrived mid-job.
    - `UnexpectedDisconnect`: the link was lost.
    - `MachineAlarm`: an `ALARM:` line arrived mid-job.
  - User-caused (negative) issues are only recorded, for the resume preselection: `ManualReset`, `ManualDisconnect`, `ManualAbort`.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`DetectedIssue`, `SetIssue`, `DetectHang`, `DetectUnexpectedReset`, `ManageStandardBlockingAlarm`), [`LaserGRBL/IssueDetectorForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/IssueDetectorForm.cs), [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs) (`DetectHang`)
- **webgrbl notes:** Status: not started.
  - Use a non-modal banner with cause-specific guidance (e.g. a power-supply brown-out causing reset, USB cable/EMI for disconnects, the alarm code text).
  - Add a "USB unplugged" cause from the Web Serial `disconnect` event.
  - Log the issue to job history.

### LG-STRM-19 Error & alarm handling while streaming

- **What it does:** Defines what happens on `error:N` and `ALARM:N` during a job.
- **Where in the UI:**
  - Console: the error line shows a red result with the decoded brief and a tooltip description; alarm lines show the decoded alarm text.
  - Warning sound on each error.
- **Options & defaults:** Streaming mode (RepeatOnError retries, [[#LG-STRM-03 Synchronous & RepeatOnError streaming modes|LG-STRM-03]]). There is no "stop on error" option.
- **Behaviour & gotchas:**
  - **Errors:**
    - The job continues.
    - The error count is incremented and the warning sound plays.
    - It appears in the end summary.
  - **Alarms:**
    - `ALARM:` lines are logged and raise `MachineAlarm` once per job.
    - LaserGRBL keeps streaming. Grbl in Alarm rejects lines with `error:9`, so the rest of the job "completes" with errors unless the user resets or aborts.
    - The Alarm state pauses the job timer.
  - **Decoding:** error and alarm texts come from `error_codes.csv` / `alarm_codes.csv` (or the firmware-specific variants), for version ≥ 1.1.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ManageCommandResponse`, `ManageStandardBlockingAlarm`, `TimeProjection.JobError`), [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`GetResult`, `GetToolTip`, `GrblMessage`), [`LaserGRBL/CSV/error_codes.csv`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/error_codes.csv), [`LaserGRBL/CSV/alarm_codes.csv`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/alarm_codes.csv)
- **webgrbl notes:** Status: improved (stop on error halts the machine at once) — see [[grbl-engine]].
  - Add an "On error: continue / pause (feed hold) / abort" option, defaulting to pause for alarms.
  - On `ALARM`, stop the stream immediately (clear the queue) instead of pumping thousands of `error:9`s.
  - Show a summary list of errored lines, clickable to highlight them in the preview.

### LG-STRM-20 Buffer-stuck recovery & broken-ok handling

- **What it does:** Recovers when `ok`s are lost or corrupted (electrical noise), which would otherwise leave LaserGRBL believing the buffer is full forever.
- **Where in the UI:**
  - Status bar buffer gauge turns red (error state) when stuck.
  - The adjacent unlock button (`BtnUnlockFromStuck`) is enabled only when stuck. It confirms with "If the buffer is blocked, it is because there was some communication problem with your engraver. If you press "OK" LaserGRBL will ignore the full buffer and send the next commands…" (help link `http://lasergrbl.com/faq`).
- **Options & defaults:** None; the thresholds are hard-coded.
- **Behaviour & gotchas:**
  - **Stuck** = state Run, plus pending lines exist, plus `usedBuffer > 0`, plus no position change or ack for more than 10 s.
  - **Auto-unlock:** when stuck and the status `Bf:` reports RX free equal to the full buffer size (requires buffer reporting in `$10`), all pending lines get a fake `ok`. The log shows the warning "Unlock from buffer stuck!", and the comm log shows `Handle Missing OK [n] (auto|manual)`.
  - **Manual unlock:** same as auto-unlock, triggered from the button.
  - **Broken ok:** any RX line not matching a known pattern but containing `ok` (e.g. `o\x00k`, `kok`) is treated as `ok`, with the warning row "Handle broken ok!".
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`HandleMissingOK`, `IsBufferStuck`, `UnlockFromBufferStuck`, `CreateFakeOK`, `ManageBrokenOkMessage`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`TimerUpdate`, `BtnUnlockFromStuck_Click`)
- **webgrbl notes:** Status: not started.
  - Keep both mechanisms.
  - The broken-ok heuristic can misfire on messages containing "ok" (e.g. `[MSG:…token…]`), so restrict it to short lines (≤ 4 chars) or lines matching `/^\W*o\W*k\W*$/i`.
  - Recommend `$10` with buffer data so auto-unlock works, and surface in diagnostics how often it triggered.

### LG-STRM-21 Command log / console

- **What it does:** Shows every sent line with its result, plus all non-status messages from the controller and LaserGRBL diagnostics.
- **Where in the UI:** Connection panel, a custom-drawn list under the progress bar.
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  - **Row layout:** icon, left text, right text.
    - Icons: 0 queued/waiting, 1 ok, 2 error, 3 controller message, 4 LaserGRBL warning, 5 LaserGRBL diagnostic.
    - Left text is coloured by type: command, startup (`Grbl…`), alarm, config `$n=v`, feedback `[...]`, other.
    - The right text holds the result (`OK` / decoded error, colour good/bad/other). With icons on, it shows only errors.
  - **Decoding** (Grbl ≥ 1.1):
    - `$n=v` rows become `$n=v (brief)`, with a tooltip of the description and unit.
    - `ALARM:n` rows become the brief text, with the description in a tooltip.
    - Error rows show the brief text, with the description in a tooltip.
  - **Not logged:** status reports and `?` polls.
  - **Logged by LaserGRBL:** `[resume from #N]`, `[N lines, E errors, time]`, "Unlock from buffer stuck!", "Handle broken ok!".
  - **Scrolling:** follows the bottom only when the view is within 10 rows of the end.
  - **Clearing:** the list is the core's sent list, cleared on reset, on connect (soft-reset path) and on job start. It is not cleared on disconnect, run-from-position or resume.
  - **Gotchas:**
    - The list grows unbounded for the whole job.
    - `$$` / `$I` / config writes run on a private log, so they do not appear here.
- **Upstream source:** [`LaserGRBL/UserControls/CommandLog.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/CommandLog.cs) (`OnPaint`, `SetPosition`), [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`GrblMessage`, `IGrblRow`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`SentCommand`, `ManageGenericMessage`, `ClearQueue`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Use a virtualized list (only the visible rows rendered) backed by a ring buffer with a cap (e.g. 10k rows in the UI; full detail stays in the job model).
  - Add filters (hide ok-only rows, show errors only), search, copy/export, timestamps, and a "show status polls" debug toggle.
  - Never clear on connect; insert separators instead.

### LG-STRM-22 Manual command entry & history

- **What it does:** Sends free-form G-code or `$` commands from a text box.
- **Where in the UI:** Text box under the console, with the placeholder "type gcode here".
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  - **Enablement:** only when connected and no program is running.
  - **Keys:**
    - Enter sends the trimmed text (non-empty) through the normal queue (case preserved, spaces stripped unless it starts with `$`) and clears the box.
    - Up/Down walk the session-only history; duplicates are kept and it is not persisted.
    - Esc clears.
  - Global hotkeys are suspended while the box has focus.
  - Typing `!`, `~` or `?` sends them as a line (`!\n`); Grbl still treats them as realtime, but they consume buffer accounting. Custom code handles these properly.
  - Multi-line paste is not supported.
- **Upstream source:** [`LaserGRBL/UserControls/GrblTextBox.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblTextBox.cs) (`ProcessCmdKey`), [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`TxtManualCommandCommandEntered`, `TxtManualCommand_Enter`, `TxtManualCommand_Leave`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Persist history (deduplicated, capped) in localStorage.
  - Add autocomplete for `$` commands and settings (from the CSV tables), and multi-line paste (enqueue each line).
  - Map `!`, `~`, `?` and `ctrl-x` to realtime bytes, like custom code does.
  - Allow sending small commands during Hold (e.g. `$G`, `$#`) where Grbl accepts them.

### LG-STRM-23 Pending-queue model for side requests

- **What it does:** Runs config reads and writes (`$$`, `$I`, `$n=v` batches, Wi-Fi config) without polluting the console or the job.
- **Where in the UI:** Used by the Grbl configuration dialog ([[lg-grbl-configuration]]) and the connect refresh ([[lg-connection]] LG-CONN-10).
- **Options & defaults:** Response wait timeout 10 s. Collection stops after 500 ms of silence or 5 s total.
- **Behaviour & gotchas:**
  - Swaps the core's queue and log pointers to private instances while the request runs, then restores them.
  - Allowed only when connected, not in a program, and Idle/Alarm.
  - Config writes enqueue `$n=value` lines, busy-wait until the queue is empty and nothing is pending, then throw a `WriteConfigException` listing every line that was not `ok`.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`RefreshConfig`, `RefreshMachineInfo`, `WriteConfig`, `WriteConfigException`, `mQueuePtr`, `mSentPtr`)
- **webgrbl notes:** Status: not started.
  - Replace pointer swapping with promise-returning requests (`sendAndCollect(cmd, until)`) on the same ordered stream, tagging response lines to the request.
  - Never busy-wait; await.
  - Optionally mirror side requests to the console in a dimmed style for transparency.

### LG-STRM-24 Automatic cooling cycles

- **What it does:** Periodically pauses long jobs so laser diodes can cool down.
- **Where in the UI:**
  - Settings > "Automatic cooling" tab: "Enable auto cooling", On min/sec, Off min/sec.
  - Warning text "this feature will work only with grbl versions > v1.1 with "laser mode" enabled".
  - Ortur warning for firmware ≤ 137 (hidden when OLF ≥ 140).
- **Options & defaults:**
  - `AutoCooling` = `false`.
  - `AutoCooling TOn` = 10 min (0–60 min + 0–59 s).
  - `AutoCooling TOff` = 1 min (0–10 min + 0–59 s).
  - Both are clamped to at least 10 s on save.
- **Behaviour & gotchas:**
  - Active only if enabled, Grbl ≥ 1.1 and laser mode (`$32=1`).
  - During a program (and not in Hold/AutoHold), each TX tick computes `cooling = (globalJobTime mod (on+off)) > on`.
  - On entering cooling it sends feed hold `!` (shown as state `Cooling`). On exit it sends `~`. The non-laser-mode emulation is a TODO.
  - Global job time includes pauses, so the user's own hold time counts toward the cycle.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ManageCoolingCycles`, `NowCooling`, `StartCooling`, `ResumeCooling`, `AutoCooling*`), [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) (`InitAutoCoolingTab`)
- **webgrbl notes:** Status: not started.
  - Base the cycle on actual laser-on time, not wall-clock time.
  - Show a countdown "cooling, resuming in 0:42".
  - Make it a per-machine-profile setting.
  - Browser timer throttling in background tabs affects accuracy, so run the timer in the worker.

### LG-STRM-25 Syncro start across instances

- **What it does:** Starts, holds or resumes jobs simultaneously in every running LaserGRBL instance, for multi-machine setups.
- **Where in the UI:**
  - Menu File > "Syncro Start/Hold/Resume", visible only when more than one LaserGRBL process is running (checked every 5 s).
  - The first use per session warns "this command will start/resume all job in any running LaserGRBL instance!".
- **Options & defaults:** Always listening; there is no setting.
- **Behaviour & gotchas:**
  - Uses a named OS event `LaserGRBL syncro event`, set for 500 ms.
  - Each instance's listener thread reacts with the first action that applies:
    - CanSendFile: `RunProgram` (still shows the safety countdown).
    - CanResumeHold: `~`.
    - CanFeedHold: `!`.
  - It then ignores the event for 1 s.
- **Upstream source:** [`LaserGRBL/SincroStart.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SincroStart.cs), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MultipleInstanceTimer_Tick`, `MnRunMulti_Click`)
- **webgrbl notes:** Status: not started.
  - Use `BroadcastChannel` across tabs or windows of the same origin, a natural fit.
  - Better: one tab can hold several Web Serial ports, so offer a multi-machine dashboard with "start all / hold all / resume all" in a single UI.
  - Cross-device sync would need a server or WebRTC, which is out of scope.

## Upstream Source

- [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) - queues, TX/RX loops, flow control, status parsing, realtime commands, overrides, job lifecycle, resume, issue detection, auto cooling, `TimeProjection`
- [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) - line model, serialization, result/status, console message model, CSV decoding
- [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) - modal/position state reconstruction for run-from-line
- [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs), [`LaserGRBL/Core/SmoothieCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/SmoothieCore.cs), [`LaserGRBL/Core/VigoCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/VigoCore.cs) - streaming-mode, polling and ack overrides per firmware
- [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) - Run/Abort buttons, loop counter, progress bar, manual command box
- [`LaserGRBL/UserControls/CommandLog.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/CommandLog.cs), [`LaserGRBL/UserControls/GrblTextBox.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblTextBox.cs) - console rendering and command history
- [`LaserGRBL/RunFromPositionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RunFromPositionForm.cs), [`LaserGRBL/ResumeJobForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ResumeJobForm.cs) - start-from-line and resume dialogs
- [`LaserGRBL/SafetyCountdown.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SafetyCountdown.cs) - goggles countdown
- [`LaserGRBL/SincroStart.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SincroStart.cs) - multi-instance start/hold/resume
- [`LaserGRBL/IssueDetectorForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/IssueDetectorForm.cs) - issue dialog
- [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) - streaming/threading mode, header/footer/passes, safety countdown, auto cooling, issue detector settings
- [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) - status bar (state colour, buffer gauge, overrides, unlock-stuck), File menu send items
- [`LaserGRBL/HotKeysManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotKeysManager.cs) - default hotkeys (F5 run, Ctrl+F5 abort, F6 hold, F7 resume, Ctrl+X reset, F12 connect)
