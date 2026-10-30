import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_BUILD_INFO_COMMAND,
  GRBL_CONSOLE_DIRECTION,
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_HANDSHAKE_FAILURE_REASON,
  GRBL_HANDSHAKE_TIMEOUT_MS,
  GRBL_LINE_ORIGIN,
  GRBL_MACHINE_STATE,
  GRBL_REALTIME_COMMAND,
  GRBL_SETTINGS_COMMAND,
  GRBL_STATUS_POLL_INTERVAL_MS,
} from './grbl.constants';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { GrblController } from './grbl.controller';
import { GrblControllerBusyError } from './grbl.controller.busy.error';
import { GrblHandshakeError } from './grbl.handshake.error';
import { SimulatedLaserTransport } from './simulated.laser.transport';
import { GRBL_SIMULATOR_FAULT_KIND } from './simulator/grbl.simulator.constants';
import { GRBL_SIMULATOR_DEFAULT_SETTINGS } from './simulator/grbl.simulator.default.settings';
import type { GrblConnectionInfo } from './interfaces/GrblConnectionInfo';
import type { GrblConsoleEntry } from './interfaces/GrblConsoleEntry';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { SerialTransport } from './interfaces/SerialTransport';

const BUILD_INFO_LINE = '$I\n';
const OPTIONS_LINE = '[OPT:V,15,128]';
const SETTINGS_LINE = '$$\n';
const UNSUPPORTED_BANNER_OUTPUT = "Grbl 0.9j ['$' for help]\r\n";
const SUPPORTED_BANNER_OUTPUT = "Grbl 1.1h ['$' for help]\r\n";
const EARLY_CONSOLE_LINE = 'G0X1\n';
/** Time into the banner wait at which a test disconnects. */
const BANNER_WAIT_ELAPSED_MS = 100;
const CONSOLE_COMMAND = 'G1 X10 F600 ; move';
const PREPARED_CONSOLE_COMMAND = 'G1X10F600';
const FEEDLESS_MOVE = 'G1X10';
const UNDEFINED_FEED_ERROR_CODE = 22;
const OK_TEXT = 'ok';
const POLL_COUNT = 4;
const ORIGIN = { x: 0, y: 0, z: 0 };
/** Fake timers delay a 0 ms timer set during a tick by 1 ms, so each simulator round trip costs 1 ms. */
const ANSWER_SETTLE_MS = 10;

interface ControllerHarness {
  transport: SimulatedLaserTransport;
  controller: GrblController;
  events: GrblControllerEvent[];
}

const newControllerHarness = (): ControllerHarness => {
  const transport: SimulatedLaserTransport = new SimulatedLaserTransport();
  const controller: GrblController = new GrblController(transport);
  const events: GrblControllerEvent[] = [];
  controller.addEventListener((event: GrblControllerEvent): void => {
    events.push(event);
  });

  return { transport, controller, events };
};

const connectHarness = async (harness: ControllerHarness): Promise<GrblConnectionInfo> => {
  const connection: Promise<GrblConnectionInfo> = harness.controller.connect();
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

  return connection;
};

const getConsoleEntries = (events: GrblControllerEvent[]): GrblConsoleEntry[] => {
  const entries: GrblConsoleEntry[] = [];

  for (const event of events) {
    if (event.kind === GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY) {
      entries.push(event.entry);
    }
  }

  return entries;
};

const getStatusReports = (events: GrblControllerEvent[]): GrblResolvedStatus[] => {
  const statuses: GrblResolvedStatus[] = [];

  for (const event of events) {
    if (event.kind === GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT) {
      statuses.push(event.status);
    }
  }

  return statuses;
};

const getWrittenTexts = (writeSpy: { mock: { calls: Uint8Array[][] } }): string[] => {
  const decoder: TextDecoder = new TextDecoder();
  const texts: string[] = [];

  for (const [bytes] of writeSpy.mock.calls) {
    if (bytes) {
      texts.push(decoder.decode(bytes));
    }
  }

  return texts;
};

const getHandshakeFailureReason = async (connection: Promise<GrblConnectionInfo>): Promise<string | undefined> => {
  try {
    await connection;
  } catch (error: unknown) {
    return error instanceof GrblHandshakeError ? error.reason : undefined;
  }

  return undefined;
};

/** Transport whose controller prints one banner on open and never answers anything. */
class BannerOnlyTransport implements SerialTransport {
  public readonly close = vi.fn(async (): Promise<void> => undefined);
  private readonly bannerOutput: string;
  private receiveListener: ((chunk: Uint8Array) => void) | undefined;

  public constructor(bannerOutput: string) {
    this.bannerOutput = bannerOutput;
  }

  public async open(): Promise<void> {
    setTimeout((): void => {
      this.receiveListener?.(new TextEncoder().encode(this.bannerOutput));
    }, 0);
  }

  public async write(): Promise<void> {
    return undefined;
  }

  public setReceiveListener(listener: (chunk: Uint8Array) => void): void {
    this.receiveListener = listener;
  }

  public setConnectionLostListener(): void {
    return undefined;
  }
}

describe(GrblController.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('connect resolves with Grbl 1.1h, rx buffer 127 and the simulator settings', async () => {
    const harness: ControllerHarness = newControllerHarness();

    const connectionInfo: GrblConnectionInfo = await connectHarness(harness);

    expect(connectionInfo).toEqual({
      identity: { firmwareName: 'Grbl', version: '1.1h', vendorText: "['$' for help]" },
      rxBufferSize: 127,
      settings: GRBL_SIMULATOR_DEFAULT_SETTINGS,
      buildInfoLines: ['[VER:1.1h.20190825:]', OPTIONS_LINE],
    });

    await harness.controller.disconnect();
  });

  it('connect ignores a second banner and queries $I and $$ once', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const writeSpy = vi.spyOn(harness.transport, 'write');

    await connectHarness(harness);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    const writtenTexts: string[] = getWrittenTexts(writeSpy);

    expect(writtenTexts.filter((text: string) => text === BUILD_INFO_LINE)).toHaveLength(1);
    expect(writtenTexts.filter((text: string) => text === SETTINGS_LINE)).toHaveLength(1);
    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(2);

    await harness.controller.disconnect();
  });

  it('connect emits the reset, private lines and their answers as console entries', async () => {
    const harness: ControllerHarness = newControllerHarness();

    await connectHarness(harness);
    const entries: GrblConsoleEntry[] = getConsoleEntries(harness.events);

    expect(entries[0]).toMatchObject({
      direction: GRBL_CONSOLE_DIRECTION.REALTIME,
      realtimeCommand: GRBL_REALTIME_COMMAND.SOFT_RESET,
      isStatusReport: false,
    });
    expect(entries).toContainEqual(
      expect.objectContaining({ direction: GRBL_CONSOLE_DIRECTION.SENT, text: GRBL_BUILD_INFO_COMMAND }),
    );
    expect(entries).toContainEqual(
      expect.objectContaining({ direction: GRBL_CONSOLE_DIRECTION.SENT, text: GRBL_SETTINGS_COMMAND }),
    );
    expect(entries).toContainEqual(
      expect.objectContaining({ direction: GRBL_CONSOLE_DIRECTION.RECEIVED, text: OPTIONS_LINE }),
    );

    await harness.controller.disconnect();
  });

  it('connect times out after 10000 ms with reason timeout when the controller is silent', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const closeSpy = vi.spyOn(harness.transport, 'close');
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });

    const failureReason: Promise<string | undefined> = getHandshakeFailureReason(harness.controller.connect());
    await vi.advanceTimersByTimeAsync(GRBL_HANDSHAKE_TIMEOUT_MS - 1);

    expect(closeSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(await failureReason).toBe(GRBL_HANDSHAKE_FAILURE_REASON.TIMEOUT);
    expect(closeSpy).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('connect rejects Grbl 0.9j with reason unsupported-firmware and closes the transport', async () => {
    const transport: BannerOnlyTransport = new BannerOnlyTransport(UNSUPPORTED_BANNER_OUTPUT);
    const controller: GrblController = new GrblController(transport);

    const failureReason: Promise<string | undefined> = getHandshakeFailureReason(controller.connect());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(await failureReason).toBe(GRBL_HANDSHAKE_FAILURE_REASON.UNSUPPORTED_FIRMWARE);
    expect(transport.close).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('connection loss while waiting for $I rejects connect with GrblConnectionClosedError', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const forwardWrite = harness.transport.write.bind(harness.transport);
    vi.spyOn(harness.transport, 'write').mockImplementation(async (bytes: Uint8Array): Promise<void> => {
      await forwardWrite(bytes);

      if (new TextDecoder().decode(bytes) === BUILD_INFO_LINE) {
        harness.transport.simulateConnectionLoss();
      }
    });

    const connection: Promise<GrblConnectionInfo> = harness.controller.connect();
    const rejection: Promise<void> = expect(connection).rejects.toBeInstanceOf(GrblConnectionClosedError);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    await rejection;
    expect(harness.events).toContainEqual({ kind: GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('connect times out at 10000 ms when the controller sends a banner but never answers $I', async () => {
    const transport: BannerOnlyTransport = new BannerOnlyTransport(SUPPORTED_BANNER_OUTPUT);
    const controller: GrblController = new GrblController(transport);

    const failureReason: Promise<string | undefined> = getHandshakeFailureReason(controller.connect());
    await vi.advanceTimersByTimeAsync(GRBL_HANDSHAKE_TIMEOUT_MS - 1);

    expect(transport.close).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(await failureReason).toBe(GRBL_HANDSHAKE_FAILURE_REASON.TIMEOUT);
    expect(transport.close).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('disconnect during the banner wait rejects connect with GrblConnectionClosedError, no timer', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const closeSpy = vi.spyOn(harness.transport, 'close');
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });
    const connection: Promise<GrblConnectionInfo> = harness.controller.connect();
    const rejection: Promise<void> = expect(connection).rejects.toBeInstanceOf(GrblConnectionClosedError);
    await vi.advanceTimersByTimeAsync(BANNER_WAIT_ELAPSED_MS);

    await harness.controller.disconnect();

    await rejection;
    expect(closeSpy).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('connection loss during the banner wait rejects connect with GrblConnectionClosedError, no timer', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const closeSpy = vi.spyOn(harness.transport, 'close');
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });
    const connection: Promise<GrblConnectionInfo> = harness.controller.connect();
    const rejection: Promise<void> = expect(connection).rejects.toBeInstanceOf(GrblConnectionClosedError);
    await vi.advanceTimersByTimeAsync(BANNER_WAIT_ELAPSED_MS);

    harness.transport.simulateConnectionLoss();

    await rejection;
    expect(closeSpy).not.toHaveBeenCalled();
    expect(harness.events).toContainEqual({ kind: GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a cancelled connect does not disturb the next connect past the original 10000 ms deadline', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const closeSpy = vi.spyOn(harness.transport, 'close');
    const firstConnection: Promise<GrblConnectionInfo> = harness.controller.connect();
    const firstRejection: Promise<void> = expect(firstConnection).rejects.toBeInstanceOf(GrblConnectionClosedError);
    await harness.controller.disconnect();
    await firstRejection;

    await connectHarness(harness);
    harness.events.length = 0;
    await vi.advanceTimersByTimeAsync(GRBL_HANDSHAKE_TIMEOUT_MS);

    expect(closeSpy).toHaveBeenCalledOnce();
    expect(getStatusReports(harness.events).length).toBeGreaterThan(POLL_COUNT);
    expect(harness.events).not.toContainEqual({ kind: GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST });

    await harness.controller.disconnect();
  });

  it('console command issued during the handshake is dropped, not written or queued', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const writeSpy = vi.spyOn(harness.transport, 'write');
    const connection: Promise<GrblConnectionInfo> = harness.controller.connect();

    harness.controller.sendConsoleCommand(EARLY_CONSOLE_LINE);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    await connection;
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getWrittenTexts(writeSpy)).not.toContain(EARLY_CONSOLE_LINE);

    await harness.controller.disconnect();
  });

  it('connect while connecting or connected rejects with GrblControllerBusyError, port untouched', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const openSpy = vi.spyOn(harness.transport, 'open');
    const closeSpy = vi.spyOn(harness.transport, 'close');
    const firstConnection: Promise<GrblConnectionInfo> = harness.controller.connect();

    await expect(harness.controller.connect()).rejects.toBeInstanceOf(GrblControllerBusyError);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    await firstConnection;
    await expect(harness.controller.connect()).rejects.toBeInstanceOf(GrblControllerBusyError);

    expect(openSpy).toHaveBeenCalledOnce();
    expect(closeSpy).not.toHaveBeenCalled();

    harness.events.length = 0;
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS);

    expect(getStatusReports(harness.events)).toHaveLength(1);

    await harness.controller.disconnect();
  });

  it('polls status every 250 ms and emits resolved status reports', async () => {
    const harness: ControllerHarness = newControllerHarness();
    await connectHarness(harness);
    harness.events.length = 0;

    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS * POLL_COUNT);
    const statuses: GrblResolvedStatus[] = getStatusReports(harness.events);
    const statusEntries: GrblConsoleEntry[] = getConsoleEntries(harness.events).filter(
      (entry: GrblConsoleEntry) => entry.isStatusReport,
    );

    expect(statuses).toHaveLength(POLL_COUNT);
    expect(statuses[POLL_COUNT - 1]).toMatchObject({
      machineState: GRBL_MACHINE_STATE.IDLE,
      machinePosition: ORIGIN,
      workPosition: ORIGIN,
      workCoordinateOffset: ORIGIN,
    });
    expect(harness.controller.getLatestStatus()).toEqual(statuses[POLL_COUNT - 1]);
    expect(statusEntries[0]).toMatchObject({
      direction: GRBL_CONSOLE_DIRECTION.REALTIME,
      text: '?',
      realtimeCommand: GRBL_REALTIME_COMMAND.STATUS_QUERY,
    });
    expect(statusEntries[1]).toMatchObject({ direction: GRBL_CONSOLE_DIRECTION.RECEIVED, realtimeCommand: undefined });
    expect(statusEntries).toHaveLength(POLL_COUNT * 2);

    await harness.controller.disconnect();
  });

  it('disconnect stops polling, closes the transport and leaves no timer behind', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const closeSpy = vi.spyOn(harness.transport, 'close');
    await connectHarness(harness);

    await harness.controller.disconnect();
    harness.events.length = 0;
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS * POLL_COUNT);

    expect(closeSpy).toHaveBeenCalledOnce();
    expect(harness.events).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('connection loss emits connection-lost once and stops polling', async () => {
    const harness: ControllerHarness = newControllerHarness();
    await connectHarness(harness);
    harness.events.length = 0;

    harness.transport.simulateConnectionLoss();
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS * POLL_COUNT);

    expect(harness.events).toEqual([{ kind: GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST }]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('console command is sent, echoed as a sent entry, and its ok is received', async () => {
    const harness: ControllerHarness = newControllerHarness();
    await connectHarness(harness);
    harness.events.length = 0;

    harness.controller.sendConsoleCommand(CONSOLE_COMMAND);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    const entries: GrblConsoleEntry[] = getConsoleEntries(harness.events);

    expect(entries).toEqual([
      {
        direction: GRBL_CONSOLE_DIRECTION.SENT,
        text: PREPARED_CONSOLE_COMMAND,
        realtimeCommand: undefined,
        isStatusReport: false,
        timestamp: expect.any(Number),
      },
      {
        direction: GRBL_CONSOLE_DIRECTION.RECEIVED,
        text: OK_TEXT,
        realtimeCommand: undefined,
        isStatusReport: false,
        timestamp: expect.any(Number),
      },
    ]);

    await harness.controller.disconnect();
  });

  it('console command that is only a comment sends nothing', async () => {
    const harness: ControllerHarness = newControllerHarness();
    await connectHarness(harness);
    const writeSpy = vi.spyOn(harness.transport, 'write');
    harness.events.length = 0;

    harness.controller.sendConsoleCommand('  ; just a note');
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(writeSpy).not.toHaveBeenCalled();
    expect(harness.events).toEqual([]);

    await harness.controller.disconnect();
  });

  it('error reply emits grbl-error with the line text', async () => {
    const harness: ControllerHarness = newControllerHarness();
    await connectHarness(harness);
    harness.events.length = 0;

    harness.controller.sendConsoleCommand(FEEDLESS_MOVE);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(harness.events).toContainEqual({
      kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
      code: UNDEFINED_FEED_ERROR_CODE,
      lineText: FEEDLESS_MOVE,
      origin: GRBL_LINE_ORIGIN.CONSOLE,
    });

    await harness.controller.disconnect();
  });

  it('alarm line emits grbl-alarm with its code', async () => {
    const harness: ControllerHarness = newControllerHarness();
    const alarmCode = 1;
    await connectHarness(harness);
    harness.events.length = 0;

    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(harness.events).toContainEqual({ kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM, code: alarmCode });

    await harness.controller.disconnect();
  });
});
