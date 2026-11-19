import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_MACHINE_STATE,
  GRBL_SOFT_RESET_BYTE,
  GRBL_STATUS_POLL_INTERVAL_MS,
  GRBL_STOP_FINISH_MAX_WAIT_MS,
  SIMULATED_LASER_PORT_ID,
} from '../grbl/grbl.constants';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { GrblSimulator } from '../grbl/simulator/grbl.simulator';
import { GRBL_SIMULATOR_FAULT_KIND } from '../grbl/simulator/grbl.simulator.constants';
import { ANSWER_SETTLE_MS } from '../grbl/test.support/grbl.answer.settle';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { newProjectObject } from '../project/new.project.object';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../toolpath/interfaces/ObjectWarning';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { ConnectRequested, DisconnectRequested, SerialPortSelected } from './grbl.connection.state';
import { ConsoleCommandSubmitted, selectConsoleEntries } from './grbl.console.state';
import type { GrblConsoleViewEntry } from './interfaces/GrblConsoleViewEntry';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import { selectJobPauseControl } from './job.pause.control.selector';
import { runGrblJob } from './job.run.saga';
import {
  JobPauseRequested,
  JobResumeRequested,
  JobStartRequested,
  selectIsJobRunActive,
  selectJobRunAnsweredLineCount,
  selectJobRunStatus,
  selectJobRunTotalLineCount,
} from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import {
  MachineAirAssistChanged,
  MachineLineRequested,
  MachineResetRequested,
  MachineStopRequested,
  selectIsAirAssistOn,
  selectMachineStatus,
} from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ProjectObjectsAdded } from './project.document.state';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';

/** 100 mm at the test move's speed outlasts the time the running checks wait. */
const LONG_MOVE_END_X_MM = 100;
const MANY_MOVES_COUNT = 200;
const IDLE_REPORT_START = '<Idle';
const ALARM_CODE = 1;
const SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const JOB_END_MS = 10_000;
const LASER_MODE_OFF_LINE = '$32=0\n';
const LASER_MODE_CHANGING_LINES: string[] = ['$32=0', '$32 = 1', '$rst=*'];
const CONSOLE_LINE = 'G0X1';
const MACHINE_LINE = 'G0X2';
const RETURN_JOG_START = '$J=G90 G21 X0 Y0';
const LASER_OFF_LINE = 'M5\n';
const WARNED_OBJECT_ID = 'object';
const OFF_PAGE_WARNING: ObjectWarning = { objectId: WARNED_OBJECT_ID, kind: SVG_UNSUPPORTED_KIND.OFF_PAGE };

const getSentText = (writeCalls: Uint8Array[][]): string =>
  writeCalls.map(([bytes]: Uint8Array[]): string => new TextDecoder().decode(bytes)).join('');

/** A simulated laser with laser mode off; settings survive power cycles. */
const newLaserModeOffSimulator = (): GrblSimulator => {
  const simulator: GrblSimulator = new GrblSimulator(() => undefined);

  simulator.powerOn();
  simulator.receiveBytes(new TextEncoder().encode(LASER_MODE_OFF_LINE));
  simulator.powerOff();

  return simulator;
};

/** A simulated port that can hold the reset byte back, and act just before a report that is on its way arrives. */
class ControlledLaserTransport extends SimulatedLaserTransport {
  /** Lets the held reset byte go; set while it is held. */
  private resetWriteRelease: (() => void) | undefined;
  /** The held write of the reset byte; set once the hold is on. */
  private resetWriteHold: Promise<void> | undefined;
  /** Called with each received text before the controller sees it. */
  public receivedTextObserver: ((text: string) => void) | undefined;

  public holdResetWrite(): void {
    this.resetWriteHold = new Promise((resolve: () => void): void => {
      this.resetWriteRelease = resolve;
    });
  }

  public releaseResetWrite(): void {
    this.resetWriteRelease?.();
  }

  public override async write(bytes: Uint8Array): Promise<void> {
    if (bytes.includes(GRBL_SOFT_RESET_BYTE)) {
      await this.resetWriteHold;
    }

    await super.write(bytes);
  }

  public override setReceiveListener(listener: (chunk: Uint8Array) => void): void {
    super.setReceiveListener((chunk: Uint8Array): void => {
      this.receivedTextObserver?.(new TextDecoder().decode(chunk));
      listener(chunk);
    });
  }
}

const newJobStore = (transport: SimulatedLaserTransport): AppStore => newStore(
  {
    newTransport: () => transport,
    requestSerialPort: async () => undefined,
    getGrantedSerialPorts: async () => [],
    storage: { getStoredConnectionPreferences: () => undefined, storeConnectionPreferences: () => undefined },
  },
  new FakeToolpathWorkerClient(),
);

const prepareConnectedStore = async (
  warnings: ObjectWarning[] = [],
  moveOverrides: Partial<ToolpathMove> = {},
  simulator?: GrblSimulator,
  transport: SimulatedLaserTransport = new SimulatedLaserTransport(simulator),
): Promise<AppStore> => {
  const store: AppStore = newJobStore(transport);
  const profile: MachineProfile = newMachineProfile({ hasAirAssist: true });

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
  store.dispatch(new ConnectRequested());
  await vi.advanceTimersByTimeAsync(SETTLE_MS);

  // Warnings only count for objects in the project, as a new or emptied project shows none.
  if (warnings.length) {
    store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject({ id: WARNED_OBJECT_ID })], layers: [] }));
  }

  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({
      moves: [newToolpathMove({ to: { x: LONG_MOVE_END_X_MM, y: 0 }, ...moveOverrides })],
      warnings,
    }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store;
};

/** With MANY_MOVES_COUNT, far more lines than GRBL can buffer, so the program is still being sent when a stop comes. */
const replaceToolpathWithMoves = (store: AppStore, moveCount: number): void => {
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({
      moves: Array.from({ length: moveCount }, (_: unknown, moveIndex: number): ToolpathMove =>
        // Back and forth, so every move stays on the bed and Start is not held back.
        newToolpathMove({ to: { x: moveIndex % 2 ? 0 : LONG_MOVE_END_X_MM, y: 0 } })),
      warnings: [],
    }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));
};

const expectLocksOnWhileResetIsHeld = async (store: AppStore, transport: ControlledLaserTransport): Promise<void> => {
  await vi.advanceTimersByTimeAsync(SETTLE_MS);
  expect(selectIsJobRunActive(store.getState())).toBe(true);

  transport.releaseResetWrite();
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
  expect(selectIsJobRunActive(store.getState())).toBe(false);
};

const isIdleReportWhileJobFinishing = (store: AppStore, receivedText: string): boolean =>
  receivedText.includes(IDLE_REPORT_START) && selectJobRunStatus(store.getState()) === JOB_RUN_STATUS.FINISHING;

describe(runGrblJob.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the job and reports it finished only once the laser is idle again', async () => {
    const store: AppStore = await prepareConnectedStore();

    expect(selectJobStartBlockedReasonKey(store.getState())).toBeUndefined();
    store.dispatch(new JobStartRequested());
    expect(selectIsJobRunActive(store.getState())).toBe(true);

    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).not.toBe(JOB_RUN_STATUS.COMPLETED);

    await vi.advanceTimersByTimeAsync(JOB_END_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.COMPLETED);
  });

  it('takes the laser back to where the job started once the job has finished, with the beam off first', async () => {
    const store: AppStore = await prepareConnectedStore();
    const writeSpy = vi.spyOn(SimulatedLaserTransport.prototype, 'write');

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(JOB_END_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.COMPLETED);
    await vi.advanceTimersByTimeAsync(JOB_END_MS);

    const sentText: string = getSentText(writeSpy.mock.calls);

    expect(sentText).toContain(RETURN_JOG_START);
    expect(sentText.lastIndexOf(LASER_OFF_LINE)).toBeLessThan(sentText.indexOf(RETURN_JOG_START));
    expect(selectMachineStatus(store.getState())?.workPosition?.x).toBe(0);
    writeSpy.mockRestore();
  });

  it('leaves the laser where it stopped after a stop, without moving it back', async () => {
    const store: AppStore = await prepareConnectedStore();
    const writeSpy = vi.spyOn(SimulatedLaserTransport.prototype, 'write');

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    await vi.advanceTimersByTimeAsync(JOB_END_MS);

    expect(getSentText(writeSpy.mock.calls)).not.toContain(RETURN_JOG_START);
    writeSpy.mockRestore();
  });

  it('reports a stopped job as interrupted, not as finished', async () => {
    const store: AppStore = await prepareConnectedStore();

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
  });

  it('reports a job as interrupted when a stop comes before the last answers, which still arrive', async () => {
    const store: AppStore = await prepareConnectedStore();

    store.dispatch(new JobStartRequested());
    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
  });

  it('keeps the locks on after a stop during finishing until the stop has ended', async () => {
    const store: AppStore = await prepareConnectedStore();

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.FINISHING);

    store.dispatch(new MachineStopRequested());
    expect(selectIsJobRunActive(store.getState())).toBe(true);

    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsJobRunActive(store.getState())).toBe(false);
  });

  it('keeps the locks on while the reset of a stop during sending is not yet written', async () => {
    const transport: ControlledLaserTransport = new ControlledLaserTransport();
    const store: AppStore = await prepareConnectedStore([], {}, undefined, transport);

    replaceToolpathWithMoves(store, MANY_MOVES_COUNT);
    transport.holdResetWrite();
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.SENDING);

    store.dispatch(new MachineStopRequested());

    await expectLocksOnWhileResetIsHeld(store, transport);
  });

  it('keeps the locks on when an alarm comes during the stop of a finishing job', async () => {
    const transport: ControlledLaserTransport = new ControlledLaserTransport();
    const store: AppStore = await prepareConnectedStore([], {}, undefined, transport);

    transport.holdResetWrite();
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.FINISHING);

    store.dispatch(new MachineStopRequested());
    transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: ALARM_CODE });

    await expectLocksOnWhileResetIsHeld(store, transport);
  });

  it('reports interrupted when an Idle report on its way arrives just after the stop request', async () => {
    const transport: ControlledLaserTransport = new ControlledLaserTransport();
    const store: AppStore = await prepareConnectedStore([], {}, undefined, transport);

    transport.receivedTextObserver = (text: string): void => {
      if (isIdleReportWhileJobFinishing(store, text)) {
        transport.receivedTextObserver = undefined;
        store.dispatch(new MachineStopRequested());
      }
    };
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(JOB_END_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
  });

  it.each([
    [JOB_RUN_STATUS.SENDING, MANY_MOVES_COUNT],
    [JOB_RUN_STATUS.FINISHING, 1],
  ])('ends the run at the time limit when the reset byte of a stop stalls while %s', async (
    statusAtStop: JobRunStatus,
    moveCount: number,
  ) => {
    const transport: ControlledLaserTransport = new ControlledLaserTransport();
    const store: AppStore = await prepareConnectedStore([], {}, undefined, transport);

    replaceToolpathWithMoves(store, moveCount);
    transport.holdResetWrite();
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(statusAtStop);

    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(GRBL_STOP_FINISH_MAX_WAIT_MS - 1);
    expect(selectIsJobRunActive(store.getState())).toBe(true);

    await vi.advanceTimersByTimeAsync(1);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsJobRunActive(store.getState())).toBe(false);
    transport.releaseResetWrite();
  });

  it('reports interrupted when the machine goes Idle after a reset during finishing', async () => {
    const store: AppStore = await prepareConnectedStore();

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new JobPauseRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.FINISHING);

    store.dispatch(new MachineResetRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectMachineStatus(store.getState())?.machineState).toBe(GRBL_MACHINE_STATE.IDLE);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
  });

  it('ends the run at a reset without waiting for its byte to be written', async () => {
    const transport: ControlledLaserTransport = new ControlledLaserTransport();
    const store: AppStore = await prepareConnectedStore([], {}, undefined, transport);

    replaceToolpathWithMoves(store, MANY_MOVES_COUNT);
    transport.holdResetWrite();
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new MachineResetRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsJobRunActive(store.getState())).toBe(false);
    transport.releaseResetWrite();
  });

  it('ends the run at a controller reset, for which no stop ending comes', async () => {
    const transport: ControlledLaserTransport = new ControlledLaserTransport();
    const store: AppStore = await prepareConnectedStore([], {}, undefined, transport);

    replaceToolpathWithMoves(store, MANY_MOVES_COUNT);
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.SELF_RESET });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsJobRunActive(store.getState())).toBe(false);
  });

  it('reports the answered lines, and pauses and resumes the job', async () => {
    const store: AppStore = await prepareConnectedStore();

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(selectJobRunTotalLineCount(store.getState())).toBeGreaterThan(0);
    expect(selectJobRunAnsweredLineCount(store.getState())).toBe(selectJobRunTotalLineCount(store.getState()));
    expect(selectJobPauseControl(store.getState())).toBe(JOB_PAUSE_CONTROL.PAUSE);

    store.dispatch(new JobPauseRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    expect(selectJobPauseControl(store.getState())).toBe(JOB_PAUSE_CONTROL.RESUME);
    await vi.advanceTimersByTimeAsync(JOB_END_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.FINISHING);

    store.dispatch(new JobResumeRequested());
    await vi.advanceTimersByTimeAsync(JOB_END_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.COMPLETED);
    expect(selectJobPauseControl(store.getState())).toBe(JOB_PAUSE_CONTROL.HIDDEN);
  });

  it('refuses to pause without laser mode, as the beam could stay on', async () => {
    const store: AppStore = await prepareConnectedStore([], {}, newLaserModeOffSimulator());

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(selectJobPauseControl(store.getState())).toBe(JOB_PAUSE_CONTROL.PAUSE_BLOCKED);

    store.dispatch(new JobPauseRequested());
    await vi.advanceTimersByTimeAsync(JOB_END_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.COMPLETED);
  });

  it.each(LASER_MODE_CHANGING_LINES)(
    'refuses to pause after the console sent %s, until a reconnect',
    async (line: string) => {
      const store: AppStore = await prepareConnectedStore();

      store.dispatch(new ConsoleCommandSubmitted({ commandText: line }));
      await vi.advanceTimersByTimeAsync(SETTLE_MS);
      store.dispatch(new JobStartRequested());
      await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

      expect(selectJobPauseControl(store.getState())).toBe(JOB_PAUSE_CONTROL.PAUSE_BLOCKED);
    },
  );

  it('marks the run interrupted when the connection ends during it', async () => {
    const store: AppStore = await prepareConnectedStore();

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new DisconnectRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
  });

  it('starts nothing while toolpath warnings block the start', async () => {
    const store: AppStore = await prepareConnectedStore([OFF_PAGE_WARNING]);

    expect(selectJobStartBlockedReasonKey(store.getState())).toBe(DEFAULT.JOB_START_BLOCKED_WARNINGS);
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.IDLE);
  });

  it('keeps console lines out of a running job', async () => {
    const store: AppStore = await prepareConnectedStore();

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new ConsoleCommandSubmitted({ commandText: CONSOLE_LINE }));
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    const entryTexts: string[] = selectConsoleEntries(store.getState()).map(
      (entry: GrblConsoleViewEntry) => JSON.stringify(entry),
    );

    expect(entryTexts.some((entryText: string) => entryText.includes(CONSOLE_LINE))).toBe(false);
    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
  });

  it('keeps machine control lines out of a running job', async () => {
    const store: AppStore = await prepareConnectedStore();

    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new MachineLineRequested({ line: MACHINE_LINE }));
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    const entryTexts: string[] = selectConsoleEntries(store.getState()).map(
      (entry: GrblConsoleViewEntry) => JSON.stringify(entry),
    );

    expect(entryTexts.some((entryText: string) => entryText.includes(MACHINE_LINE))).toBe(false);
    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
  });

  it('shows air assist off after a finished job whose program switched it off', async () => {
    const store: AppStore = await prepareConnectedStore([], { airAssist: true });

    store.dispatch(new MachineAirAssistChanged({ isAirAssistOn: true }));
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(JOB_END_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.COMPLETED);
    expect(selectIsAirAssistOn(store.getState())).toBe(false);
  });

  it('leaves air assist on after a finished job whose program never touched it', async () => {
    const store: AppStore = await prepareConnectedStore([], { airAssist: false });

    store.dispatch(new MachineAirAssistChanged({ isAirAssistOn: true }));
    store.dispatch(new JobStartRequested());
    await vi.advanceTimersByTimeAsync(JOB_END_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.COMPLETED);
    expect(selectIsAirAssistOn(store.getState())).toBe(true);
  });
});
