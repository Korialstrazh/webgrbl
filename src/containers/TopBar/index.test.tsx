import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { TopBar } from '.';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { newProjectObject } from '../../utils/project/new.project.object';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import {
  ProjectObjectsAdded,
  selectCanRedo,
  selectProjectObjects,
  SvgFilesImportRequested,
} from '../../utils/states/project.document.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { HistoryHotkeys } from '../HistoryHotkeys';
import { StopHotkey } from '../StopHotkey';

const COMING_SOON_CONTROL_LABELS: readonly string[] = [
  'Project',
  'Materials',
];
const UNDO_LABEL = 'Undo';
const REDO_LABEL = 'Redo';
const IMPORT_SVG_LABEL = 'Import SVG';
const PICKED_FILE_NAME = 'star.svg';
const SVG_FILE_TYPE = 'image/svg+xml';
const SVG_INPUT_SELECTOR = 'input[type="file"]';
const APP_TITLE = 'webgrbl';
const AUTOSAVE_TEXT = 'Autosave: off';
const DISCONNECTED_PATTERN = /Disconnected/;
const FIXED_HEIGHT_CLASS_NAME = 'fixedHeightBar';
const MACHINE_PROFILES_LABEL = 'Machine profiles';

const renderWorkbenchTopBar = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <TopBar />
          <StopHotkey />
          <HistoryHotkeys />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

describe(TopBar.name, () => {
  it('shows the app name, the autosave readout and the connection pill', () => {
    render(
      <Provider store={newStore()}>
        <TopBar />
      </Provider>,
    );

    expect(screen.getByRole('heading', { name: APP_TITLE })).toBeInTheDocument();
    expect(screen.getByText(AUTOSAVE_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: DISCONNECTED_PATTERN })).toBeInTheDocument();
  });

  it.each(COMING_SOON_CONTROL_LABELS)('clicking the coming-soon control %s dispatches nothing', (label: string) => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <TopBar />
      </Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: label, hidden: true }));

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('keeps a fixed height on one row', () => {
    render(
      <Provider store={newStore()}>
        <TopBar />
      </Provider>,
    );

    expect(screen.getByRole('banner').className).toContain(FIXED_HEIGHT_CLASS_NAME);
  });

  it('opens the machine profiles dialog as a registered overlay', () => {
    const store: AppStore = newStore();

    renderWorkbenchTopBar(store);
    fireEvent.click(screen.getByRole('button', { name: MACHINE_PROFILES_LABEL }));

    expect(screen.getByRole('dialog', { name: MACHINE_PROFILES_LABEL })).toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
  });

  it('closes the machine profiles dialog on Escape without stopping the machine', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWorkbenchTopBar(store);
    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });
    fireEvent.click(screen.getByRole('button', { name: MACHINE_PROFILES_LABEL }));
    fireEvent.keyDown(screen.getByRole('dialog', { name: MACHINE_PROFILES_LABEL }), { key: ESCAPE_KEY });

    expect(screen.queryByRole('dialog', { name: MACHINE_PROFILES_LABEL })).not.toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
    expect(dispatchSpy.mock.calls.filter(([action]) => action instanceof MachineStopRequested)).toEqual([]);
  });

  it('dispatches an SVG import request with the picked files and resets the picker', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const pickedFile: File = new File(['<svg/>'], PICKED_FILE_NAME, { type: SVG_FILE_TYPE });

    renderWorkbenchTopBar(store);

    const input: HTMLInputElement | null = document.querySelector(SVG_INPUT_SELECTOR);

    expect(screen.getByRole('button', { name: IMPORT_SVG_LABEL })).toBeEnabled();
    expect(input).toHaveAttribute('accept', '.svg,image/svg+xml');
    expect(input).toHaveAttribute('multiple');

    if (!input) {
      throw new Error('The file input is missing.');
    }

    fireEvent.change(input, { target: { files: [pickedFile] } });

    const importCalls = dispatchSpy.mock.calls.filter(([action]) => action instanceof SvgFilesImportRequested);

    expect(importCalls).toHaveLength(1);
    expect(importCalls[0]?.[0]).toMatchObject({ payload: { files: [pickedFile] } });
    expect(input.value).toBe('');
  });

  it('disables undo and redo at the start, enables undo after a change and undoes it', () => {
    const store: AppStore = newStore();

    renderWorkbenchTopBar(store);

    expect(screen.getByRole('button', { name: UNDO_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: REDO_LABEL })).toBeDisabled();

    act(() => {
      store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()] }));
    });

    expect(screen.getByRole('button', { name: UNDO_LABEL })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: UNDO_LABEL }));

    expect(selectProjectObjects(store.getState())).toEqual([]);
    expect(screen.getByRole('button', { name: REDO_LABEL })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: REDO_LABEL }));

    expect(selectProjectObjects(store.getState())).toHaveLength(1);
    expect(selectCanRedo(store.getState())).toBe(false);
  });

  it('does not undo with Ctrl+Z while the machine profiles dialog is open', () => {
    const store: AppStore = newStore();

    renderWorkbenchTopBar(store);
    act(() => {
      store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()] }));
    });
    fireEvent.click(screen.getByRole('button', { name: MACHINE_PROFILES_LABEL }));
    fireEvent.keyDown(screen.getByRole('dialog', { name: MACHINE_PROFILES_LABEL }), { key: 'z', ctrlKey: true });

    expect(selectProjectObjects(store.getState())).toHaveLength(1);
  });
});
