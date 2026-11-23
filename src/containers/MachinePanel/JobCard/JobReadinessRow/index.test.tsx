import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { JobReadinessRow } from '.';
import { BED_OBJECTS_LAYER_ID } from '../../../BedObjects/bed.objects.constants';
import { BED_VIEW_MODE } from '../../../../utils/bed/bed.view.constants';
import { GRBL_CONNECTION_STATUS, SIMULATED_LASER_PORT_ID } from '../../../../utils/grbl/grbl.constants';
import { ANSWER_SETTLE_MS } from '../../../../utils/grbl/test.support/grbl.answer.settle';
import type { Material } from '../../../../utils/materials/interfaces/Material';
import { newMaterial } from '../../../../utils/materials/new.material';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../../../utils/profiles/new.machine.profile';
import { newProjectObject } from '../../../../utils/project/new.project.object';
import { selectBedViewMode } from '../../../../utils/states/bed.view.state';
import { ConnectionStatusChanged, selectConnectionStatus, SerialPortSelected } from '../../../../utils/states/grbl.connection.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../../../utils/states/machine.profile.state';
import { MaterialSaved } from '../../../../utils/states/material.state';
import { newStore } from '../../../../utils/states/new.store';
import type { AppStore } from '../../../../utils/states/new.store';
import { ProjectMaterialSelected, ProjectObjectsAdded } from '../../../../utils/states/project.document.state';
import { selectToolpathDocumentVersion, ToolpathReady } from '../../../../utils/states/toolpath.state';
import { selectIsConnectionPopoverOpen } from '../../../../utils/states/ui.overlay.state';
import { selectIsMachineProfilesDialogOpen, selectNarrowRegion } from '../../../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../../../utils/states/workbench.region.constants';
import { SVG_UNSUPPORTED_KIND } from '../../../../utils/svg/geometry/svg.shape.constants';
import { AntdTestProvider } from '../../../../utils/test.support/antd.test.provider';
import type { ObjectWarning } from '../../../../utils/toolpath/interfaces/ObjectWarning';
import { newToolpath } from '../../../../utils/toolpath/test.support/new.toolpath';
import {
  installMatchMediaMock,
  resetMatchMediaMock,
  setMatchMediaMatches,
} from '../../../../utils/test.support/match.media.mock';

const CURRENT_STEP_SELECTOR = '[aria-current="step"]';
const PROFILE_OPEN = 'Profile: to do';
const CONNECT_OPEN = 'Connect: to do';
const CONNECT_MET = 'Connect: done';
const MATERIAL_OPEN = 'Material: optional';
const OPTIONAL_CAPTION = 'optional';

const CHECK_OPEN = 'Check: to do';
const FIX_WARNINGS_ACTION = 'Fix warnings (2)';
const TEXT_WARNING: ObjectWarning = { objectId: 'object', kind: SVG_UNSUPPORTED_KIND.TEXT };
const OFF_PAGE_WARNING: ObjectWarning = { objectId: 'object', kind: SVG_UNSUPPORTED_KIND.OFF_PAGE };

const CONNECT_ACTION = 'Connect';
const FILE_INPUT_SELECTOR = 'input[type="file"]';
const IMPORT_SVG_LABEL = 'Import SVG';
const PRIMARY_BUTTON_SELECTOR = '.ant-btn-primary';
const PRIMARY_BUTTON_CLASS = 'ant-btn-primary';
const PLUG_ICON_SELECTOR = '.anticon-api';
const MATERIAL_THICKNESS_MM = 3;

/** Profile, design and material are done, so Connect is the current step. */
const newSetUpStore = (): AppStore => {
  const store: AppStore = newStore();
  const profile: MachineProfile = newMachineProfile();
  const material: Material = newMaterial({ name: 'Oak', thicknessMm: MATERIAL_THICKNESS_MM });

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
  store.dispatch(new MaterialSaved({ material }));
  store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));

  return store;
};

const renderRow = (): AppStore => {
  const store: AppStore = newStore();

  render(<Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);

  return store;
};

const renderStoreAtConnectStep = (): void => {
  render(<Provider store={newSetUpStore()}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);
};

describe(JobReadinessRow.name, () => {
  it('makes every step with an action a tab stop and moves between them with the arrow keys', () => {
    renderRow();

    const profileStep: HTMLElement = screen.getByRole('button', { name: PROFILE_OPEN });
    const connectStep: HTMLElement = screen.getByRole('button', { name: CONNECT_OPEN });
    const materialStep: HTMLElement = screen.getByRole('button', { name: MATERIAL_OPEN });

    expect(profileStep).toHaveAttribute('tabindex', '0');
    expect(connectStep).toHaveAttribute('tabindex', '0');
    expect(materialStep).toHaveAttribute('tabindex', '0');

    act(() => profileStep.focus());
    fireEvent.keyDown(profileStep, { key: 'ArrowLeft' });

    expect(connectStep).toHaveFocus();

    fireEvent.keyDown(connectStep, { key: 'Home' });
    fireEvent.keyDown(profileStep, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement ?? profileStep, { key: 'ArrowRight' });

    expect(materialStep).toHaveFocus();
  });

  it('marks only the first open step as the current one', () => {
    renderRow();

    const currentSteps: NodeListOf<Element> = document.querySelectorAll(CURRENT_STEP_SELECTOR);

    expect(currentSteps).toHaveLength(1);
    expect(currentSteps[0]).toBe(screen.getByRole('button', { name: PROFILE_OPEN }));
  });

  it('ticks Connect live from the connection state', () => {
    const store: AppStore = renderRow();

    expect(screen.getByRole('button', { name: CONNECT_OPEN })).toBeInTheDocument();

    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });

    expect(screen.getByRole('button', { name: CONNECT_MET })).toBeInTheDocument();
    // Done, Connect has nothing left to open: it leaves the tab order and says so.
    expect(screen.getByRole('button', { name: CONNECT_MET })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: CONNECT_MET })).toHaveAttribute('aria-disabled', 'true');
  });

  it('offers one action for the current step, which opens the place the step opens', () => {
    const store: AppStore = renderRow();

    fireEvent.click(screen.getByRole('button', { name: 'Set up laser' }));

    expect(selectIsMachineProfilesDialogOpen(store.getState())).toBe(true);
  });

  it('connects in one click from the Connect action once a port is chosen, with no popover', async () => {
    vi.useFakeTimers();
    const store: AppStore = newSetUpStore();

    store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
    render(<Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);
    fireEvent.click(screen.getByRole('button', { name: CONNECT_ACTION }));

    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(false);
    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.CONNECTING);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    });

    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.CONNECTED);
    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(false);
    vi.useRealTimers();
  });

  it('draws the Connect action as an outlined button, leaving the header Connect the one primary', () => {
    renderStoreAtConnectStep();

    const connectAction: HTMLElement = screen.getByRole('button', { name: CONNECT_ACTION });

    expect(connectAction).not.toHaveClass(PRIMARY_BUTTON_CLASS);
    expect(connectAction.querySelector(PLUG_ICON_SELECTOR)).toBeInTheDocument();
  });

  it('only opens the connection popover from the Connect action without a chosen port, starting nothing', () => {
    const store: AppStore = newSetUpStore();

    render(<Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);
    fireEvent.click(screen.getByRole('button', { name: CONNECT_ACTION }));

    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);
    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.DISCONNECTED);
  });

  it('shows no action once every step is done', () => {
    const store: AppStore = newSetUpStore();

    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    render(<Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);

    expect(screen.queryByRole('button', { name: CONNECT_ACTION })).not.toBeInTheDocument();
    expect(document.querySelector(PRIMARY_BUTTON_SELECTOR)).toBeNull();
  });

  it('keeps Check open and offers Fix warnings, which opens the Toolpath view, while warnings lock Start', () => {
    const store: AppStore = newSetUpStore();

    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    store.dispatch(new ToolpathReady({
      toolpath: newToolpath({ warnings: [TEXT_WARNING, OFF_PAGE_WARNING] }),
      documentVersion: selectToolpathDocumentVersion(store.getState()),
    }));
    render(<Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);

    expect(screen.getByRole('button', { name: CHECK_OPEN })).toHaveAttribute('aria-current', 'step');
    fireEvent.click(screen.getByRole('button', { name: FIX_WARNINGS_ACTION }));

    expect(selectBedViewMode(store.getState())).toBe(BED_VIEW_MODE.TOOLPATH);
    expect(selectNarrowRegion(store.getState())).toBe(WORKBENCH_REGION.BED);
  });

  it('marks the open Material step as optional with a badge on its marker', () => {
    renderRow();

    expect(within(screen.getByRole('button', { name: MATERIAL_OPEN })).getByText(OPTIONAL_CAPTION)).toBeInTheDocument();
  });

  it('shows no optional caption once the material is chosen', () => {
    render(<Provider store={newSetUpStore()}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);

    expect(screen.queryByText(OPTIONAL_CAPTION)).not.toBeInTheDocument();
  });

  it('goes to where each step is set', () => {
    const store: AppStore = renderRow();

    fireEvent.click(screen.getByRole('button', { name: PROFILE_OPEN }));
    fireEvent.click(screen.getByRole('button', { name: CONNECT_OPEN }));
    fireEvent.click(screen.getByRole('button', { name: MATERIAL_OPEN }));

    expect(selectIsMachineProfilesDialogOpen(store.getState())).toBe(true);
    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);
    expect(selectNarrowRegion(store.getState())).toBe(WORKBENCH_REGION.DESIGN);
  });

  it('opens the Import SVG file picker from the next-step button on an empty bed', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    const { container } = render(
      <Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>,
    );
    const fileInput: HTMLInputElement | null = container.querySelector(FILE_INPUT_SELECTOR);
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole('button', { name: IMPORT_SVG_LABEL }));

    expect(fileInput).toBeInTheDocument();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy.mock.contexts[0]).toBe(fileInput);
    clickSpy.mockRestore();
  });

  it('shows Import SVG as the accent next step on an empty project in a wide layout too', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    installMatchMediaMock();
    setMatchMediaMatches(true);
    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    render(<Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);

    expect(screen.getByRole('button', { name: IMPORT_SVG_LABEL })).toHaveClass('ant-btn-primary');
    resetMatchMediaMock();
  });

  it('moves the focus from the next-step button to the bed objects once the import adds artwork', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <div id={BED_OBJECTS_LAYER_ID} tabIndex={-1} data-testid={BED_OBJECTS_LAYER_ID} />
          <JobReadinessRow />
        </AntdTestProvider>
      </Provider>,
    );
    act(() => screen.getByRole('button', { name: IMPORT_SVG_LABEL }).focus());
    act(() => {
      store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
    });

    expect(screen.getByTestId(BED_OBJECTS_LAYER_ID)).toHaveFocus();
  });

  it('leaves the focus alone when artwork arrives while the next-step button does not hold it', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <div id={BED_OBJECTS_LAYER_ID} tabIndex={-1} data-testid={BED_OBJECTS_LAYER_ID} />
          <JobReadinessRow />
        </AntdTestProvider>
      </Provider>,
    );
    act(() => {
      store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
    });

    expect(screen.getByTestId(BED_OBJECTS_LAYER_ID)).not.toHaveFocus();
  });
});
