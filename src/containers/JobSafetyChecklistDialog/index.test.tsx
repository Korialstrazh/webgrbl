import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { JobSafetyChecklistDialog } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import type { JobStartRequest } from '../../utils/states/interfaces/JobStartRequest';
import { JobStartRequested } from '../../utils/states/job.run.state';
import {
  JobSafetyChecklistClosed,
  JobSafetyChecklistOpened,
  selectJobSafetyChecklistRequest,
} from '../../utils/states/job.safety.checklist.state';
import { JOB_START_REQUEST_KIND } from '../../utils/states/job.start.request.constants';
import { MachineStatusReceived } from '../../utils/states/machine.status.state';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { newGcodeExportTestStore } from '../../utils/test.support/new.gcode.export.test.store';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../utils/toolpath/test.support/new.toolpath.move';

const FULL_REQUEST: JobStartRequest = { kind: JOB_START_REQUEST_KIND.FULL };
const DIALOG_TITLE = 'The laser is about to fire';
const START_LABEL = 'Start job';
const CANCEL_LABEL = 'Cancel';
const CONFIRM_LABEL = 'I have done all of the above';
const REMINDER_TITLES: readonly string[] = [
  'Everyone in the room wears laser goggles',
  'Ventilation is on, and the material is safe to burn',
  'Nothing flammable near the bed, extinguisher in reach',
  'I will stay with the machine the whole time',
];
const REMINDER_HINTS: readonly string[] = [
  'Rated for your laser wavelength (for diode lasers: 445 nm). Never look at the beam or its reflections.',
  'Never burn PVC, vinyl or faux leather: they release chlorine gas.',
  'Remove paper, offcuts and dust around the work area.',
  'Fire is the most common laser accident. Never leave a job running.',
];
const REMINDER_KIND_ATTRIBUTE = '[data-reminder-kind]';

const newMachineStatusReceived = (machineState: GrblResolvedStatus['machineState']): MachineStatusReceived =>
  new MachineStatusReceived({
    status: {
      machineState,
      machineSubstate: undefined,
      machinePosition: { x: 0, y: 0, z: 0 },
      workPosition: { x: 0, y: 0, z: 0 },
      workCoordinateOffset: undefined,
      plannerBlocksAvailable: undefined,
      rxBytesAvailable: undefined,
      feedRate: 0,
      spindleSpeed: 0,
      overrides: undefined,
    },
  });

const newStartableJobStore = async (): Promise<AppStore> => {
  const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient: new FakeToolpathWorkerClient(true) });

  store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  store.dispatch(newMachineStatusReceived(GRBL_MACHINE_STATE.IDLE));
  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({ moves: [newToolpathMove()] }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store;
};

const renderOpenDialog = async (givenStore?: AppStore): Promise<AppStore> => {
  const store: AppStore = givenStore ?? await newStartableJobStore();

  render(
    <Provider store={store}>
      <AntdTestProvider>
        <JobSafetyChecklistDialog />
      </AntdTestProvider>
    </Provider>,
  );
  act(() => {
    store.dispatch(new JobSafetyChecklistOpened(FULL_REQUEST));
  });
  await screen.findByRole('dialog', { name: DIALOG_TITLE });

  return store;
};

const getStartButton = (): HTMLElement => screen.getByRole('button', { name: START_LABEL });

describe(JobSafetyChecklistDialog.name, () => {
  it('stays closed while no start is requested', async () => {
    render(
      <Provider store={await newStartableJobStore()}>
        <AntdTestProvider>
          <JobSafetyChecklistDialog />
        </AntdTestProvider>
      </Provider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the four reminders with their hints, each with a picture, and the job facts', async () => {
    await renderOpenDialog();

    for (const reminderText of [...REMINDER_TITLES, ...REMINDER_HINTS]) {
      expect(screen.getByText(reminderText)).toBeInTheDocument();
    }

    expect(document.querySelectorAll(REMINDER_KIND_ATTRIBUTE)).toHaveLength(REMINDER_TITLES.length);
    expect(screen.getByText(/^Job: .+ · 1 layer/)).toBeInTheDocument();
  });

  it('keeps Start off until the one checkbox is ticked', async () => {
    await renderOpenDialog();

    expect(getStartButton()).toBeDisabled();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);

    fireEvent.click(screen.getByRole('checkbox', { name: CONFIRM_LABEL }));

    expect(getStartButton()).toBeEnabled();
  });

  it('starts the same request and closes after the tick and Start', async () => {
    const store: AppStore = await newStartableJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    await renderOpenDialog(store);
    fireEvent.click(screen.getByRole('checkbox', { name: CONFIRM_LABEL }));
    fireEvent.click(getStartButton());

    expect(dispatchSpy).toHaveBeenCalledWith(new JobStartRequested(FULL_REQUEST));
    expect(selectJobSafetyChecklistRequest(store.getState())).toBeUndefined();
  });

  it('registers as an overlay while open, so Escape closes it without starting', async () => {
    const store: AppStore = await newStartableJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    await renderOpenDialog(store);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape', keyCode: 27 });

    expect(selectJobSafetyChecklistRequest(store.getState())).toBeUndefined();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(JobStartRequested));
  });

  it('closes without starting on Cancel', async () => {
    const store: AppStore = await newStartableJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    await renderOpenDialog(store);
    fireEvent.click(screen.getByRole('button', { name: CANCEL_LABEL }));

    expect(selectJobSafetyChecklistRequest(store.getState())).toBeUndefined();
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(JobStartRequested));
  });

  it('asks for the tick again each time it opens', async () => {
    const store: AppStore = await renderOpenDialog();

    fireEvent.click(screen.getByRole('checkbox', { name: CONFIRM_LABEL }));
    act(() => {
      store.dispatch(new JobSafetyChecklistClosed());
    });
    await vi.waitFor((): void => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    act(() => {
      store.dispatch(new JobSafetyChecklistOpened(FULL_REQUEST));
    });
    await screen.findByRole('dialog', { name: DIALOG_TITLE });

    expect(screen.getByRole('checkbox', { name: CONFIRM_LABEL })).not.toBeChecked();
    expect(getStartButton()).toBeDisabled();
  });

  it('closes when the start gets blocked while it is open', async () => {
    const store: AppStore = await renderOpenDialog();

    act(() => {
      store.dispatch(newMachineStatusReceived(GRBL_MACHINE_STATE.RUN));
    });

    expect(selectJobSafetyChecklistRequest(store.getState())).toBeUndefined();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  describe('battery hint', () => {
    const BATTERY_HINT = 'The laptop runs on battery. Plug it in so a long job is not cut short.';

    afterEach(() => {
      Reflect.deleteProperty(navigator, 'getBattery');
    });

    it('shows the hint when the device is not charging', async () => {
      Object.defineProperty(navigator, 'getBattery', {
        value: () => Promise.resolve({ charging: false }),
        configurable: true,
      });

      await renderOpenDialog();

      expect(await screen.findByText(BATTERY_HINT)).toBeInTheDocument();
    });

    it('shows no hint when the device is charging', async () => {
      Object.defineProperty(navigator, 'getBattery', {
        value: () => Promise.resolve({ charging: true }),
        configurable: true,
      });

      await renderOpenDialog();
      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.queryByText(BATTERY_HINT)).not.toBeInTheDocument();
    });

    it('shows no stale hint on a reopening while the battery is being checked again', async () => {
      let isCharging = false;
      let resolveSecondCheck: (battery: { charging: boolean }) => void = () => undefined;

      Object.defineProperty(navigator, 'getBattery', {
        value: () => isCharging
          ? new Promise((resolve: (battery: { charging: boolean }) => void): void => {
            resolveSecondCheck = resolve;
          })
          : Promise.resolve({ charging: false }),
        configurable: true,
      });

      const store: AppStore = await renderOpenDialog();

      expect(await screen.findByText(BATTERY_HINT)).toBeInTheDocument();

      act(() => {
        store.dispatch(new JobSafetyChecklistClosed());
      });
      isCharging = true;
      act(() => {
        store.dispatch(new JobSafetyChecklistOpened(FULL_REQUEST));
      });
      await screen.findByRole('dialog', { name: DIALOG_TITLE });

      expect(screen.queryByText(BATTERY_HINT)).not.toBeInTheDocument();

      await act(async () => {
        resolveSecondCheck({ charging: true });
        await Promise.resolve();
      });

      expect(screen.queryByText(BATTERY_HINT)).not.toBeInTheDocument();
    });

    it('shows no hint without the Battery API', async () => {
      await renderOpenDialog();

      expect(screen.queryByText(BATTERY_HINT)).not.toBeInTheDocument();
    });
  });
});
