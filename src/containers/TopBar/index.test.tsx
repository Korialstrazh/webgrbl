import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { TopBar } from '.';
import { ENTER_KEY, ESCAPE_KEY, UNDO_KEY } from '../../utils/browser/browser.events.constants';
import * as downloadModule from '../../utils/browser/download.text.file';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { newProjectObject } from '../../utils/project/new.project.object';
import { PROJECT_FILE_MIME_TYPE } from '../../utils/project/project.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  ProjectObjectsAdded,
  selectCanRedo,
  selectProjectObjects,
  SvgFilesImportRequested,
} from '../../utils/states/project.document.state';
import { PROJECT_SAVE_STATUS } from '../../utils/states/project.save.status.constants';
import type { ProjectSaveStatus } from '../../utils/states/project.save.status.constants';
import {
  NewProjectRequested,
  ProjectFileExportRequested,
  ProjectFileImportRequested,
  ProjectOpened,
  ProjectRenameRequested,
  ProjectSaveRequested,
  ProjectSaveStatusChanged,
} from '../../utils/states/project.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { SVG_MIME_TYPE } from '../../utils/svg/svg.constants';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { getDispatchedActionCalls } from '../../utils/test.support/get.dispatched.action.calls';
import { newGcodeExportTestStore } from '../../utils/test.support/new.gcode.export.test.store';
import { GcodeExportConfirmDialog } from '../GcodeExportConfirmDialog';
import { HistoryHotkeys } from '../HistoryHotkeys';
import { PROJECT_FILE_PICKER_ACCEPT } from '../ProjectFileInput/project.file.input.constants';
import { StopHotkey } from '../StopHotkey';
import { SVG_FILE_PICKER_ACCEPT, SVG_IMPORT_INPUT_TEST_ID } from '../SvgImportButton/svg.import.button.constants';

const UNDO_LABEL = 'Undo';
const REDO_LABEL = 'Redo';
const IMPORT_SVG_LABEL = 'Import SVG';
const PICKED_FILE_NAME = 'star.svg';
const APP_TITLE = 'webgrbl';
const AUTOSAVE_TEXT = 'Saved';
const DISCONNECTED_PATTERN = /^Connection: Not connected/;
const FIXED_HEIGHT_CLASS_NAME = 'fixedHeightBar';
const MACHINE_PROFILES_LABEL = 'Laser profiles';
const ACTIVE_PROFILE_NAME = 'Garage laser';
const MATERIALS_LABEL = 'Materials';
const SOON_LABEL = 'Soon';
const PROJECT_MENU_LABEL = 'Project';
const PROJECT_ID = 'project-1';
const PROJECT_NAME = 'Coasters';
const NEW_PROJECT_NAME = 'Coasters v2';
const PROJECT_NAME_INPUT_LABEL = 'Project name';
const NEW_PROJECT_LABEL = 'New project';
const OPEN_LABEL = 'Open from this browser\u2026';
const SAVE_SHORTCUT_PATTERN = /Ctrl\+S/;
const SAVE_AS_FILE_LABEL = 'Save as file';
const OPEN_FILE_LABEL = 'Open project file\u2026';
const EXPORT_GCODE_PATTERN = /Export G-code/;
const OPEN_PROJECT_DIALOG_LABEL = 'Open project';
const PROJECT_FILE_INPUT_LABEL = 'Open a project file';
const PROJECT_FILE_NAME = 'coasters.webgrbl.json';
const SAVING_TEXT = 'Saving\u2026';
const NOT_SAVED_TEXT = 'Not saved';
const UNTITLED_PROJECT_NAME = 'Untitled project';
const ARIA_DISABLED_ATTRIBUTE = 'aria-disabled';
const ARIA_DISABLED_TRUE = 'true';
const GCODE_WARNINGS_DIALOG_LABEL = 'Export G-code with warnings?';
const CANCEL_LABEL = 'Cancel';
const TEXT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/><text x="1" y="5">Hi</text></svg>';

const openProject = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ProjectOpened({ projectId: PROJECT_ID, name: PROJECT_NAME }));
  });
};

const openProjectMenu = (): void => {
  fireEvent.click(screen.getByRole('button', { name: PROJECT_MENU_LABEL }));
};

const renderWorkbenchTopBar = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <TopBar />
          <StopHotkey />
          <HistoryHotkeys />
          <GcodeExportConfirmDialog />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

describe(TopBar.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('names the active profile on the profile button', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile({ name: ACTIVE_PROFILE_NAME });

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    renderWorkbenchTopBar(store);

    expect(screen.getByRole('button', { name: MACHINE_PROFILES_LABEL })).toHaveTextContent(ACTIVE_PROFILE_NAME);
  });

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

  it('shows no placeholder for planned features', () => {
    render(
      <Provider store={newStore()}>
        <TopBar />
      </Provider>,
    );

    expect(screen.queryByText(SOON_LABEL)).not.toBeInTheDocument();
  });

  it('has no Materials entry: the material library opens from the Material panel', () => {
    render(
      <Provider store={newStore()}>
        <TopBar />
      </Provider>,
    );

    expect(screen.queryByRole('button', { name: MATERIALS_LABEL })).not.toBeInTheDocument();
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
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderWorkbenchTopBar(store);
    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });
    fireEvent.click(screen.getByRole('button', { name: MACHINE_PROFILES_LABEL }));
    fireEvent.keyDown(screen.getByRole('dialog', { name: MACHINE_PROFILES_LABEL }), { key: ESCAPE_KEY });

    expect(screen.queryByRole('dialog', { name: MACHINE_PROFILES_LABEL })).not.toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
    const stopCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, MachineStopRequested);

    expect(stopCalls).toEqual([]);
  });

  it('dispatches an SVG import request with the picked files and resets the picker', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    const pickedFile: File = new File(['<svg/>'], PICKED_FILE_NAME, { type: SVG_MIME_TYPE });

    renderWorkbenchTopBar(store);

    const input: HTMLInputElement = screen.getByTestId<HTMLInputElement>(SVG_IMPORT_INPUT_TEST_ID);

    expect(screen.getByRole('button', { name: IMPORT_SVG_LABEL })).toBeEnabled();
    expect(input).toHaveAttribute('accept', SVG_FILE_PICKER_ACCEPT);
    expect(input).toHaveAttribute('multiple');

    fireEvent.change(input, { target: { files: [pickedFile] } });

    const importCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, SvgFilesImportRequested);

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
      store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
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
      store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
    });
    fireEvent.click(screen.getByRole('button', { name: MACHINE_PROFILES_LABEL }));
    fireEvent.keyDown(screen.getByRole('dialog', { name: MACHINE_PROFILES_LABEL }), { key: UNDO_KEY, ctrlKey: true });

    expect(selectProjectObjects(store.getState())).toHaveLength(1);
  });

  describe('project menu', () => {
    it('requests a new project from New project', () => {
      const store: AppStore = newStore();
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      renderWorkbenchTopBar(store);
      openProjectMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: NEW_PROJECT_LABEL }));

      expect(getDispatchedActionCalls(dispatchSpy, NewProjectRequested)).toHaveLength(1);
    });

    it('requests a save from Save and shows its shortcut', () => {
      const store: AppStore = newStore();
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      renderWorkbenchTopBar(store);
      openProjectMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: SAVE_SHORTCUT_PATTERN }));

      expect(getDispatchedActionCalls(dispatchSpy, ProjectSaveRequested)).toHaveLength(1);
    });

    it('requests a file export from Save as file', () => {
      const store: AppStore = newStore();
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      renderWorkbenchTopBar(store);
      openProjectMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: SAVE_AS_FILE_LABEL }));

      expect(getDispatchedActionCalls(dispatchSpy, ProjectFileExportRequested)).toHaveLength(1);
    });

    it('disables Export G-code with every layer off', async () => {
      renderWorkbenchTopBar(await newGcodeExportTestStore({ areLayersEnabled: false }));
      openProjectMenu();

      expect(screen.getByRole('menuitem', { name: EXPORT_GCODE_PATTERN })).toHaveAttribute(
        ARIA_DISABLED_ATTRIBUTE,
        ARIA_DISABLED_TRUE,
      );
    });

    it('disables Export G-code without an active machine profile', async () => {
      renderWorkbenchTopBar(await newGcodeExportTestStore({ activeProfile: undefined }));
      openProjectMenu();

      expect(screen.getByRole('menuitem', { name: EXPORT_GCODE_PATTERN })).toHaveAttribute(
        ARIA_DISABLED_ATTRIBUTE,
        ARIA_DISABLED_TRUE,
      );
    });

    it('downloads the G-code from Export G-code', async () => {
      const downloadSpy = vi.spyOn(downloadModule, 'downloadTextFile').mockImplementation(() => undefined);

      renderWorkbenchTopBar(await newGcodeExportTestStore());
      openProjectMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: EXPORT_GCODE_PATTERN }));

      await vi.waitFor((): void => {
        expect(downloadSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('asks first when the design has text, and Cancel downloads nothing', async () => {
      const downloadSpy = vi.spyOn(downloadModule, 'downloadTextFile').mockImplementation(() => undefined);

      renderWorkbenchTopBar(await newGcodeExportTestStore({
        objects: [newProjectObject({ svgText: TEXT_SVG_TEXT })],
      }));
      openProjectMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: EXPORT_GCODE_PATTERN }));
      fireEvent.click(within(await screen.findByRole('dialog', { name: GCODE_WARNINGS_DIALOG_LABEL }))
        .getByRole('button', { name: CANCEL_LABEL }));

      expect(screen.queryByRole('dialog', { name: GCODE_WARNINGS_DIALOG_LABEL })).not.toBeInTheDocument();
      expect(downloadSpy).not.toHaveBeenCalled();
    });

    it('opens the Open project dialog as a registered overlay', () => {
      const store: AppStore = newStore();

      renderWorkbenchTopBar(store);
      openProjectMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: OPEN_LABEL }));

      expect(screen.getByRole('dialog', { name: OPEN_PROJECT_DIALOG_LABEL })).toBeInTheDocument();
      expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
    });

    it('opens the file picker from Open file and sends the picked file, then resets the picker', () => {
      const store: AppStore = newStore();
      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
      const pickedFile: File = new File(['{}'], PROJECT_FILE_NAME, { type: PROJECT_FILE_MIME_TYPE });

      renderWorkbenchTopBar(store);

      const input: HTMLElement = screen.getByLabelText(PROJECT_FILE_INPUT_LABEL);
      const clickSpy: MockInstance<() => void> = vi.spyOn(HTMLInputElement.prototype, 'click');

      expect(input).toHaveAttribute('accept', PROJECT_FILE_PICKER_ACCEPT);

      openProjectMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: OPEN_FILE_LABEL }));

      expect(clickSpy).toHaveBeenCalledTimes(1);

      fireEvent.change(input, { target: { files: [pickedFile] } });

      const importCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, ProjectFileImportRequested);

      expect(importCalls).toHaveLength(1);
      expect(importCalls[0]?.[0]).toMatchObject({ payload: { file: pickedFile } });
      expect(input).toHaveValue('');
      clickSpy.mockRestore();
    });
  });

  describe('project name', () => {
    it('shows the open project name, or a placeholder before one has opened', () => {
      const store: AppStore = newStore();

      renderWorkbenchTopBar(store);

      expect(screen.getByRole('button', { name: UNTITLED_PROJECT_NAME })).toBeInTheDocument();

      openProject(store);

      expect(screen.getByRole('button', { name: PROJECT_NAME })).toBeInTheDocument();
    });

    it('renames the project on Enter with a trimmed name', () => {
      const store: AppStore = newStore();

      openProject(store);

      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      renderWorkbenchTopBar(store);
      fireEvent.click(screen.getByRole('button', { name: PROJECT_NAME }));
      fireEvent.change(screen.getByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL }), {
        target: { value: `  ${NEW_PROJECT_NAME}  ` },
      });
      fireEvent.keyDown(screen.getByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL }), { key: ENTER_KEY });

      const renameCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, ProjectRenameRequested);

      expect(renameCalls).toHaveLength(1);
      expect(renameCalls[0]?.[0]).toMatchObject({ payload: { projectId: PROJECT_ID, name: NEW_PROJECT_NAME } });
      expect(screen.queryByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL })).not.toBeInTheDocument();
    });

    it('renames the project when the box loses focus', () => {
      const store: AppStore = newStore();

      openProject(store);

      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      renderWorkbenchTopBar(store);
      fireEvent.click(screen.getByRole('button', { name: PROJECT_NAME }));
      fireEvent.change(screen.getByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL }), {
        target: { value: NEW_PROJECT_NAME },
      });
      fireEvent.blur(screen.getByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL }));

      expect(getDispatchedActionCalls(dispatchSpy, ProjectRenameRequested)).toHaveLength(1);
    });

    it.each([
      ['an empty name', '   '],
      ['an unchanged name', PROJECT_NAME],
    ])('cancels without a request for %s', (_label: string, typedName: string) => {
      const store: AppStore = newStore();

      openProject(store);

      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      renderWorkbenchTopBar(store);
      fireEvent.click(screen.getByRole('button', { name: PROJECT_NAME }));
      fireEvent.change(screen.getByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL }), {
        target: { value: typedName },
      });
      fireEvent.keyDown(screen.getByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL }), { key: ENTER_KEY });

      expect(getDispatchedActionCalls(dispatchSpy, ProjectRenameRequested)).toEqual([]);
      expect(screen.getByRole('button', { name: PROJECT_NAME })).toBeInTheDocument();
    });

    it('cancels on Escape without a rename and without stopping the machine', () => {
      const store: AppStore = newStore();

      openProject(store);
      act(() => {
        store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
      });

      const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

      renderWorkbenchTopBar(store);
      fireEvent.click(screen.getByRole('button', { name: PROJECT_NAME }));
      fireEvent.change(screen.getByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL }), {
        target: { value: NEW_PROJECT_NAME },
      });
      fireEvent.keyDown(screen.getByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL }), { key: ESCAPE_KEY });

      expect(screen.queryByRole('textbox', { name: PROJECT_NAME_INPUT_LABEL })).not.toBeInTheDocument();
      expect(getDispatchedActionCalls(dispatchSpy, ProjectRenameRequested)).toEqual([]);
      expect(getDispatchedActionCalls(dispatchSpy, MachineStopRequested)).toEqual([]);
      expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
    });
  });

  describe('autosave readout', () => {
    it.each<[ProjectSaveStatus, string]>([
      [PROJECT_SAVE_STATUS.SAVING, SAVING_TEXT],
      [PROJECT_SAVE_STATUS.UNSAVED, NOT_SAVED_TEXT],
      [PROJECT_SAVE_STATUS.SAVED, AUTOSAVE_TEXT],
    ])('shows the %s status as %s', (saveStatus: ProjectSaveStatus, expectedText: string) => {
      const store: AppStore = newStore();

      renderWorkbenchTopBar(store);
      act(() => {
        store.dispatch(new ProjectSaveStatusChanged({ saveStatus }));
      });

      expect(screen.getByRole('status')).toHaveTextContent(expectedText);
    });
  });
});
