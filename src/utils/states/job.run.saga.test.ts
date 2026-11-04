import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GRBL_HOLD_COMPLETE_MAX_WAIT_MS, GRBL_STATUS_POLL_INTERVAL_MS, SIMULATED_LASER_PORT_ID } from '../grbl/grbl.constants';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { GrblSimulator } from '../grbl/simulator/grbl.simulator';
import { ANSWER_SETTLE_MS } from '../grbl/test.support/grbl.answer.settle';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../toolpath/interfaces/ObjectWarning';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { ConnectRequested, DisconnectRequested, SerialPortSelected } from './grbl.connection.state';
import { ConsoleCommandSubmitted, selectConsoleEntries } from './grbl.console.state';
import type { GrblConsoleViewEntry } from './interfaces/GrblConsoleViewEntry';
import { runGrblJob } from './job.run.saga';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import { selectJobPauseControl } from './job.pause.control.selector';
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
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import {
  MachineAirAssistChanged,
  MachineLineRequested,
  MachineStopRequested,
  selectIsAirAssistOn,
} from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';

/** 100 mm at the test move's speed outlasts the time the running checks wait. */
const LONG_MOVE_END_X_MM = 100;
const SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const JOB_END_MS = 10_000;
const LASER_MODE_OFF_LINE = '$32=0\n';
const CONSOLE_LINE = 'G0X1';
const MACHINE_LINE = 'G0X2';
const OFF_PAGE_WARNING: ObjectWarning = { objectId: 'object', kind: SVG_UNSUPPORTED_KIND.OFF_PAGE };

/** A simulated laser with laser mode off; settings survive power cycles. */
const newLaserModeOffSimulator = (): GrblSimulator => {
  const simulator: GrblSimulator = new GrblSimulator(() => undefined);

  simulator.powerOn();
  simulator.receiveBytes(new TextEncoder().encode(LASER_MODE_OFF_LINE));
  simulator.powerOff();

  return simulator;
};

const newJobStore = (simulator?: GrblSimulator): AppStore => newStore(
  {
    newTransport: () => new SimulatedLaserTransport(simulator),
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
): Promise<AppStore> => {
  const store: AppStore = newJobStore(simulator);
  const profile: MachineProfile = newMachineProfile({ hasAirAssist: true });

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
  store.dispatch(new ConnectRequested());
  await vi.advanceTimersByTimeAsync(SETTLE_MS);
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({
      moves: [newToolpathMove({ to: { x: LONG_MOVE_END_X_MM, y: 0 }, ...moveOverrides })],
      warnings,
    }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store;
};

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
