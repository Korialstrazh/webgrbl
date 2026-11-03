import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GRBL_HOLD_COMPLETE_MAX_WAIT_MS, GRBL_STATUS_POLL_INTERVAL_MS, SIMULATED_LASER_PORT_ID } from '../grbl/grbl.constants';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { ANSWER_SETTLE_MS } from '../grbl/test.support/grbl.answer.settle';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../toolpath/interfaces/ObjectWarning';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { ConnectRequested, DisconnectRequested, SerialPortSelected } from './grbl.connection.state';
import { ConsoleCommandSubmitted, selectConsoleEntries } from './grbl.console.state';
import type { GrblConsoleViewEntry } from './interfaces/GrblConsoleViewEntry';
import { runGrblJob } from './job.run.saga';
import { JobStartRequested, selectIsJobRunActive, selectJobRunStatus } from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import { MachineStopRequested } from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';

/** 100 mm at the test move's speed outlasts the time the running checks wait. */
const LONG_MOVE_END_X_MM = 100;
const SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const JOB_END_MS = 10_000;
const CONSOLE_LINE = 'G0X1';
const OFF_PAGE_WARNING: ObjectWarning = { objectId: 'object', kind: SVG_UNSUPPORTED_KIND.OFF_PAGE };

const newJobStore = (): AppStore => newStore(
  {
    newTransport: () => new SimulatedLaserTransport(),
    requestSerialPort: async () => undefined,
    getGrantedSerialPorts: async () => [],
    storage: { getStoredConnectionPreferences: () => undefined, storeConnectionPreferences: () => undefined },
  },
  new FakeToolpathWorkerClient(),
);

const prepareConnectedStore = async (warnings: ObjectWarning[] = []): Promise<AppStore> => {
  const store: AppStore = newJobStore();
  const profile: MachineProfile = newMachineProfile();

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
  store.dispatch(new ConnectRequested());
  await vi.advanceTimersByTimeAsync(SETTLE_MS);
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({
      moves: [newToolpathMove({ to: { x: LONG_MOVE_END_X_MM, y: 0 } })],
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
});
