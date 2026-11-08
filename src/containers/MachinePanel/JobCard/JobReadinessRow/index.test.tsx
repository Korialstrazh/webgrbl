import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { JobReadinessRow } from '.';
import { GRBL_CONNECTION_STATUS } from '../../../../utils/grbl/grbl.constants';
import type { Material } from '../../../../utils/materials/interfaces/Material';
import { newMaterial } from '../../../../utils/materials/new.material';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../../../utils/profiles/new.machine.profile';
import { newProjectObject } from '../../../../utils/project/new.project.object';
import { ConnectionStatusChanged, selectConnectionStatus } from '../../../../utils/states/grbl.connection.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../../../utils/states/machine.profile.state';
import { MaterialSaved } from '../../../../utils/states/material.state';
import { newStore } from '../../../../utils/states/new.store';
import type { AppStore } from '../../../../utils/states/new.store';
import { ProjectMaterialSelected, ProjectObjectsAdded } from '../../../../utils/states/project.document.state';
import { selectIsConnectionPopoverOpen } from '../../../../utils/states/ui.overlay.state';
import { selectIsMachineProfilesDialogOpen, selectNarrowRegion } from '../../../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../../../utils/states/workbench.region.constants';
import { AntdTestProvider } from '../../../../utils/test.support/antd.test.provider';
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

const CONNECT_ACTION = 'Connect laser';
const FILE_INPUT_SELECTOR = 'input[type="file"]';
const IMPORT_SVG_LABEL = 'Import SVG';
const PRIMARY_BUTTON_SELECTOR = '.ant-btn-primary';
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

describe(JobReadinessRow.name, () => {
  it('makes the steps one tab stop, on the current step, and moves between them with the arrow keys', () => {
    renderRow();

    const profileStep: HTMLElement = screen.getByRole('button', { name: PROFILE_OPEN });
    const connectStep: HTMLElement = screen.getByRole('button', { name: CONNECT_OPEN });
    const materialStep: HTMLElement = screen.getByRole('button', { name: MATERIAL_OPEN });

    expect(profileStep).toHaveAttribute('tabindex', '0');
    expect(connectStep).toHaveAttribute('tabindex', '-1');

    act(() => profileStep.focus());
    fireEvent.keyDown(profileStep, { key: 'ArrowLeft' });

    expect(connectStep).toHaveFocus();
    expect(connectStep).toHaveAttribute('tabindex', '0');
    expect(profileStep).toHaveAttribute('tabindex', '-1');

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
  });

  it('offers one action for the current step, which opens the place the step opens', () => {
    const store: AppStore = renderRow();

    fireEvent.click(screen.getByRole('button', { name: 'Set up laser' }));

    expect(selectIsMachineProfilesDialogOpen(store.getState())).toBe(true);
  });

  it('only opens the connection popover from the Connect action, with no connection started', () => {
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

  it('captions the open Material step as optional on screen', () => {
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

  it('opens the Import SVG file picker from the next-step button on an empty bed in a narrow layout', () => {
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

  it('leaves Import SVG to the empty bed card beside it in a wide layout', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    installMatchMediaMock();
    setMatchMediaMatches(true);
    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    render(<Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);

    expect(screen.queryByRole('button', { name: IMPORT_SVG_LABEL })).not.toBeInTheDocument();
    resetMatchMediaMock();
  });
});
