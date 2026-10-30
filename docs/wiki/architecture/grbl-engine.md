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
- **Planned layers.** Response parser, character-counting send queue, simulated laser, engine controller and the Redux/saga bridge are added on top in later steps; this article grows with them.

## Source

- `src/utils/grbl/grbl.constants.ts`
- `src/utils/grbl/grbl.line.framer.ts`
- `src/utils/grbl/grbl.line.preparer.ts`
- `src/utils/grbl/grbl.eeprom.command.detector.ts`
- `docs/superpowers/specs/2026-10-30_(01)_connection-streaming-engine.spec.md`
