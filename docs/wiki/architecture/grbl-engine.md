---
title: GRBL Engine
created: 2026-10-30
---

# GRBL Engine

Framework-free TypeScript under `src/utils/grbl/` that talks the GRBL 1.1 protocol. It imports nothing from React, Redux or i18next, so it is unit-testable and could later move into a Web Worker. LaserGRBL behaviour it mirrors: [[lg-connection]], [[lg-streaming]].

## Key Takeaways

- **Constants in one file.** `grbl.constants.ts` holds the timing values (10 s handshake, 250 ms status poll, 2 s hold-complete wait, 10 s not-responding silence, 5 s info toast), sizes (127-byte default RX buffer, 2,000 console entries, 100 history entries, baud list with 115200 default), the realtime bytes (`?` 0x3F, `!` 0x21, `~` 0x7E, reset 0x18, jog cancel 0x85) and the closed sets `GRBL_RESPONSE_KIND`, `GRBL_MACHINE_STATE`, `GRBL_LINE_ORIGIN`, `GRBL_REALTIME_COMMAND`.
- **Line framing.** `GrblLineFramer` decodes bytes with a streaming `TextDecoder` (multi-byte characters may split across chunks), splits on CRLF or LF, keeps the unfinished tail for the next chunk, trims and drops empty lines.
- **Line preparation.** `getPreparedGrblLine` strips `;` and `(...)` comments and, for non-`$` lines, all whitespace (case is kept). `$` lines keep their inner spaces. It returns `undefined` when nothing is left, so empty lines are never sent.
- **EEPROM detection.** `isEepromWritingGrblLine` flags `$n=`, `$N0=`, `$N1=`, `$RST=`, `$I=`, `G10 L2`/`L20`, `G28.1` and `G30.1` on a prepared line; the `$` forms only at the start of the line, the G-code forms anywhere in it (`G90G10L20P1X0Y0`, `N10G10L2P1`). GRBL needs those sent one at a time with nothing in flight.
- **Response parsing.** `getParsedGrblResponse` turns one line into a `GrblResponse` (discriminated on `kind`): `ok`, `error:N`, `ALARM:N`, `<...>` status, `$n=v` setting, `[...]` feedback, a Grbl/GrblHAL banner, or `other`. Each variant is its own interface under `interfaces/`.
- **Status reports.** `getParsedGrblStatusReport` reads the state (and optional `:substate`), `MPos`, `WPos`, `WCO`, `Bf` (planner, RX), `FS` and `F` (feed), `Ov`; unknown fields are ignored and an unknown state yields `undefined`. `getResolvedGrblPositions` fills WPos from MPos - WCO (or MPos from WPos + WCO); a WCO in the report replaces the cached one.
- **Banner and build info.** `getParsedGrblFirmwareIdentity` keeps the version letter suffix (`1.1h`). `isSupportedGrblFirmware` accepts 1.1 or later (1.2 clones and FluidNC `Grbl 3.x` pass, 0.9 does not). `getGrblRxBufferSizeFromBuildOption` returns `rx - 1` from `[OPT:flags,blocks,rx]` because one byte of the reported serial buffer is unusable.
- **Send queue.** `GrblCharacterCountingQueue` releases a line only while the bytes in flight plus the line (with its line feed) fit the RX buffer; each `ok`/`error` frees the oldest in-flight line (`getOldestInFlightLine()` tells which line the next answer belongs to). Lines marked `isSentAlone` (EEPROM writes, and the `$C` that leaves check mode) go alone: they wait for an empty buffer and nothing follows them until they are answered.
- **Redux bridge.** `watchGrblController` (`src/utils/states/grbl.controller.saga.ts`) owns the one controller instance and maps requests to controller calls and events to actions; see [Redux bridge](#redux-bridge). The controller, its stop controls, program streaming and check mode, and the simulated laser are described below.

## Controller

`GrblController` (`grbl.controller.ts`) drives one controller over a `SerialTransport`. Writing (send queue, private lines, realtime bytes and their console entries) lives in `GrblCommandWriter`; the handshake context is built by `newGrblHandshakeContext`. It is framework-free; the Redux bridge owns a single instance and listens through `addEventListener`, which returns an unsubscribe function.

- **Events** (`GrblControllerEvent`, discriminated on `kind`, one interface per variant under `interfaces/`): `console-entry`, `status-report`, `grbl-error` (code, line text, origin), `grbl-alarm`, `connection-lost`, `not-responding`, `program-stopped-on-error` (line number, line text, error code), `controller-reset` (the controller reset itself, see [Unexpected controller reset](#unexpected-controller-reset)).
- **Console entries.** Every line written and received becomes a `GrblConsoleEntry` (`direction` sent / received / realtime, `text`, `realtimeCommand`, `isStatusReport`, `timestamp`). Private lines (`$I`, `$$`) appear like all traffic. Realtime bytes are written straight to the transport, never queued, and shown as `?`, `!`, `~`, `0x18`, `0x85`. The `?` poll and the `<...>` replies carry `isStatusReport: true`, so the console can hide them.
- **Handshake** (`performGrblHandshake` in `grbl.handshake.ts`, run through a small `GrblHandshakeContext`): open the transport, write `0x18`, wait for the first banner, then `$I` and `$$`. One 10 s deadline covers the whole handshake, so a controller that prints a banner but never answers `$I` fails too. Only the first banner counts: opening the port often resets the board and the soft reset prints another one, and taking both would send `$I` and `$$` twice (Review Focus 3). Missing the deadline gives `GrblHandshakeError` with reason `timeout`, a banner below 1.1 reason `unsupported-firmware`; both close the transport. `disconnect()` or a connection loss during the handshake cancels it through a canceller the handshake registers: the deadline timer and banner listener are cleared and `connect()` rejects with `GrblConnectionClosedError` (the transport is not closed a second time). `connect()` while already connecting or connected rejects with `GrblControllerBusyError` and leaves the port alone. Then `$I` and `$$` go through the send queue as private lines; the RX buffer size comes from `[OPT:...]` (default 127) and the settings from the `$n=v` lines. `connect()` resolves with `GrblConnectionInfo` (identity, RX buffer size, settings, build info lines) and starts the 250 ms status poll.
- **Private commands.** `GrblPrivateCommandRegistry` pairs each private line with the lines GRBL prints before acknowledging it. GRBL answers in order, so setting, feedback and other lines that arrive while a private line is the oldest in flight belong to it. An `error` also settles the request (with what arrived); the error itself goes out as `grbl-error` with origin `private`. Closing or losing the connection rejects waiting requests with `GrblConnectionClosedError`, so `connect()` never hangs.
- **Response routing** (`GrblResponseRouter` in `grbl.response.router.ts`). Every received line restarts the not-responding silence clock and becomes a console entry. `ok` frees the oldest in-flight line and sends whatever now fits. `error` frees it too; for a console or private line it emits `grbl-error`, for a program line it goes to the program streamer. Only then are more lines sent, so a stop on error drops them first. `ALARM:N` emits `grbl-alarm` and ends a running program. Status reports pass through `GrblStatusTracker`, which fills the positions with `getResolvedGrblPositions` and caches the last WCO; `getLatestStatus()` returns the result. A banner after the handshake either counts toward a banner the queue waits for (after a reset or leaving check mode) or, when none is awaited, means the controller reset itself (see [Unexpected controller reset](#unexpected-controller-reset)).
- **Console commands.** `sendConsoleCommand` prepares the line (`getPreparedGrblLine`) and queues it with origin `console`; empty results are ignored, and so are commands until the handshake is done (phase `connected`): a line written during the reset would be wiped but still count as in flight, so `$I`'s `ok` would acknowledge it. A prepared line with a character outside printable ASCII throws `GrblNonAsciiLineError` and nothing is sent (see [Non-ASCII lines](#non-ascii-lines)).
- **Connect race.** If a disconnect or connection loss lands after the handshake result but before `connect()` promotes the phase, `connect()` rejects with `GrblConnectionClosedError` instead of becoming `connected` and starting the poll and watchdog on a closed port.
- **Polling and teardown.** `GrblStatusPoller` writes `?` every 250 ms (the interval can change, for the faster poll during a stop). `disconnect()` and a transport connection loss stop the poll and the not-responding watchdog, clear the queue, end a running program or check, and reset the line framer, so no timer stays behind; a loss also emits `connection-lost`. While connected, `disconnect()` always runs `stopMachine()` first and closes the port only after the reset, so closing never leaves the machine moving: the latest status may be stale, and a console move is acknowledged as soon as GRBL plans it, so nothing in flight shows that it still runs. When the machine is idle this costs about one 50 ms poll (`!` gives `Hold:0` at once, then the reset). A failed write is ignored because the transport reports a dead port through its connection-lost listener.
- **Stop, reset, hold and unlock.** See [Stop and machine controls](#stop-and-machine-controls). Programs and check mode: see [Program streaming and check mode](#program-streaming-and-check-mode).
- **Tests** (`grbl.controller.connect.test.ts`) run against `SimulatedLaserTransport` with fake timers. Fake timers schedule a 0 ms timer set during a tick 1 ms later, so each simulator round trip costs 1 ms of fake time; the tests advance 10 ms to let a handshake settle.

## Stop and machine controls

`GrblMachineControls` (`grbl.machine.controls.ts`) holds the stop, reset, feed hold and cycle resume logic; the controller delegates to it. All of these do nothing (and resolve at once) unless the controller phase is `connected`. Realtime bytes go straight to the transport through `GrblCommandWriter` and appear as realtime console entries.

- **`stopMachine()`** runs `runGrblStopSequence` (`grbl.stop.sequence.ts`, through a small `GrblStopSequenceContext`). The goal is to halt as fast as possible without losing the position: a soft reset while the machine moves loses steps and raises `ALARM:3`. The latest status may be up to 250 ms old (a move may have started since), so it is never trusted to say the machine stands still:
  1. Drop the unsent lines (`clearPendingLines()`; lines in flight stay counted until the reset).
  2. Always write `!`, whatever the latest status says. In GRBL 1.1, `!` holds a run, gives `Hold:0` at once when idle, cancels a jog, and is ignored in Alarm. Jog cancel (0x85) is not used: chosen from a stale `Jog` status it would leave a G1 move that started meanwhile running, and the reset after the 2 000 ms wait would cut it off with `ALARM:3`.
  3. Wait for the first status report answering a query written after that byte whose state is not `Run`, `Jog` or `Hold:1` (so `Hold:0`, `Idle`, `Alarm`, `Door`, ...), at most 2 000 ms (`GRBL_HOLD_COMPLETE_MAX_WAIT_MS`). Reports to queries already unanswered when the byte went out are skipped (`GrblCommandWriter` counts unanswered `?` queries), because they describe the machine before the byte took effect. During the wait the status poll runs every 50 ms (`GRBL_STOP_STATUS_POLL_INTERVAL_MS`, builder's call) instead of 250 ms, so the end of the deceleration is noticed within 50 ms instead of up to 250 ms.
  4. `resetMachine()`, then the poll returns to 250 ms.
  The promise resolves once the reset byte is written. A second `stopMachine()` while one runs returns the same promise, so only one reset goes out (Review Focus 5). A connection loss during the wait ends it at once through a canceller; no reset is written and no timer stays behind. `disconnect()` while connected waits for the stop (sharing a running one) and closes after the reset. A banner the app did not cause ends the wait at once (see [Unexpected controller reset](#unexpected-controller-reset)).
- **`resetMachine()`** writes 0x18 at once, drops queued and in-flight lines, fails waiting private commands with `GrblCommandWipedError` (so nothing can hang), ends a running program and holds the send queue until the reset's banner (`GrblCharacterCountingQueue.holdUntilBanner()`). While held, `ok`/`error` answers free nothing (they belong to lines the reset wiped), an `error:N` raises no `grbl-error` event (it would show a misleading error after every stop), and newly queued lines wait (bytes sent while GRBL restarts could be wiped too, yet would count as in flight). Each reset prints its own banner, so the queue counts expected banners: after two quick resets it sends again only after the second banner. The banner releases the queue, so a command sent right after the reset (for example `$X`) gets its own `ok`. If no banner arrives within 10 000 ms (`GRBL_RESET_BANNER_TIMEOUT_MS`, counted from the latest reset), the queue is released anyway and `not-responding` is reported (through the watchdog, so one silence gives one event), so later commands do not wait forever without any message. Banners cannot be told apart, so an unexpected banner during the wait counts as an expected one; that releases the queue at most one banner early, and the late banner then arrives while nothing is awaited, so it is handled as a controller reset and drops whatever was sent meanwhile. Answers therefore never pair with the wrong line.
- **`sendFeedHold()` / `sendCycleResume()`** write `!` / `~`.
- **`unlockMachine()`** queues `$X` as a console line.
- **Tests.** `grbl.controller.stop.test.ts` (against the simulator) covers these cases:
  - stop during a move holds, then resets without an alarm and keeps the position;
  - the 50 ms poll during the wait and the 250 ms poll after it;
  - feed hold (not jog cancel) during a jog, and a stale `Jog` status while a G1 move runs holds the move without `ALARM:3`;
  - reset after 2 000 ms when the controller stops responding;
  - stop while idle and stop 5 ms after a move started both hold first and raise no alarm;
  - stop during a stream raises no `grbl-error`;
  - a second stop shares the promise;
  - reset drops pending lines;
  - answers to wiped lines raise no `grbl-error`;
  - `$X` right after one reset, or after two quick resets, waits for the last banner;
  - banner timeout after 10 000 ms;
  - feed hold and resume;
  - no writes while disconnected;
  - connection loss during the wait;
  - disconnect right after an acknowledged console move (nothing in flight, status still `Idle`) holds and resets before closing.

  `grbl.controller.connect.race.test.ts` mocks the handshake to land a disconnect between the handshake result and the promotion to `connected`.

  `grbl.stop.sequence.test.ts` unit-tests skipping the earlier reports and the states that end the wait. Shared test helpers live in `src/utils/grbl/test.support/`.

## Unexpected controller reset

GRBL prints its banner after every reset, also one the app did not cause: a homing failure, the board's reset button, a brown-out. That reset flushed GRBL's receive buffer, so the lines in flight are never answered; if they stayed counted, every later `ok` would pair with the wrong line and a program could hang without any message. So while the controller is `connected` and the queue waits for no banner, `GrblMachineControls.handleReceivedBanner()` treats a banner as a controller reset:

- a running stop skips the rest of its hold wait (it then writes its own reset, which is harmless);
- all pending and in-flight lines are dropped and waiting private commands fail with `GrblCommandWipedError` (`commandWriter.dropAllLines()`);
- a running program ends with `isCompleted: false`, and a running check rejects with `GrblCommandWipedError` (`programStreamer.handleMachineReset()`);
- `controller-reset` is emitted; the saga shows a warning `TOAST_CONTROLLER_RESET` ("The controller reset itself - running work was stopped.").

Banners during the handshake belong to it and are never taken as a controller reset. A reset during motion also prints `ALARM:3`, which ends a program through the alarm path first.

Known gap: lines written after GRBL's reset but before its banner arrives are received and answered by GRBL, yet dropped here; their late `ok` frees nothing. This window is a few milliseconds.

`grbl.controller.self.reset.test.ts` covers console lines in flight (later answers pair correctly, no not-responding), a program in flight (resolves `isCompleted: false` with the event) and that the banner of an app-caused reset raises no event. The simulator fault `self-reset` acts like GRBL's `mc_reset`.

## Non-ASCII lines

Only printable ASCII (0x20 to 0x7E) is ever sent (`GRBL_PRINTABLE_ASCII_LINE_PATTERN`, `isPrintableAsciiGrblLine`). Any other character either takes more bytes than the send queue counts (UTF-8 is multi-byte, so the RX buffer could overrun) or reaches GRBL as a realtime command: every byte from 0x80 on is one, so U+00DA (UTF-8 C3 9A) would raise the laser power override by 10 %. Lines are checked after preparation, so such characters inside a comment do no harm. A tab inside a `$` line is refused too.

- **Console:** `sendConsoleCommand` throws `GrblNonAsciiLineError`; the saga (`grbl.console.command.saga.ts`) adds the console error line `CONSOLE_NON_ASCII_REJECTED`.
- **Programs:** `getNonAsciiProgramLineErrors` reports each such line as a `GrblProgramLineError` with the client-side code `NON_ASCII_LINE_ERROR_CODE` (-1; negative so it never matches a firmware code; its description key is `GRBL_ERROR_NON_ASCII_LINE`), and `getProgramQueuedLines` never queues it. With stop-on-error on, the whole program is refused before any line is sent: it resolves `isCompleted: false` with that one error and emits `program-stopped-on-error`. With stop-on-error off, each line is reported as `grbl-error` (origin `program`) and skipped, and the rest is streamed.
- **Check mode:** such lines are part of the results, merged with GRBL's errors in line order, and never sent.

`grbl.controller.non.ascii.test.ts` and `grbl.printable.ascii.line.test.ts` cover these cases.

## Program streaming and check mode

`GrblProgramStreamer` (`grbl.program.streamer.ts`) runs one program at a time; the controller delegates `streamProgram` and `checkProgram` to it. A second `streamProgram()` or `checkProgram()` while one runs rejects with `GrblControllerBusyError`. While disconnected they reject with `GrblConnectionClosedError`.

- **Streaming.** `streamProgram(programLines, { isStopOnErrorEnabled })` resolves with `GrblProgramResult { isCompleted, lineErrors }`. Each `GrblProgramLineError` has `lineNumber`, `lineText` and `errorCode`.
  - `getProgramQueuedLines` prepares every line with `getPreparedGrblLine`. Blank and comment lines are not sent but keep their place, so `lineNumber` is always the 1-based index into the original `programLines`.
  - All lines go into the shared send queue at once; the queue handles 200 000-line programs. Console commands typed during a program share the buffer budget, so the controller buffer never overflows (Review Focus 4).
  - EEPROM lines (`$32=1`, `G10 L2`, ...) wait for an empty buffer through the queue's sent-alone rule. `$` setting writes count only at the start of the line; `G10L2` / `G10L20`, `G28.1` and `G30.1` count anywhere in it (for example `G90G10L20P1X0Y0` or `N10G10L2P1`).
  - Lines with a character outside printable ASCII are never sent (see [Non-ASCII lines](#non-ascii-lines)).
  - The program completes (`isCompleted: true`) once every sent line is answered.
- **Stop on error** (user decision: stop as fast as possible). On the first `error:N` for a program line the streamer emits `program-stopped-on-error` and calls the existing `stopMachine()`. No `grbl-error` goes out, so the user is not told twice. This happens before the router sends another line, and the stop's first step drops the unsent lines. The promise resolves `isCompleted: false` once the stop has written the reset. Answers to lines already in flight are ignored.
- **Stop on error off.** Every error is collected and emitted as `grbl-error` with origin `program`, and streaming continues. The program still completes.
- **Ending early.** These all resolve the program with `isCompleted: false` and the errors collected so far:
  - a user `stopMachine()` or `resetMachine()` (the reset wipes the lines);
  - a reset the controller did by itself (see [Unexpected controller reset](#unexpected-controller-reset));
  - an `ALARM:N`: GRBL flushed its receive buffer, so the queue drops pending and in-flight lines (a banner hold is kept);
  - a closed connection.
- **Check mode** (`runGrblCheckMode` in `grbl.check.mode.ts`, sending its own `$C` lines through `GrblControlLineExchange` in `grbl.control.line.exchange.ts`; user decision: the basis for a later pre-run validator). In check mode GRBL parses every line but moves nothing and keeps the laser off. `checkProgram(programLines)`:
  1. sends `$C` and waits for its answer; program lines are sent only after `ok`;
  2. streams the lines with stop-on-error off;
  3. sends `$C` again, alone; on its `ok` the queue is held until the banner without dropping lines (`holdUntilBannerKeepingLines()`), with the same 10 000 ms banner timeout as a reset, so console lines typed meanwhile go out after GRBL's reset and keep their own answers;
  4. waits for the banner and resolves with the line errors.

  Check errors are results: they raise no `grbl-error` event (no toast per line) but still appear as console entries. Failures reject instead of resolving with a partial list, which a validator could take for a valid program:
  - `$C` refused (for example `error:8` while running) rejects with `GrblCheckModeRefusedError`; no program line is sent;
  - a reset or alarm during the check rejects with `GrblCommandWipedError`;
  - a closed connection rejects with `GrblConnectionClosedError`.

  Once every line is checked, a reset or connection loss while leaving still resolves with the errors.
- **Not responding** (`GrblNotRespondingWatchdog`, `grbl.not.responding.watchdog.ts`). It emits `not-responding` once per silence when lines are in flight, nothing was received for 10 000 ms (`GRBL_NOT_RESPONDING_SILENCE_MS`) and the latest state is neither `Hold` nor `Door`. Any received line starts a new silence. A silence without lines in flight is checked again every 250 ms, so a line sent into it later is still reported. The stream continues. The reset-banner timeout reports through the watchdog too, so one silence never gives two events.
- **Tests.** `grbl.controller.stream.test.ts` runs against the simulator:
  - a 200-line program without overflow, and a console command in the middle of one;
  - an EEPROM write only after all earlier lines are answered;
  - stop on error at line 5 (line number, text, code; nothing received after the reset), and errors collected with stop-on-error off;
  - check mode results, its sent lines and leaving check mode; `$C` refused; a reset and a connection loss during a check;
  - busy and disconnected rejections; a program of only blank and comment lines;
  - a user stop and an alarm during a program;
  - not-responding after exactly 10 000 ms of silence, not twice with the banner timeout, not in Hold;
  - connection loss during a program; disconnect while running holds and resets before closing.

  `grbl.command.writer.test.ts` covers failing private commands on reset, alarm and closed connection.

## Simulator

`GrblSimulator` (`src/utils/grbl/simulator/`) is a GRBL 1.1 stand-in. The engine tests drive the controller against it, and users without hardware pick it as "Simulated laser (no hardware)" through `SimulatedLaserTransport`, which implements `SerialTransport`.

- **Banner and identity.** Power-on (`open()`) and every soft reset print `Grbl 1.1h ['$' for help]`. `$I` answers `[VER:1.1h.20190825:]`, `[OPT:V,15,128]`, `ok`. Every output line ends with CRLF. The transport delivers output through `setTimeout(0)`, so reads arrive asynchronously like on a real port.
- **Receive buffer.** 127 usable bytes (`GrblSimulatorRxBuffer`). Realtime bytes (`?` `!` `~` 0x18 0x85) act at once and never enter it; other extended-ASCII bytes are dropped. A complete line leaves the buffer only while the planner holds fewer than 15 blocks; until then its bytes keep counting. A byte that does not fit sets the overflow flag (`hasRxBufferOverflowed()`) and is dropped.
- **Answers.** A motion line is answered `ok` when it enters the planner, a non-motion or `$` line when it has run, an empty line with `ok`, as GRBL does. Not when the move ends. `getReceivedLineCount()` counts non-realtime lines since power-on or the last reset, so tests can check how often a command arrived.
- **Motion.** `GrblSimulatorMotion` holds up to 15 blocks (from the G-code interpreter `getInterpretedGcodeLine`) and moves the machine position along them in 20 ms ticks. Its interval only runs while something moves, so no timer stays behind when idle. The state is Run, or Jog for `$J=` blocks.
- **Feed hold and jog cancel.** `!` during Run gives `Hold:1` while the speed falls linearly to 0 over 200 ms, then `Hold:0`. `!` when idle is `Hold:0` at once, and `!` while jogging cancels the jog. `~` resumes only after the hold is complete. 0x85 slows a jog down over 200 ms, then drops the rest of it and returns to Idle.
- **Soft reset (0x18).** It clears the planner, the receive buffer and the line count. Machine position and WCO are kept and the modal state returns to power-up defaults. During Run, Jog or a still-decelerating hold it prints `ALARM:3`, the banner and `[MSG:'$H'|'$X' to unlock]` and stays in Alarm. After `Hold:0` (or when idle) it prints only the banner. This is why the controller's stop sequence waits for `Hold:0` first.
- **Alarm.** Every G-code line answers `error:9` (GRBL locks all G-code, not only motion). `$X` prints `[MSG:Caution: Unlocked]` (only when it actually unlocks) and `ok`. `$H` homes instantly to the origin and also unlocks.
- **Other system commands** (`GrblSimulatorLineExecutor`). `$$` lists the settings (refused with `error:8` during Run or Hold). `$n=value` stores a value; an unknown number gives `error:3`, a bad number `error:2`, and anything outside Idle or Alarm `error:8`. `$G` gives `[GC:...]` from the modal state. `$C` toggles check mode: entering prints `[MSG:Enabled]`, `ok`. Lines in check mode get `ok` or `error:N` and do not move the machine. Leaving prints `[MSG:Disabled]`, `ok`, then resets with the banner.
- **Status report.** `<State|MPos:x,y,z|FS:feed,power>`. MPos is the machine position ($10=1), FS is the current feed and the effective laser power (0 while idle, held or on a G0). `|WCO:x,y,z` is added to the first report after power-on or reset and after a G92. Hold carries its substate (`Hold:0`, `Hold:1`).
- **Faults** (`injectFault`). `error-on-line` answers the given 1-based line number once with `error:N` instead of running it. `alarm` stops motion, flushes the receive buffer and the line count (as GRBL's reset on alarm does, so no stale lines are answered after `$X`), prints `ALARM:N` and enters Alarm. `stop-responding` silences all output from then on, even across power-on. `self-reset` acts like GRBL's `mc_reset` after a homing failure, a reset button or a brown-out: it runs the soft reset (planner and receive buffer flushed, banner printed, `ALARM:3` first if motion was cut off). `SimulatedLaserTransport.simulateConnectionLoss()` stops output, ignores further writes and calls the connection-lost listener once.

## Web Serial transport

`WebSerialTransport` (`web.serial.transport.ts`) implements `SerialTransport` over a granted `SerialPort`, opened 8N1 at the chosen baud rate (`new WebSerialTransport(port, baudRate)`).

- **Open.** A failing `port.open` becomes `SerialPortOpenError` with the original error as `cause` and a `reason`: `access-denied-or-busy` for a `NetworkError` or `InvalidStateError` DOMException, `port-not-found` for `NotFoundError`, otherwise `unknown`. The reader and writer are locked once per open.
- **Reading.** One loop on `readable.getReader()` hands each chunk to the receive listener. A read error, an unexpected end of the stream, or `navigator.serial`'s `disconnect` event whose target is this port calls the connection-lost listener once per open; the locks and the port are then released best effort. Known follow-up: Web Serial also reports recoverable read errors (`BreakError`, `FramingError`, `ParityError`, `BufferOverrunError`), after which a new reader could continue; they are currently treated as a connection loss like any other read error.
- **Restart while connecting.** A banner after `$I` or `$$` was sent, followed by 1 s without an answer, counts as a restart that wiped them: the lines are dropped and asked again, up to 3 rounds under the handshake deadline. A banner alone is not enough, as the soft reset's banner often follows `$I` and `$I` is still answered. Seen on an ACMER S2 with the head on the X limit switch: `ALARM:1`, then the firmware restarts and unlocks itself. Stock GRBL may instead wait for a reset, and that case still times out.
- **Real hardware.** The handshake was verified on a real ACMER S2 (`Grbl 1.1h` banner, RX buffer 511 reported, so 510 usable); Chrome and Edge work, while Firefox's Web Serial currently ends the read stream right after open (known follow-up).
- **Writing.** Writes go through the one writer and run in order (each is awaited before the next). A write after `close()` or after a loss rejects with `WebSerialClosedError`.
- **Closing.** `close()` waits for pending writes, cancels the reader, ends the read loop, releases both locks, removes the `disconnect` listener, then closes the port. It never throws and a second call does nothing; it does not call the connection-lost listener.
- **Port registry.** `SERIAL_PORT_REGISTRY.registerSerialPort(port)` gives each port object a stable id `serial-<n>` (same port, same id) and returns a `SerialPortDescriptor` with the USB ids; `getRegisteredSerialPort(portId)` finds the port again. The id of the simulated laser is `SIMULATED_LASER_PORT_ID` (`simulated`).
- **Preferences.** `CONNECTION_PREFERENCES_STORAGE` keeps `ConnectionPreferences` (baud rate and the port choice) in `localStorage` under `webgrbl.connectionPreferences`. Every access is in try/catch and the parsed value is checked with type guards; a missing, corrupt or wrongly shaped value, or a throwing storage, reads as `undefined`.
- **Tests** use `FakeSerialPort` (`test.support/fake.serial.port.ts`) and stub `navigator.serial` with an `EventTarget`, removed after each test so other suites still see Web Serial as unsupported.

## Redux bridge

`watchGrblController(dependencies)` in `src/utils/states/grbl.controller.saga.ts` connects the engine to the store. It is the only code outside `src/utils/grbl/` that creates a `GrblController`, and it keeps the instance in saga-local scope, never in the store. Slices it drives: `grblConnection`, `machineStatus`, `grblConsole`, `toast` (see [[app-shell]]).

- **Dependencies** (`GrblControllerSagaDependencies`): `newTransport(portId, baudRate)`, `requestSerialPort()` (undefined when the user cancels), `getGrantedSerialPorts()`, and `storage` (`CONNECTION_PREFERENCES_STORAGE`). `newStore(dependencies?)` defaults to `newBrowserGrblControllerSagaDependencies()`: the simulated id gives `SimulatedLaserTransport`, any other id the registered port in a `WebSerialTransport` (an unknown id throws `SerialPortOpenError` with reason `port-not-found`); `navigator.serial` is looked up on each call, so without Web Serial the granted ports are `[]` and the picker returns `undefined`. A picker closed without a choice (`NotFoundError`) is silent.
- **At start.** The granted ports are registered and put as `AvailableSerialPortsReceived`; stored preferences restore the baud rate (only a listed one) and the port: a stored USB vendor/product pair selects the granted port with the same ids; a stored simulated choice is restored as `SIMULATED_LASER_PORT_ID` (preferences are stored only after the user picked a port and connected, so it is their explicit choice); without stored preferences no port is chosen until the user picks one (`selectedPortId` starts as `NO_SERIAL_PORT_ID`, the fresh default is never the simulator, and a `ConnectRequested` without a port does nothing). Requests are taken from the start, while the port list is still loading.
- **Picker.** `SerialPortPickerRequested` requests a port, registers it, reloads the granted ports and selects it.
- **Session.** `ConnectRequested` starts one session; further connect requests are ignored until it ends (a new one is taken after a disconnect, a failure or a loss). Status goes `connecting`, the transport and controller are created and subscribed through an `eventChannel` with an expanding buffer, then `connect()` runs. Success puts `ConnectionEstablished`, status `connected`, an info `TOAST_CONNECTED {firmware, version}`, and stores `{baudRate, portChoice}`. A failure puts an error toast (`SerialPortOpenError` reasons map to `TOAST_PORT_ACCESS_DENIED_OR_BUSY` / `TOAST_PORT_NOT_FOUND` / `TOAST_PORT_OPEN_FAILED`, `GrblHandshakeError` to `TOAST_CONNECT_TIMEOUT` / `TOAST_UNSUPPORTED_FIRMWARE`, anything else `TOAST_PORT_OPEN_FAILED`), status `disconnected`, and the raw error text (with its cause) as a console error line `CONSOLE_RAW_ERROR {detail}`. Toasts never carry raw error text. `GrblConnectionClosedError` is silent, because the disconnect or loss that caused it reports itself.
- **Events.** `console-entry` becomes `ConsoleEntryReceived`, `status-report` `MachineStatusReceived`, `grbl-error` an error `TOAST_GRBL_ERROR {code, description}` and `grbl-alarm` an error `TOAST_GRBL_ALARM {code, description}` (the description is a localisation key from `getGrblErrorDescriptionKey` / `getGrblAlarmDescriptionKey`, translated by the toast view), `connection-lost` status `lost` plus an error `TOAST_CONNECTION_LOST` (status `lost` and `disconnected` both clear the machine status, so the panel and the leave-page guard never show a stale `Run`), `not-responding` a warning `TOAST_NOT_RESPONDING`, `program-stopped-on-error` an error `TOAST_PROGRAM_STOPPED_ON_ERROR {lineNumber, code, description}`, `controller-reset` a warning `TOAST_CONTROLLER_RESET`, `program-progress` `JobRunProgressChanged`. The mapping is `getGrblControllerEventActions` (`grbl.controller.event.actions.ts`). Every status report and console line is dispatched as it arrives; there is no batching.
- **Commands** (only while connected, in `handleGrblControllerCommands`, `grbl.controller.commands.saga.ts`): `ConsoleCommandSubmitted` calls `sendConsoleCommand` (`submitGrblConsoleCommand`; a `GrblNonAsciiLineError` becomes the console error `CONSOLE_NON_ASCII_REJECTED`), `MachineStopRequested` `stopMachine`, `MachineResetRequested` `resetMachine`, `MachineUnlockRequested` `unlockMachine`, `JobPauseRequested` `sendFeedHold` and `JobResumeRequested` `sendCycleResume` (`runGrblJobPauseCommand`, only when `selectJobPauseControl` offers them). A failing command adds a raw console error line instead of ending the saga.
- **Teardown.** The session races event forwarding against the connection flow: a `connection-lost` event ends forwarding and cancels the flow; `DisconnectRequested` (also while connecting) calls `disconnect()` and puts status `disconnected`. Either way the event channel is closed, which removes the controller listener.
- **Tests** (`grbl.controller.saga.test.ts`) run `newStore(testDependencies)` with a `SimulatedLaserTransport` factory, in-memory storage and fake timers, and disconnect after each test so no timer stays behind.

## Source

- `src/utils/grbl/grbl.constants.ts`
- `src/utils/grbl/grbl.line.framer.ts`
- `src/utils/grbl/grbl.line.preparer.ts`
- `src/utils/grbl/grbl.eeprom.command.detector.ts`
- `src/utils/grbl/grbl.response.parser.ts`
- `src/utils/grbl/grbl.status.report.parser.ts`
- `src/utils/grbl/grbl.firmware.banner.parser.ts`
- `src/utils/grbl/grbl.firmware.support.ts`
- `src/utils/grbl/grbl.build.info.parser.ts`
- `src/utils/grbl/grbl.position.resolver.ts`
- `src/utils/grbl/grbl.character.counting.queue.ts`
- `src/utils/grbl/grbl.controller.ts`
- `src/utils/grbl/grbl.handshake.ts`
- `src/utils/grbl/grbl.handshake.error.ts`
- `src/utils/grbl/grbl.connection.closed.error.ts`
- `src/utils/grbl/grbl.controller.busy.error.ts`
- `src/utils/grbl/grbl.private.command.registry.ts`
- `src/utils/grbl/grbl.status.poller.ts`
- `src/utils/grbl/grbl.status.tracker.ts`
- `src/utils/grbl/grbl.stop.sequence.ts`
- `src/utils/grbl/grbl.machine.controls.ts`
- `src/utils/grbl/grbl.command.writer.ts`
- `src/utils/grbl/grbl.console.entry.event.ts`
- `src/utils/grbl/grbl.handshake.context.ts`
- `src/utils/grbl/grbl.response.router.ts`
- `src/utils/grbl/grbl.program.streamer.ts`
- `src/utils/grbl/grbl.program.queued.lines.ts`
- `src/utils/grbl/grbl.control.line.exchange.ts`
- `src/utils/grbl/grbl.check.mode.ts`
- `src/utils/grbl/grbl.check.mode.refused.error.ts`
- `src/utils/grbl/grbl.command.wiped.error.ts`
- `src/utils/grbl/grbl.not.responding.watchdog.ts`
- `src/utils/grbl/grbl.printable.ascii.line.ts`
- `src/utils/grbl/grbl.program.non.ascii.line.errors.ts`
- `src/utils/grbl/grbl.non.ascii.line.error.ts`
- `src/utils/grbl/test.support/`
- `src/utils/grbl/interfaces/`
- `src/utils/grbl/simulator/` (whole simulator, including the G-code interpreter and default settings)
- `src/utils/grbl/simulator/grbl.simulator.ts`
- `src/utils/grbl/simulator/grbl.simulator.rx.buffer.ts`
- `src/utils/grbl/simulator/grbl.simulator.line.executor.ts`
- `src/utils/grbl/simulator/grbl.simulator.line.faults.ts`
- `src/utils/grbl/simulator/grbl.simulator.motion.ts`
- `src/utils/grbl/simulator/grbl.simulator.status.report.ts`
- `src/utils/grbl/simulator/grbl.simulator.constants.ts`
- `src/utils/grbl/simulator/interfaces/`
- `src/utils/grbl/simulated.laser.transport.ts`
- `src/utils/grbl/web.serial.transport.ts`
- `src/utils/grbl/web.serial.closed.error.ts`
- `src/utils/grbl/serial.port.open.error.ts`
- `src/utils/grbl/serial.port.registry.ts`
- `src/utils/grbl/test.support/fake.serial.port.ts`
- `src/utils/states/grbl.controller.saga.ts`
- `src/utils/states/grbl.controller.commands.saga.ts`
- `src/utils/states/grbl.job.pause.saga.ts`
- `src/utils/states/grbl.controller.event.actions.ts`
- `src/utils/states/grbl.console.command.saga.ts`
- `src/utils/states/grbl.connect.failure.toast.key.ts`
- `src/utils/states/grbl.raw.error.console.info.ts`
- `src/utils/states/browser.grbl.controller.saga.dependencies.ts`
- `src/utils/states/interfaces/GrblControllerSagaDependencies.ts`
- `src/utils/storage/connection.preferences.storage.ts`
- `src/utils/storage/interfaces/ConnectionPreferences.ts`
- `src/utils/type.guards/`
- `docs/superpowers/specs/2026-10-30_(01)_connection-streaming-engine.spec.md`
