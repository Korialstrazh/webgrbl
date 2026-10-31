import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_LINE_ORIGIN,
  NON_ASCII_LINE_ERROR_CODE,
} from './grbl.constants';
import { GrblController } from './grbl.controller';
import { GrblNonAsciiLineError } from './grbl.non.ascii.line.error';
import { ANSWER_SETTLE_MS } from './test.support/grbl.answer.settle';
import { newGrblControllerHarness } from './test.support/grbl.controller.harness';
import { disconnectGrblHarness } from './test.support/grbl.harness.disconnect';
import type { GrblControllerEventKind } from './grbl.constants';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblProgramLineError } from './interfaces/GrblProgramLineError';
import type { GrblProgramResult } from './interfaces/GrblProgramResult';
import type { GrblControllerHarness } from './test.support/GrblControllerHarness';

/** The handshake sends $I and $$, so the simulator counts the first line after it as line 3. */
const HANDSHAKE_LINE_COUNT = 2;
/** U+00DA is sent as UTF-8 C3 9A; 0x9A alone is GRBL's realtime "laser power override +10%". */
const NON_ASCII_MOVE = 'G1XÚ';
const NON_ASCII_MOVE_LINE_NUMBER = 3;
/** Characters outside printable ASCII are fine inside a comment, which is never sent. */
const COMMENTED_MOVE = 'G1 X1 F600 ; Grüße';
const PREPARED_COMMENTED_MOVE = 'G1X1F600';
const TAB_SEPARATED_SYSTEM_COMMAND = '$J=G91\tX1F100';
const NON_ASCII_PROGRAM: string[] = ['G21', 'G1X1F600', NON_ASCII_MOVE, 'G1X2F600'];
const CHECKED_PROBE_LINE = 'G38.2Z-1';
const CHECKED_PROBE_LINE_NUMBER = 4;
const UNSUPPORTED_COMMAND_ERROR_CODE = 20;
const CHECKED_PROGRAM: string[] = ['G21', 'G1X1F600', NON_ASCII_MOVE, CHECKED_PROBE_LINE];
/** First byte value outside 7-bit ASCII; GRBL treats every byte from here on as a realtime command. */
const FIRST_NON_ASCII_BYTE = 0x80;

const NON_ASCII_LINE_ERROR: GrblProgramLineError = {
  lineNumber: NON_ASCII_MOVE_LINE_NUMBER,
  lineText: NON_ASCII_MOVE,
  errorCode: NON_ASCII_LINE_ERROR_CODE,
};

const newConnectedHarness = async (): Promise<GrblControllerHarness> => {
  const harness: GrblControllerHarness = newGrblControllerHarness();
  const connection: Promise<unknown> = harness.controller.connect();
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  await connection;
  harness.events.length = 0;

  return harness;
};

const getEventsOfKind = (events: GrblControllerEvent[], kind: GrblControllerEventKind): GrblControllerEvent[] =>
  events.filter((event: GrblControllerEvent) => event.kind === kind);

const hasWrittenNonAsciiByte = (writeSpy: { mock: { calls: Uint8Array[][] } }): boolean =>
  writeSpy.mock.calls.some(([bytes]: Uint8Array[]) => !!bytes?.some((byte: number) => byte >= FIRST_NON_ASCII_BYTE));

describe(GrblController.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('a console command with a non-ASCII character throws GrblNonAsciiLineError and sends nothing', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const writeSpy = vi.spyOn(harness.transport, 'write');

    expect(() => harness.controller.sendConsoleCommand(NON_ASCII_MOVE)).toThrow(GrblNonAsciiLineError);
    expect(() => harness.controller.sendConsoleCommand(TAB_SEPARATED_SYSTEM_COMMAND)).toThrow(GrblNonAsciiLineError);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(hasWrittenNonAsciiByte(writeSpy)).toBe(false);
    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(HANDSHAKE_LINE_COUNT);

    await disconnectGrblHarness(harness);
  });

  it('a non-ASCII character inside a comment is dropped with the comment and the line is sent', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const writeSpy = vi.spyOn(harness.transport, 'write');

    harness.controller.sendConsoleCommand(COMMENTED_MOVE);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(writeSpy).toHaveBeenCalledWith(new TextEncoder().encode(`${PREPARED_COMMENTED_MOVE}\n`));
    expect(hasWrittenNonAsciiByte(writeSpy)).toBe(false);

    await disconnectGrblHarness(harness);
  });

  it('with stop-on-error on, a program with a non-ASCII line stops before sending any line', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const writeSpy = vi.spyOn(harness.transport, 'write');

    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(NON_ASCII_PROGRAM, {
      isStopOnErrorEnabled: true,
    });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [NON_ASCII_LINE_ERROR] });
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR)).toEqual([
      { kind: GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR, ...NON_ASCII_LINE_ERROR },
    ]);
    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(HANDSHAKE_LINE_COUNT);
    expect(hasWrittenNonAsciiByte(writeSpy)).toBe(false);
    await expect(harness.controller.streamProgram([], { isStopOnErrorEnabled: true })).resolves.toEqual({
      isCompleted: true,
      lineErrors: [],
    });

    await disconnectGrblHarness(harness);
  });

  it('with stop-on-error off, a non-ASCII line is reported and skipped and the rest is sent', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const writeSpy = vi.spyOn(harness.transport, 'write');

    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(NON_ASCII_PROGRAM, {
      isStopOnErrorEnabled: false,
    });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    await expect(stream).resolves.toEqual({ isCompleted: true, lineErrors: [NON_ASCII_LINE_ERROR] });
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR)).toEqual([{
      kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
      code: NON_ASCII_LINE_ERROR_CODE,
      lineText: NON_ASCII_MOVE,
      origin: GRBL_LINE_ORIGIN.PROGRAM,
    }]);
    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(
      HANDSHAKE_LINE_COUNT + NON_ASCII_PROGRAM.length - 1,
    );
    expect(hasWrittenNonAsciiByte(writeSpy)).toBe(false);

    await disconnectGrblHarness(harness);
  });

  it('checkProgram reports a non-ASCII line among the GRBL errors, in line order, without sending it', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const writeSpy = vi.spyOn(harness.transport, 'write');

    const check: Promise<GrblProgramLineError[]> = harness.controller.checkProgram(CHECKED_PROGRAM);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    await expect(check).resolves.toEqual([
      NON_ASCII_LINE_ERROR,
      {
        lineNumber: CHECKED_PROBE_LINE_NUMBER,
        lineText: CHECKED_PROBE_LINE,
        errorCode: UNSUPPORTED_COMMAND_ERROR_CODE,
      },
    ]);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR)).toEqual([]);
    expect(hasWrittenNonAsciiByte(writeSpy)).toBe(false);

    await disconnectGrblHarness(harness);
  });
});
