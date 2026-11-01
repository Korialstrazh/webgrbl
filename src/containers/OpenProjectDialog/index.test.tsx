import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { OpenProjectDialog } from '.';
import { ENTER_KEY, ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import type { ProjectSummary } from '../../utils/project/interfaces/ProjectSummary';
import { PROJECT_REPOSITORY } from '../../utils/project/project.repository';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  ProjectDeleteRequested,
  ProjectFileImportRequested,
  ProjectOpened,
  ProjectOpenRequested,
  ProjectRenameRequested,
  ProjectSummariesRequested,
} from '../../utils/states/project.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { getDispatchedActionCalls } from '../../utils/test.support/get.dispatched.action.calls';
import { StopHotkey } from '../StopHotkey';

const DIALOG_LABEL = 'Open project';
const LIST_LABEL = 'Stored projects';
const NEWEST_ID = 'project-newest';
const OLDEST_ID = 'project-oldest';
const NEWEST_NAME = 'Coasters';
const OLDEST_NAME = 'Name plates';
const NEWEST_UPDATED_AT = '2026-03-05T09:00:00.000Z';
const OLDEST_UPDATED_AT = '2026-03-01T09:00:00.000Z';
const NEWEST_OBJECT_COUNT = 3;
const OLDEST_OBJECT_COUNT = 12;
const OPEN_NOW_TEXT = 'open now';
const OPEN_LABEL = 'Open';
const RENAME_LABEL = 'Rename';
const DELETE_LABEL = 'Delete';
const DELETE_OK_LABEL = 'Yes, delete';
const OPEN_FILE_LABEL = 'Open file\u2026';
const FILE_INPUT_LABEL = 'Open a project file';
const RENAME_INPUT_LABEL = `New name for ${OLDEST_NAME}`;
const RENAMED_NAME = 'Plates';
const FOOTER_PATTERN = /stored in this browser/;
const PROJECT_FILE_NAME = 'plates.webgrbl.json';
const SUMMARIES: ProjectSummary[] = [
  { id: NEWEST_ID, name: NEWEST_NAME, updatedAt: NEWEST_UPDATED_AT, objectCount: NEWEST_OBJECT_COUNT },
  { id: OLDEST_ID, name: OLDEST_NAME, updatedAt: OLDEST_UPDATED_AT, objectCount: OLDEST_OBJECT_COUNT },
];

const renderDialog = (store: AppStore, onClose: () => void = vi.fn()): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <OpenProjectDialog isOpen onClose={onClose} />
          <StopHotkey />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const getRow = (projectName: string): HTMLElement => {
  const row: HTMLElement | null = screen.getByText(projectName).closest('li');

  if (!row) {
    throw new Error(`No row for ${projectName}.`);
  }

  return row;
};

describe(OpenProjectDialog.name, () => {
  beforeEach(() => {
    vi.spyOn(PROJECT_REPOSITORY, 'listProjects').mockResolvedValue(SUMMARIES);
  });

  it('requests the project list on open and registers an overlay', async () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store);

    expect(screen.getByRole('dialog', { name: DIALOG_LABEL })).toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
    expect(getDispatchedActionCalls(dispatchSpy, ProjectSummariesRequested)).toHaveLength(1);
    expect(screen.getByText(FOOTER_PATTERN)).toBeInTheDocument();
    expect(await screen.findByText(NEWEST_NAME)).toBeInTheDocument();
  });

  it('lists the projects newest first with their change time and object count, and marks the open one', async () => {
    const store: AppStore = newStore();

    renderDialog(store);

    await screen.findByText(NEWEST_NAME);
    act(() => {
      store.dispatch(new ProjectOpened({ projectId: NEWEST_ID, name: NEWEST_NAME }));
    });

    const rows: HTMLElement[] = within(screen.getByRole('list', { name: LIST_LABEL })).getAllByRole('listitem');

    expect(rows).toHaveLength(SUMMARIES.length);
    expect(rows[0]).toHaveTextContent(NEWEST_NAME);
    expect(rows[1]).toHaveTextContent(OLDEST_NAME);
    expect(rows[0]).toHaveTextContent(OPEN_NOW_TEXT);
    expect(rows[1]).not.toHaveTextContent(OPEN_NOW_TEXT);
    expect(rows[0]).toHaveTextContent(`Objects: ${NEWEST_OBJECT_COUNT}`);
    expect(rows[0]).toHaveTextContent(/2026/);
    expect(within(getRow(NEWEST_NAME)).queryByRole('button', { name: OPEN_LABEL })).not.toBeInTheDocument();
    expect(within(getRow(OLDEST_NAME)).getByRole('button', { name: OPEN_LABEL })).toBeInTheDocument();
  });

  it('opens a project and closes the dialog', async () => {
    const store: AppStore = newStore();
    const onClose: () => void = vi.fn();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store, onClose);
    await screen.findByText(OLDEST_NAME);

    fireEvent.click(within(getRow(OLDEST_NAME)).getByRole('button', { name: OPEN_LABEL }));

    const openCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, ProjectOpenRequested);

    expect(openCalls).toHaveLength(1);
    expect(openCalls[0]?.[0]).toMatchObject({ payload: { projectId: OLDEST_ID } });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deletes a project only after the confirmation', async () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store);
    await screen.findByText(OLDEST_NAME);

    fireEvent.click(within(getRow(OLDEST_NAME)).getByRole('button', { name: DELETE_LABEL }));

    expect(getDispatchedActionCalls(dispatchSpy, ProjectDeleteRequested)).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: DELETE_OK_LABEL }));

    const deleteCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, ProjectDeleteRequested);

    expect(deleteCalls).toHaveLength(1);
    expect(deleteCalls[0]?.[0]).toMatchObject({ payload: { projectId: OLDEST_ID } });
  });

  it('renames a project in place', async () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store);
    await screen.findByText(OLDEST_NAME);

    fireEvent.click(within(getRow(OLDEST_NAME)).getByRole('button', { name: RENAME_LABEL }));
    fireEvent.change(screen.getByRole('textbox', { name: RENAME_INPUT_LABEL }), { target: { value: RENAMED_NAME } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: RENAME_INPUT_LABEL }), { key: ENTER_KEY });

    const renameCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, ProjectRenameRequested);

    expect(renameCalls).toHaveLength(1);
    expect(renameCalls[0]?.[0]).toMatchObject({ payload: { projectId: OLDEST_ID, name: RENAMED_NAME } });
  });

  it('cancels a rename on Escape without closing the dialog or stopping the machine', async () => {
    const store: AppStore = newStore();
    const onClose: () => void = vi.fn();

    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store, onClose);
    await screen.findByText(OLDEST_NAME);

    fireEvent.click(within(getRow(OLDEST_NAME)).getByRole('button', { name: RENAME_LABEL }));
    fireEvent.keyDown(screen.getByRole('textbox', { name: RENAME_INPUT_LABEL }), { key: ESCAPE_KEY });

    expect(screen.queryByRole('textbox', { name: RENAME_INPUT_LABEL })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(getDispatchedActionCalls(dispatchSpy, ProjectRenameRequested)).toEqual([]);
    expect(getDispatchedActionCalls(dispatchSpy, MachineStopRequested)).toEqual([]);
  });

  it('sends the project file picked with Open file', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    const pickedFile: File = new File(['{}'], PROJECT_FILE_NAME);
    const clickSpy: MockInstance<() => void> = vi.spyOn(HTMLInputElement.prototype, 'click');

    renderDialog(store);
    fireEvent.click(screen.getByRole('button', { name: OPEN_FILE_LABEL }));

    expect(clickSpy).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText(FILE_INPUT_LABEL), { target: { files: [pickedFile] } });

    const importCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, ProjectFileImportRequested);

    expect(importCalls).toHaveLength(1);
    expect(importCalls[0]?.[0]).toMatchObject({ payload: { file: pickedFile } });
    clickSpy.mockRestore();
  });
});
