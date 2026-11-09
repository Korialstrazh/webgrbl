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

const STORED_CAPTION = 'In this browser';
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
const NOW_MS: number = Date.parse('2026-03-05T09:05:00.000Z');
const NEWEST_META_COUNT_TEXT = `${NEWEST_OBJECT_COUNT} objects`;
const NEWEST_META_TIME_TEXT = '5 minutes ago';
const OLDEST_META_COUNT_TEXT = `${OLDEST_OBJECT_COUNT} objects`;
const OLDEST_META_TIME_TEXT = '4 days ago';
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
const CREATED_AT = '2026-02-20T09:00:00.000Z';
const UNTITLED_NAME = 'Untitled project';
const FIRST_OBJECT_NAME = 'coaster-ring';
const FALLBACK_NAME = `${FIRST_OBJECT_NAME} \u00b7 Feb 20, 2026`;
const OBJECT_BOX: ProjectSummary['objectBoxes'][number] = {
  xMm: 10,
  yMm: 20,
  widthMm: 40,
  heightMm: 30,
  rotationDeg: 0,
};
const NEWEST_SUMMARY: ProjectSummary = {
  id: NEWEST_ID,
  name: NEWEST_NAME,
  createdAt: CREATED_AT,
  updatedAt: NEWEST_UPDATED_AT,
  objectCount: NEWEST_OBJECT_COUNT,
  objectBoxes: [OBJECT_BOX],
};
const SUMMARIES: ProjectSummary[] = [
  NEWEST_SUMMARY,
  {
    id: OLDEST_ID,
    name: OLDEST_NAME,
    createdAt: CREATED_AT,
    updatedAt: OLDEST_UPDATED_AT,
    objectCount: OLDEST_OBJECT_COUNT,
    objectBoxes: [],
  },
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
    expect(screen.getByRole('note', { name: FOOTER_PATTERN })).toBeInTheDocument();
    expect(await screen.findByText(NEWEST_NAME)).toBeInTheDocument();
  });

  it('heads the list with In this browser, in one row with Open file, above the list', async () => {
    renderDialog(newStore());

    const heading: HTMLElement = screen.getByRole('heading', { name: STORED_CAPTION });

    await screen.findByText(NEWEST_NAME);

    const list: HTMLElement = screen.getByRole('list');

    expect(heading.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(heading.parentElement?.parentElement)
      .toContainElement(screen.getByRole('button', { name: OPEN_FILE_LABEL }));
  });

  it('lists the projects newest first with object count and relative change time, marks the open one', async () => {
    const store: AppStore = newStore();

    const nowSpy: MockInstance<typeof Date.now> = vi.spyOn(Date, 'now').mockReturnValue(NOW_MS);

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
    expect(rows[0]).toHaveTextContent(NEWEST_META_COUNT_TEXT);
    expect(rows[0]).toHaveTextContent(NEWEST_META_TIME_TEXT);
    expect(within(getRow(NEWEST_NAME)).getByText(new RegExp(NEWEST_META_TIME_TEXT))).toHaveAttribute(
      'title',
      expect.stringMatching(/2026/),
    );
    expect(rows[1]).toHaveTextContent(OLDEST_META_COUNT_TEXT);
    expect(rows[1]).toHaveTextContent(OLDEST_META_TIME_TEXT);
    nowSpy.mockRestore();
    expect(within(getRow(NEWEST_NAME)).queryByRole('button', { name: OPEN_LABEL })).not.toBeInTheDocument();
    expect(within(getRow(OLDEST_NAME)).getByRole('button', { name: OPEN_LABEL })).toBeInTheDocument();
  });

  it('draws a thumbnail of the object boxes in each row', async () => {
    renderDialog(newStore());

    await screen.findByText(NEWEST_NAME);

    const row: HTMLElement = getRow(NEWEST_NAME);

    expect(row.querySelectorAll('svg rect')).toHaveLength(1);
  });

  it('names a project that still has the default name after its first object and the day it was made', async () => {
    vi.spyOn(PROJECT_REPOSITORY, 'listProjects').mockResolvedValue([
      { ...NEWEST_SUMMARY, name: UNTITLED_NAME, firstObjectName: FIRST_OBJECT_NAME },
    ]);

    renderDialog(newStore());

    expect(await screen.findByText(FALLBACK_NAME)).toBeInTheDocument();
    expect(screen.queryByText(UNTITLED_NAME)).not.toBeInTheDocument();
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
