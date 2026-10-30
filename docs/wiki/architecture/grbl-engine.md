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
- **EEPROM detection.** `isEepromWritingGrblLine` flags `$n=`, `$N0=`, `$N1=`, `$RST=`, `$I=`, `G10 L2`/`L20`, `G28.1` and `G30.1` on a prepared line. GRBL needs those sent one at a time with nothing in flight.
- **Response parsing.** `getParsedGrblResponse` turns one line into a `GrblResponse` (discriminated on `kind`): `ok`, `error:N`, `ALARM:N`, `<...>` status, `$n=v` setting, `[...]` feedback, a Grbl/GrblHAL banner, or `other`. Each variant is its own interface under `interfaces/`.
- **Status reports.** `getParsedGrblStatusReport` reads the state (and optional `:substate`), `MPos`, `WPos`, `WCO`, `Bf` (planner, RX), `FS` and `F` (feed), `Ov`; unknown fields are ignored and an unknown state yields `undefined`. `getResolvedGrblPositions` fills WPos from MPos - WCO (or MPos from WPos + WCO); a WCO in the report replaces the cached one.
- **Banner and build info.** `getParsedGrblFirmwareIdentity` keeps the version letter suffix (`1.1h`). `isSupportedGrblFirmware` accepts 1.1 or later (1.2 clones and FluidNC `Grbl 3.x` pass, 0.9 does not). `getGrblRxBufferSizeFromBuildOption` returns `rx - 1` from `[OPT:flags,blocks,rx]` because one byte of the reported serial buffer is unusable.
- **Planned layers.** Character-counting send queue, engine controller and the Redux/saga bridge are added on top in later steps; this article grows with them. The simulated laser is described below.

## Simulator

`GrblSimulator` (`src/utils/grbl/simulator/`) is a GRBL 1.1 stand-in. The engine tests drive the controller against it, and users without hardware pick it as "Simulated laser" through `SimulatedLaserTransport`, which implements `SerialTransport`.

- **Banner and identity.** Power-on (`open()`) and every soft reset print `Grbl 1.1h ['$' for help]`. `$I` answers `[VER:1.1h.20190825:]`, `[OPT:V,15,128]`, `ok`. Every output line ends with CRLF. The transport delivers output through `setTimeout(0)`, so reads arrive asynchronously like on a real port.
- **Receive buffer.** 127 usable bytes (`GrblSimulatorRxBuffer`). Realtime bytes (`?` `!` `~` 0x18 0x85) act at once and never enter it; other extended-ASCII bytes are dropped. A complete line leaves the buffer only while the planner holds fewer than 15 blocks; until then its bytes keep counting. A byte that does not fit sets the overflow flag (`hasRxBufferOverflowed()`) and is dropped.
- **Answers.** A motion line is answered `ok` when it enters the planner, a non-motion or `$` line when it has run, an empty line with `ok`, as GRBL does. Not when the move ends. `getReceivedLineCount()` counts non-realtime lines since power-on or the last reset, so tests can check how often a command arrived.
- **Motion.** `GrblSimulatorMotion` holds up to 15 blocks (from the G-code interpreter `getInterpretedGcodeLine`) and moves the machine position along them in 20 ms ticks. Its interval only runs while something moves, so no timer stays behind when idle. The state is Run, or Jog for `$J=` blocks.
- **Feed hold and jog cancel.** `!` during Run gives `Hold:1` while the speed falls linearly to 0 over 200 ms, then `Hold:0`. `!` when idle is `Hold:0` at once, and `!` while jogging cancels the jog. `~` resumes only after the hold is complete. 0x85 slows a jog down over 200 ms, then drops the rest of it and returns to Idle.
- **Soft reset (0x18).** It clears the planner, the receive buffer and the line count. Machine position and WCO are kept and the modal state returns to power-up defaults. During Run, Jog or a still-decelerating hold it prints `ALARM:3`, the banner and `[MSG:'$H'|'$X' to unlock]` and stays in Alarm. After `Hold:0` (or when idle) it prints only the banner. This is why the controller's stop sequence waits for `Hold:0` first.
- **Alarm.** Every G-code line answers `error:9` (GRBL locks all G-code, not only motion). `$X` prints `[MSG:Caution: Unlocked]` (only when it actually unlocks) and `ok`. `$H` homes instantly to the origin and also unlocks.
- **Other system commands** (`GrblSimulatorLineExecutor`). `$$` lists the settings (refused with `error:8` during Run or Hold). `$n=value` stores a value; an unknown number gives `error:3`, a bad number `error:2`, and anything outside Idle or Alarm `error:8`. `$G` gives `[GC:...]` from the modal state. `$C` toggles check mode: entering prints `[MSG:Enabled]`, `ok`. Lines in check mode get `ok` or `error:N` and do not move the machine. Leaving prints `[MSG:Disabled]`, `ok`, then resets with the banner.
- **Status report.** `<State|MPos:x,y,z|FS:feed,power>`. MPos is the machine position ($10=1), FS is the current feed and the effective laser power (0 while idle, held or on a G0). `|WCO:x,y,z` is added to the first report after power-on or reset and after a G92. Hold carries its substate (`Hold:0`, `Hold:1`).
- **Faults** (`injectFault`). `error-on-line` answers the given 1-based line number once with `error:N` instead of running it. `alarm` stops motion, flushes the receive buffer and the line count (as GRBL's reset on alarm does, so no stale lines are answered after `$X`), prints `ALARM:N` and enters Alarm. `stop-responding` silences all output from then on, even across power-on. `SimulatedLaserTransport.simulateConnectionLoss()` stops output, ignores further writes and calls the connection-lost listener once.

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
- `docs/superpowers/specs/2026-10-30_(01)_connection-streaming-engine.spec.md`
