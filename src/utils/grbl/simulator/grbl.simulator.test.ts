import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_CYCLE_RESUME_BYTE,
  GRBL_FEED_HOLD_BYTE,
  GRBL_JOG_CANCEL_BYTE,
  GRBL_MACHINE_STATE,
  GRBL_SOFT_RESET_BYTE,
  GRBL_STATUS_QUERY_BYTE,
} from '../grbl.constants';
import { GrblSimulator } from './grbl.simulator';
import { GRBL_SIMULATOR_FAULT_KIND } from './grbl.simulator.constants';

const BANNER = "Grbl 1.1h ['$' for help]";
const UNLOCK_REQUIRED_MESSAGE = "[MSG:'$H'|'$X' to unlock]";
const OK = 'ok';
const UNLOCKED_MESSAGE = '[MSG:Caution: Unlocked]';
const LINE_ENDING = '\r\n';
const RX_BUFFER_BYTES = 127;
const PLANNER_BLOCK_COUNT = 15;
/** Lines sent beyond a full planner, which wait in the RX buffer. */
const WAITING_LINE_COUNT = 3;
const VERSION_REPORT = '[VER:1.1h.20190825:]';
const BUILD_OPTION_REPORT = '[OPT:V,15,128]';
const TICK_MS = 20;
const DECELERATION_MS = 200;
/** G1X10F600 from the origin takes 1000 ms. */
const SHORT_MOVE = 'G1X10F600';
const SHORT_MOVE_MS = 1_000;
/** G1X100F600 from the origin takes 10 s. */
const LONG_MOVE = 'G1X100F600';
const IDLE_AT_ORIGIN_WITH_WCO = '<Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>';
const ERROR_LOCKED = 'error:9';
const UNDEFINED_FEED_ERROR = 'error:22';
const FAULT_LINE_NUMBER = 2;
const FAULT_ERROR_CODE = 20;
const FAULT_ALARM_CODE = 1;
const HOLD_DECELERATING_STATE = 'Hold:1';
const HOLD_COMPLETE_STATE = 'Hold:0';
const ORIGIN_POSITION = '0.000,0.000,0.000';
const RAPID_TO_X1 = 'G0X1';
const IDLE_AT_ORIGIN = '<Idle|MPos:0.000,0.000,0.000|FS:0,0>';
const IDLE_AT_X10 = '<Idle|MPos:10.000,0.000,0.000|FS:0,0>';
/** A jog cancelled at X10 (after 1 s at 10 mm/s) stops within the 200 ms deceleration, well before this X. */
const JOG_CANCEL_STOP_LIMIT_X = 15;
/** Any non-realtime character without a line feed, so it stays in the receive buffer. */
const FILLER_CHARACTER = 'X';
const STATUS_STATE_PATTERN = /^<([^|]+)\|/;
const MACHINE_POSITION_PATTERN = /MPos:([^|>]+)/;

interface SimulatorHarness {
  simulator: GrblSimulator;
  outputLines: string[];
}

const newSimulatorHarness = (): SimulatorHarness => {
  const outputLines: string[] = [];
  const simulator: GrblSimulator = new GrblSimulator((text: string): void => {
    expect(text.endsWith(LINE_ENDING)).toBe(true);
    outputLines.push(text.slice(0, -LINE_ENDING.length));
  });

  simulator.powerOn();
  outputLines.length = 0;

  return { simulator, outputLines };
};

const sendLine = (simulator: GrblSimulator, line: string): void => {
  simulator.receiveBytes(new TextEncoder().encode(`${line}\n`));
};

const sendRealtimeByte = (simulator: GrblSimulator, byte: number): void => {
  simulator.receiveBytes(Uint8Array.of(byte));
};

const takeOutputLines = (harness: SimulatorHarness): string[] => harness.outputLines.splice(0);

const getStatusReport = (harness: SimulatorHarness): string => {
  sendRealtimeByte(harness.simulator, GRBL_STATUS_QUERY_BYTE);

  return takeOutputLines(harness).at(-1) ?? '';
};

const getReportedState = (harness: SimulatorHarness): string =>
  STATUS_STATE_PATTERN.exec(getStatusReport(harness))?.[1] ?? '';

const getReportedMachinePosition = (harness: SimulatorHarness): string =>
  MACHINE_POSITION_PATTERN.exec(getStatusReport(harness))?.[1] ?? '';

describe(GrblSimulator.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits the banner on power on', () => {
    const outputLines: string[] = [];
    const simulator: GrblSimulator = new GrblSimulator((text: string): void => {
      outputLines.push(text);
    });

    simulator.powerOn();

    expect(outputLines).toEqual([`${BANNER}${LINE_ENDING}`]);
  });

  it('answers ok when the move is planned, reports Run while it runs and Idle after its duration', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, SHORT_MOVE);

    expect(takeOutputLines(harness)).toEqual([OK]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.RUN);

    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS / 2);

    expect(getStatusReport(harness)).toBe('<Run|MPos:5.000,0.000,0.000|FS:600,0>');

    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS / 2 + TICK_MS);

    expect(getStatusReport(harness)).toBe(IDLE_AT_X10);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('adds WCO to the first status report and after G92 only', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    expect(getStatusReport(harness)).toBe(IDLE_AT_ORIGIN_WITH_WCO);
    expect(getStatusReport(harness)).toBe(IDLE_AT_ORIGIN);

    sendLine(harness.simulator, 'G92X-5');
    takeOutputLines(harness);

    expect(getStatusReport(harness)).toBe('<Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:5.000,0.000,0.000>');
    expect(getStatusReport(harness)).toBe(IDLE_AT_ORIGIN);

    sendLine(harness.simulator, SHORT_MOVE);
    takeOutputLines(harness);

    expect(getStatusReport(harness)).not.toContain('WCO');
  });

  it('reports the effective laser power while burning', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, 'M3S500');
    sendLine(harness.simulator, SHORT_MOVE);
    await vi.advanceTimersByTimeAsync(TICK_MS);

    expect(getStatusReport(harness)).toMatch(/\|FS:600,500/);
  });

  it('feed hold decelerates to Hold:0 and soft reset after that keeps position without alarm', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    sendLine(harness.simulator, LONG_MOVE);
    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS);

    sendRealtimeByte(harness.simulator, GRBL_FEED_HOLD_BYTE);

    expect(getReportedState(harness)).toBe(HOLD_DECELERATING_STATE);

    await vi.advanceTimersByTimeAsync(DECELERATION_MS / 2);

    expect(getReportedState(harness)).toBe(HOLD_DECELERATING_STATE);

    await vi.advanceTimersByTimeAsync(DECELERATION_MS / 2 + TICK_MS);

    expect(getReportedState(harness)).toBe(HOLD_COMPLETE_STATE);

    const heldPosition: string = getReportedMachinePosition(harness);
    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS);

    expect(getReportedMachinePosition(harness)).toBe(heldPosition);

    takeOutputLines(harness);
    sendRealtimeByte(harness.simulator, GRBL_SOFT_RESET_BYTE);

    expect(takeOutputLines(harness)).toEqual([BANNER]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.IDLE);
    expect(getReportedMachinePosition(harness)).toBe(heldPosition);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cycle resume after a feed hold finishes the move', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    sendLine(harness.simulator, SHORT_MOVE);
    sendRealtimeByte(harness.simulator, GRBL_FEED_HOLD_BYTE);
    await vi.advanceTimersByTimeAsync(DECELERATION_MS + TICK_MS);

    sendRealtimeByte(harness.simulator, GRBL_CYCLE_RESUME_BYTE);

    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.RUN);

    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS);

    expect(getStatusReport(harness)).toBe(IDLE_AT_X10);
  });

  it('soft reset during motion raises ALARM:3', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    sendLine(harness.simulator, LONG_MOVE);
    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS);
    takeOutputLines(harness);

    sendRealtimeByte(harness.simulator, GRBL_SOFT_RESET_BYTE);

    expect(takeOutputLines(harness)).toEqual(['ALARM:3', BANNER, UNLOCK_REQUIRED_MESSAGE]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.ALARM);
    expect(getReportedMachinePosition(harness)).toBe('10.000,0.000,0.000');

    sendLine(harness.simulator, RAPID_TO_X1);

    expect(takeOutputLines(harness)).toEqual([ERROR_LOCKED]);

    sendLine(harness.simulator, '$X');

    expect(takeOutputLines(harness)).toEqual([UNLOCKED_MESSAGE, OK]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.IDLE);
  });

  it('flags overflow when more than 127 bytes are unacknowledged', () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    harness.simulator.receiveBytes(new TextEncoder().encode(FILLER_CHARACTER.repeat(RX_BUFFER_BYTES)));
    sendRealtimeByte(harness.simulator, GRBL_STATUS_QUERY_BYTE);

    expect(harness.simulator.hasRxBufferOverflowed()).toBe(false);

    harness.simulator.receiveBytes(new TextEncoder().encode(FILLER_CHARACTER));

    expect(harness.simulator.hasRxBufferOverflowed()).toBe(true);
  });

  it('keeps lines in the RX buffer while the planner holds 15 blocks', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    for (let lineIndex = 1; lineIndex <= PLANNER_BLOCK_COUNT + 1; lineIndex++) {
      sendLine(harness.simulator, `G1X${lineIndex * 10}F600`);
    }

    expect(takeOutputLines(harness)).toEqual(Array(PLANNER_BLOCK_COUNT).fill(OK));

    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS + TICK_MS);

    expect(takeOutputLines(harness)).toEqual([OK]);
    expect(harness.simulator.getReceivedLineCount()).toBe(PLANNER_BLOCK_COUNT + 1);
  });

  it('check mode answers errors without moving and leaves with a reset banner', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, '$C');

    expect(takeOutputLines(harness)).toEqual(['[MSG:Enabled]', OK]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.CHECK);

    sendLine(harness.simulator, 'G1X10');
    sendLine(harness.simulator, SHORT_MOVE);

    expect(takeOutputLines(harness)).toEqual([UNDEFINED_FEED_ERROR, OK]);
    expect(getReportedMachinePosition(harness)).toBe(ORIGIN_POSITION);

    sendLine(harness.simulator, '$C');

    expect(takeOutputLines(harness)).toEqual(['[MSG:Disabled]', OK, BANNER]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.IDLE);
  });

  it('$I reports OPT rx 128', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, '$I');

    expect(takeOutputLines(harness)).toEqual([VERSION_REPORT, BUILD_OPTION_REPORT, OK]);
  });

  it('$$ lists the settings and a setting write is listed afterwards', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, '$110=3000');
    sendLine(harness.simulator, '$$');
    const outputLines: string[] = takeOutputLines(harness);

    expect(outputLines[0]).toBe(OK);
    expect(outputLines[1]).toBe('$0=10');
    expect(outputLines).toContain('$110=3000');
    expect(outputLines.at(-1)).toBe(OK);
  });

  it('answers error 3 for an unknown system command and error 8 for a setting write while running', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, '$999=1');
    sendLine(harness.simulator, SHORT_MOVE);
    sendLine(harness.simulator, '$110=3000');

    expect(takeOutputLines(harness)).toEqual(['error:3', OK, 'error:8']);
  });

  it('$G reports the modal state', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, 'G1F600M3S500');
    sendLine(harness.simulator, '$G');

    expect(takeOutputLines(harness)).toEqual([OK, '[GC:G1 G54 G17 G21 G90 G94 M3 M9 T0 F600 S500]', OK]);
  });

  it('$H homes to the origin and clears an alarm', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    sendLine(harness.simulator, SHORT_MOVE);
    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS + TICK_MS);
    harness.simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: FAULT_ALARM_CODE });
    takeOutputLines(harness);

    sendLine(harness.simulator, '$H');

    expect(takeOutputLines(harness)).toEqual([OK]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.IDLE);
    expect(getReportedMachinePosition(harness)).toBe(ORIGIN_POSITION);
  });

  it('jogs in state Jog and jog cancel stops after the deceleration, dropping the rest of the jog', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, '$J=G91X100F600');

    expect(takeOutputLines(harness)).toEqual([OK]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.JOG);

    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS);
    sendRealtimeByte(harness.simulator, GRBL_JOG_CANCEL_BYTE);

    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.JOG);

    await vi.advanceTimersByTimeAsync(DECELERATION_MS + TICK_MS);

    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.IDLE);

    const stoppedPosition: string = getReportedMachinePosition(harness);

    expect(Number(stoppedPosition.split(',')[0])).toBeLessThan(JOG_CANCEL_STOP_LIMIT_X);

    sendLine(harness.simulator, 'G91G0X0');
    await vi.advanceTimersByTimeAsync(TICK_MS);

    expect(getReportedMachinePosition(harness)).toBe(stoppedPosition);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('error-on-line fault answers error on that line', () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    harness.simulator.injectFault({
      kind: GRBL_SIMULATOR_FAULT_KIND.ERROR_ON_LINE,
      lineNumber: FAULT_LINE_NUMBER,
      errorCode: FAULT_ERROR_CODE,
    });

    sendLine(harness.simulator, RAPID_TO_X1);
    sendLine(harness.simulator, 'G0X2');
    sendLine(harness.simulator, 'G0X3');

    expect(takeOutputLines(harness)).toEqual([OK, `error:${FAULT_ERROR_CODE}`, OK]);
    expect(harness.simulator.getReceivedLineCount()).toBe(3);
  });

  it('alarm fault emits ALARM:N, stops motion and locks G-code', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    sendLine(harness.simulator, LONG_MOVE);
    takeOutputLines(harness);

    harness.simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: FAULT_ALARM_CODE });

    expect(takeOutputLines(harness)).toEqual([`ALARM:${FAULT_ALARM_CODE}`]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.ALARM);

    sendLine(harness.simulator, SHORT_MOVE);

    expect(takeOutputLines(harness)).toEqual([ERROR_LOCKED]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stop-responding fault silences all output', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    harness.simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });
    sendLine(harness.simulator, '$I');
    sendRealtimeByte(harness.simulator, GRBL_STATUS_QUERY_BYTE);

    expect(harness.outputLines).toEqual([]);
  });

  it('resets the received line count on soft reset and counts system commands', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendLine(harness.simulator, '$I');
    sendLine(harness.simulator, '');

    expect(harness.simulator.getReceivedLineCount()).toBe(2);
    expect(takeOutputLines(harness).at(-1)).toBe(OK);

    sendRealtimeByte(harness.simulator, GRBL_SOFT_RESET_BYTE);

    expect(harness.simulator.getReceivedLineCount()).toBe(0);
  });

  it('alarm fault flushes lines waiting in the RX buffer so $X is answered alone', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    for (let lineIndex = 1; lineIndex <= PLANNER_BLOCK_COUNT + WAITING_LINE_COUNT; lineIndex++) {
      sendLine(harness.simulator, `G1X${lineIndex * 10}F600`);
    }

    takeOutputLines(harness);
    harness.simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: FAULT_ALARM_CODE });
    sendLine(harness.simulator, '$X');

    expect(takeOutputLines(harness)).toEqual([`ALARM:${FAULT_ALARM_CODE}`, UNLOCKED_MESSAGE, OK]);
    expect(harness.simulator.getReceivedLineCount()).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('feed hold while idle reports Hold:0 at once and resume returns to Idle', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    sendRealtimeByte(harness.simulator, GRBL_FEED_HOLD_BYTE);

    expect(getReportedState(harness)).toBe(HOLD_COMPLETE_STATE);

    sendRealtimeByte(harness.simulator, GRBL_CYCLE_RESUME_BYTE);

    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.IDLE);
  });

  it('feed hold during a jog cancels the jog: decelerates, then Idle', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    sendLine(harness.simulator, '$J=G91X100F600');
    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS);

    sendRealtimeByte(harness.simulator, GRBL_FEED_HOLD_BYTE);

    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.JOG);

    await vi.advanceTimersByTimeAsync(DECELERATION_MS + TICK_MS);

    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.IDLE);
    expect(Number(getReportedMachinePosition(harness).split(',')[0])).toBeLessThan(JOG_CANCEL_STOP_LIMIT_X);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('soft reset during Hold:1 raises ALARM:3', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    sendLine(harness.simulator, LONG_MOVE);
    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS);
    sendRealtimeByte(harness.simulator, GRBL_FEED_HOLD_BYTE);
    await vi.advanceTimersByTimeAsync(DECELERATION_MS / 2);
    takeOutputLines(harness);

    sendRealtimeByte(harness.simulator, GRBL_SOFT_RESET_BYTE);

    expect(takeOutputLines(harness)).toEqual(['ALARM:3', BANNER, UNLOCK_REQUIRED_MESSAGE]);
    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.ALARM);
  });

  it('cycle resume during Hold:1 is ignored; it is accepted once Hold:0 is reached', async () => {
    const harness: SimulatorHarness = newSimulatorHarness();
    sendLine(harness.simulator, LONG_MOVE);
    await vi.advanceTimersByTimeAsync(SHORT_MOVE_MS);
    sendRealtimeByte(harness.simulator, GRBL_FEED_HOLD_BYTE);

    sendRealtimeByte(harness.simulator, GRBL_CYCLE_RESUME_BYTE);

    expect(getReportedState(harness)).toBe(HOLD_DECELERATING_STATE);

    await vi.advanceTimersByTimeAsync(DECELERATION_MS + TICK_MS);

    expect(getReportedState(harness)).toBe(HOLD_COMPLETE_STATE);

    sendRealtimeByte(harness.simulator, GRBL_CYCLE_RESUME_BYTE);

    expect(getReportedState(harness)).toBe(GRBL_MACHINE_STATE.RUN);
  });

  it('answers a CRLF-terminated line normally', () => {
    const harness: SimulatorHarness = newSimulatorHarness();

    harness.simulator.receiveBytes(new TextEncoder().encode('$I\r\n'));

    expect(takeOutputLines(harness)).toEqual([VERSION_REPORT, BUILD_OPTION_REPORT, OK]);
  });
});
