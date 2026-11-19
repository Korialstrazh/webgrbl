/**
 * Tests for the project saga, run through newStore() over fake-indexeddb, with fake timers for the autosave delays.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import {
  HIDDEN_VISIBILITY_STATE,
  PAGE_HIDE_EVENT_NAME,
  VISIBILITY_CHANGE_EVENT_NAME,
} from '../browser/browser.events.constants';
import { downloadTextFile } from '../browser/download.text.file';
import { DEFAULT } from '../localization/default.locales';
import { getDefaultProjectName } from '../project/get.default.project.name';
import { getProjectFileText } from '../project/get.project.file.text';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import type { ProjectSummary } from '../project/interfaces/ProjectSummary';
import type { StoredProject } from '../project/interfaces/StoredProject';
import type { StoredSvgAsset } from '../project/interfaces/StoredSvgAsset';
import { newProjectObject } from '../project/new.project.object';
import {
  AUTOSAVE_DEBOUNCE_MS,
  AUTOSAVE_MAX_WAIT_MS,
  MAX_PROJECT_FILE_BYTES,
  MAX_PROJECT_NAME_LENGTH,
  PROJECT_FILE_EXTENSION,
  PROJECT_FILE_MIME_TYPE,
} from '../project/project.constants';
import { SVG_ASSET_PROJECT_ID_INDEX } from '../project/project.database.constants';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { WEBGRBL_DATABASE } from '../project/webgrbl.database';
import { SVG_MIME_TYPE } from '../svg/svg.constants';
import { useStorageSafeFakeTimers } from '../test.support/use.storage.safe.fake.timers';
import type { AppToast } from './interfaces/AppToast';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import {
  ProjectObjectsAdded,
  ProjectObjectsDeleted,
  ProjectObjectsTransformed,
  ProjectUndoRequested,
  SvgFilesImportRequested,
  selectCanUndo,
  selectProjectDocument,
  selectProjectObjects,
} from './project.document.state';
import { watchProjects } from './project.saga';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import type { ProjectSaveStatus } from './project.save.status.constants';
import {
  NewProjectRequested,
  ProjectDeleteRequested,
  ProjectFileExportRequested,
  ProjectFileImportRequested,
  ProjectOpenRequested,
  ProjectRenameRequested,
  selectHasProjectSaveFailed,
  selectProjectId,
  selectProjectName,
  selectProjectSaveStatus,
  selectProjectSummaries,
} from './project.state';
import { TOAST_SEVERITY } from './toast.constants';
import { selectToasts } from './toast.state';

vi.mock('../browser/download.text.file', () => ({ downloadTextFile: vi.fn() }));

const ARTWORK_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm"><circle r="5"/></svg>';
const IMPORTED_PROJECT_NAME = 'Imported coasters';
const RENAMED_PROJECT_NAME = 'Round coasters';
const NAME_WITH_FORBIDDEN_CHARACTERS = 'Coasters: round/square';
const STEADY_CHANGE_INTERVAL_MS = 500;
const ONE_MS = 1;
const STORAGE_FAILURE_MESSAGE = 'quota exceeded';
/** Keeps created projects apart in time, so newest-first order never depends on a tie. */
const PROJECT_TIME_GAP_MS = 10;
/** Real time a leftover store gets to write after a flush event; several database round trips fit in it. */
const LEFTOVER_STORE_SETTLE_MS = 300;
const ARTWORK_FILE_NAME = 'artwork.svg';
/** How long the start holds the project load back, so an import that does not wait for the project gets ahead. */
const EARLY_IMPORT_WAIT_MS = 300;
const ARTWORK_OBJECT_NAME = 'artwork';
const EMPTY_DOCUMENT: ProjectDocument = { objects: [], layers: [] };

type SaveDocument = typeof PROJECT_REPOSITORY.saveDocument;

type SaveDocumentSpy = MockInstance<SaveDocument>;

type RenameProjectSpy = MockInstance<typeof PROJECT_REPOSITORY.renameProject>;

const waitForOpenProject = async (store: AppStore): Promise<string> => {
  await vi.waitFor((): void => {
    expect(selectProjectId(store.getState())).toBeDefined();
  });

  return selectProjectId(store.getState()) ?? '';
};

const waitForSaveStatus = async (store: AppStore, saveStatus: ProjectSaveStatus): Promise<void> => {
  await vi.waitFor((): void => {
    expect(selectProjectSaveStatus(store.getState())).toBe(saveStatus);
  });
};

const newStartedStore = async (): Promise<AppStore> => {
  const store: AppStore = newStore();

  await waitForOpenProject(store);

  return store;
};

const addObject = (store: AppStore, projectObject: ProjectObject = newProjectObject()): ProjectObject => {
  store.dispatch(new ProjectObjectsAdded({ objects: [projectObject], layers: [] }));

  return projectObject;
};

const moveObject = (store: AppStore, projectObject: ProjectObject, xMm: number): void => {
  store.dispatch(new ProjectObjectsTransformed({ transforms: { [projectObject.id]: { ...projectObject, xMm } } }));
};

/** Lets the autosave delay pass and waits until the save has reached the database. */
const autosave = async (store: AppStore): Promise<void> => {
  await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
  await waitForSaveStatus(store, PROJECT_SAVE_STATUS.SAVED);
};

const getStoredProject = async (projectId: string): Promise<LoadedProject | undefined> =>
  PROJECT_REPOSITORY.getProject(projectId);

const getStoredProjectIds = async (): Promise<string[]> =>
  (await PROJECT_REPOSITORY.listProjects()).map((summary: ProjectSummary): string => summary.id);

/** The stored artwork of one object, read straight from the database, so a deleted object's row can be checked. */
const getStoredSvgText = async (projectId: string, objectId: string): Promise<string | undefined> => {
  const projectAssets: StoredSvgAsset[] = await WEBGRBL_DATABASE.svgAssets.where(SVG_ASSET_PROJECT_ID_INDEX)
    .equals(projectId)
    .toArray();

  return projectAssets.find((assetRow: StoredSvgAsset): boolean => assetRow.objectId === objectId)?.svgText;
};

const getToastsOf = (store: AppStore, messageKey: string): AppToast[] =>
  selectToasts(store.getState()).filter((toast: AppToast): boolean => toast.messageKey === messageKey);

const waitForNewProject = async (store: AppStore, previousProjectId: string): Promise<string> => {
  await vi.waitFor((): void => {
    expect(selectProjectId(store.getState())).not.toBe(previousProjectId);
  });

  return selectProjectId(store.getState()) ?? '';
};

const requestNewProject = async (store: AppStore): Promise<string> => {
  const previousProjectId: string = selectProjectId(store.getState()) ?? '';

  await vi.advanceTimersByTimeAsync(PROJECT_TIME_GAP_MS);
  store.dispatch(new NewProjectRequested());

  return waitForNewProject(store, previousProjectId);
};

/** Moves the object every 500 ms, the last time 500 ms before the maximum autosave wait ends. */
const keepMovingObjectUntilMaximumWait = async (store: AppStore, projectObject: ProjectObject): Promise<void> => {
  const changeIntervalMs: number = STEADY_CHANGE_INTERVAL_MS;

  for (let elapsedMs = changeIntervalMs; elapsedMs < AUTOSAVE_MAX_WAIT_MS; elapsedMs += changeIntervalMs) {
    await vi.advanceTimersByTimeAsync(changeIntervalMs);
    moveObject(store, projectObject, elapsedMs);
  }
};

const newProjectFile = (fileText: string): File =>
  new File([fileText], `${IMPORTED_PROJECT_NAME}${PROJECT_FILE_EXTENSION}`);

const newArtworkFile = (): File => new File([ARTWORK_SVG_TEXT], ARTWORK_FILE_NAME, { type: SVG_MIME_TYPE });

const requestArtworkImport = (store: AppStore): void => {
  store.dispatch(new SvgFilesImportRequested({ files: [newArtworkFile()] }));
};

const ORIGINAL_CREATE_PROJECT: typeof PROJECT_REPOSITORY.createProject = PROJECT_REPOSITORY.createProject;
const ORIGINAL_PRUNE_ASSETS: typeof PROJECT_REPOSITORY.pruneAssets = PROJECT_REPOSITORY.pruneAssets;
const ORIGINAL_GET_PROJECT: typeof PROJECT_REPOSITORY.getProject = PROJECT_REPOSITORY.getProject;

/** Runs the side effect once, at the moment the next project is created, then creates it as usual. */
const runWhenProjectIsCreated = (sideEffect: () => void): void => {
  vi.spyOn(PROJECT_REPOSITORY, 'createProject').mockImplementationOnce(
    async (projectName: string): Promise<StoredProject> => {
      sideEffect();

      return ORIGINAL_CREATE_PROJECT.call(PROJECT_REPOSITORY, projectName);
    },
  );
};

const getObjectNames = (projectObjects: ProjectObject[]): string[] =>
  projectObjects.map((projectObject: ProjectObject): string => projectObject.name);

const hideTab = (): void => {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(HIDDEN_VISIBILITY_STATE);
  document.dispatchEvent(new Event(VISIBILITY_CHANGE_EVENT_NAME));
};

describe(watchProjects.name, () => {
  beforeEach(() => {
    useStorageSafeFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(downloadTextFile).mockClear();
    vi.useRealTimers();
  });

  // These two tests run in order on purpose: the first leaves a store with an unsaved change behind, the second
  // checks that the leftover store cannot write into the next test's database.
  describe('stores left over from an earlier test', () => {
    it('leaves a store with an unsaved change behind', async () => {
      const store: AppStore = await newStartedStore();

      addObject(store);

      expect(selectProjectSaveStatus(store.getState())).toBe(PROJECT_SAVE_STATUS.UNSAVED);
    });

    it('does not let the leftover store write into this test\'s database when the page is left', async () => {
      await newStartedStore();
      vi.useRealTimers();

      window.dispatchEvent(new Event(PAGE_HIDE_EVENT_NAME));
      await new Promise((resolve: (value: unknown) => void): void => {
        setTimeout(resolve, LEFTOVER_STORE_SETTLE_MS);
      });

      expect(await getStoredProjectIds()).toHaveLength(1);
    });
  });

  describe('start', () => {
    it('creates and opens an empty project with the default name on the first start', async () => {
      const store: AppStore = await newStartedStore();
      const projectId: string = selectProjectId(store.getState()) ?? '';

      expect(selectProjectName(store.getState())).toBe(getDefaultProjectName());
      expect(selectProjectSaveStatus(store.getState())).toBe(PROJECT_SAVE_STATUS.SAVED);
      expect(await getStoredProjectIds()).toEqual([projectId]);
      expect(await PROJECT_REPOSITORY.getLastOpenedProjectId()).toBe(projectId);
      await vi.waitFor((): void => {
        expect(selectProjectSummaries(store.getState()).map((summary: ProjectSummary) => summary.id))
          .toEqual([projectId]);
      });
    });

    it('reopens the last opened project with its objects in a second store over the same database', async () => {
      const firstStore: AppStore = await newStartedStore();
      const projectObject: ProjectObject = addObject(firstStore, newProjectObject({ svgText: ARTWORK_SVG_TEXT }));
      await autosave(firstStore);

      const secondStore: AppStore = await newStartedStore();

      expect(selectProjectId(secondStore.getState())).toBe(selectProjectId(firstStore.getState()));
      expect(selectProjectObjects(secondStore.getState())).toEqual([projectObject]);
      expect(await getStoredProjectIds()).toHaveLength(1);
    });

    it('creates a new project when the last opened project no longer exists', async () => {
      const firstStore: AppStore = await newStartedStore();
      const deletedProjectId: string = selectProjectId(firstStore.getState()) ?? '';
      const otherProject: StoredProject = await PROJECT_REPOSITORY.createProject(RENAMED_PROJECT_NAME);
      await PROJECT_REPOSITORY.deleteProject(deletedProjectId);
      await PROJECT_REPOSITORY.setLastOpenedProjectId(deletedProjectId);

      const secondStore: AppStore = await newStartedStore();
      const secondProjectId: string = selectProjectId(secondStore.getState()) ?? '';

      expect([deletedProjectId, otherProject.id]).not.toContain(secondProjectId);
      expect(selectProjectName(secondStore.getState())).toBe(getDefaultProjectName());
    });

    it('keeps and stores objects added before the first project opened', async () => {
      const store: AppStore = newStore();
      const projectObject: ProjectObject = addObject(store, newProjectObject({ svgText: ARTWORK_SVG_TEXT }));

      const projectId: string = await waitForOpenProject(store);
      await waitForSaveStatus(store, PROJECT_SAVE_STATUS.SAVED);

      expect(selectProjectObjects(store.getState())).toEqual([projectObject]);
      expect((await getStoredProject(projectId))?.document.objects).toEqual([projectObject]);
    });

    it('shows a storage toast when the start fails and still handles later requests', async () => {
      vi.spyOn(PROJECT_REPOSITORY, 'getLastOpenedProjectId').mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));
      const store: AppStore = newStore();

      await vi.waitFor((): void => {
        expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_STORAGE_FAILED)).toHaveLength(1);
      });
      store.dispatch(new NewProjectRequested());

      await waitForOpenProject(store);
      expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_STORAGE_FAILED)[0]).toMatchObject({
        severity: TOAST_SEVERITY.ERROR,
        messageParameters: {},
      });
    });
  });

  describe('autosave', () => {
    it('saves a change 1000 ms after it, not at 999 ms', async () => {
      const store: AppStore = await newStartedStore();
      const saveSpy: SaveDocumentSpy = vi.spyOn(PROJECT_REPOSITORY, 'saveDocument');
      addObject(store);

      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS - ONE_MS);
      expect(saveSpy).not.toHaveBeenCalled();
      expect(selectProjectSaveStatus(store.getState())).toBe(PROJECT_SAVE_STATUS.UNSAVED);

      await vi.advanceTimersByTimeAsync(ONE_MS);
      await waitForSaveStatus(store, PROJECT_SAVE_STATUS.SAVED);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('still saves by 3000 ms while changes keep coming every 500 ms', async () => {
      const store: AppStore = await newStartedStore();
      const saveSpy: SaveDocumentSpy = vi.spyOn(PROJECT_REPOSITORY, 'saveDocument');
      const projectObject: ProjectObject = addObject(store);

      await keepMovingObjectUntilMaximumWait(store, projectObject);

      await vi.advanceTimersByTimeAsync(STEADY_CHANGE_INTERVAL_MS - ONE_MS);
      expect(saveSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(ONE_MS);
      await vi.waitFor((): void => {
        expect(saveSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('reports unsaved, then saving, then saved', async () => {
      const store: AppStore = await newStartedStore();
      const reportedStatuses: ProjectSaveStatus[] = [];
      let lastStatus: ProjectSaveStatus = selectProjectSaveStatus(store.getState());
      store.subscribe((): void => {
        const saveStatus: ProjectSaveStatus = selectProjectSaveStatus(store.getState());

        if (saveStatus !== lastStatus) {
          reportedStatuses.push(saveStatus);
          lastStatus = saveStatus;
        }
      });

      addObject(store);
      await autosave(store);

      expect(reportedStatuses).toEqual([
        PROJECT_SAVE_STATUS.UNSAVED,
        PROJECT_SAVE_STATUS.SAVING,
        PROJECT_SAVE_STATUS.SAVED,
      ]);
    });

    it('saves again when a change arrives while a save is being written', async () => {
      const store: AppStore = await newStartedStore();
      const projectObject: ProjectObject = addObject(store);
      const writeDocument: SaveDocument = PROJECT_REPOSITORY.saveDocument.bind(PROJECT_REPOSITORY);
      const saveSpy: SaveDocumentSpy = vi.spyOn(PROJECT_REPOSITORY, 'saveDocument');
      saveSpy.mockImplementationOnce(async (projectId: string, projectDocument: ProjectDocument): Promise<void> => {
        moveObject(store, projectObject, STEADY_CHANGE_INTERVAL_MS);
        await writeDocument(projectId, projectDocument);
      });

      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      await vi.waitFor((): void => {
        expect(saveSpy).toHaveBeenCalledTimes(1);
      });
      await waitForSaveStatus(store, PROJECT_SAVE_STATUS.UNSAVED);
      await autosave(store);

      const storedProject: LoadedProject | undefined = await getStoredProject(selectProjectId(store.getState()) ?? '');
      expect(storedProject?.document.objects[0]?.xMm).toBe(STEADY_CHANGE_INTERVAL_MS);
    });

    it('saves at once when the tab is hidden', async () => {
      const store: AppStore = await newStartedStore();
      const saveSpy: SaveDocumentSpy = vi.spyOn(PROJECT_REPOSITORY, 'saveDocument');
      addObject(store);

      hideTab();

      await waitForSaveStatus(store, PROJECT_SAVE_STATUS.SAVED);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('saves at once when the page is left', async () => {
      const store: AppStore = await newStartedStore();
      const saveSpy: SaveDocumentSpy = vi.spyOn(PROJECT_REPOSITORY, 'saveDocument');
      addObject(store);

      window.dispatchEvent(new Event(PAGE_HIDE_EVENT_NAME));

      await waitForSaveStatus(store, PROJECT_SAVE_STATUS.SAVED);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('shows one toast across two failed saves, and a later success clears the failure', async () => {
      const store: AppStore = await newStartedStore();
      const saveSpy: SaveDocumentSpy = vi.spyOn(PROJECT_REPOSITORY, 'saveDocument')
        .mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE))
        .mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));
      const projectObject: ProjectObject = addObject(store);

      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      await vi.waitFor((): void => {
        expect(selectHasProjectSaveFailed(store.getState())).toBe(true);
      });
      moveObject(store, projectObject, STEADY_CHANGE_INTERVAL_MS);
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      await vi.waitFor((): void => {
        expect(saveSpy).toHaveBeenCalledTimes(2);
      });
      await waitForSaveStatus(store, PROJECT_SAVE_STATUS.UNSAVED);

      expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_SAVE_FAILED)).toEqual([
        expect.objectContaining({ severity: TOAST_SEVERITY.ERROR, messageParameters: {}, repeatCount: 1 }),
      ]);

      moveObject(store, projectObject, AUTOSAVE_DEBOUNCE_MS);
      await autosave(store);
      expect(selectHasProjectSaveFailed(store.getState())).toBe(false);

      saveSpy.mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));
      moveObject(store, projectObject, AUTOSAVE_MAX_WAIT_MS);
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      await vi.waitFor((): void => {
        expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_SAVE_FAILED)[0]?.repeatCount).toBe(2);
      });

      // Leaves the store saved, so its flush listener cannot write into a later test's database.
      moveObject(store, projectObject, 0);
      await autosave(store);
    });

    it('shows the failure toast again when the project opened after a failed one also fails to save', async () => {
      const store: AppStore = await newStartedStore();
      const failingProjectId: string = selectProjectId(store.getState()) ?? '';
      const saveSpy: SaveDocumentSpy = vi.spyOn(PROJECT_REPOSITORY, 'saveDocument')
        .mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));
      addObject(store);
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      await vi.waitFor((): void => {
        expect(selectHasProjectSaveFailed(store.getState())).toBe(true);
      });

      store.dispatch(new ProjectDeleteRequested({ projectId: failingProjectId }));
      await waitForNewProject(store, failingProjectId);
      saveSpy.mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));
      addObject(store);
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

      await vi.waitFor((): void => {
        expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_SAVE_FAILED)[0]?.repeatCount).toBe(2);
      });
    });

    it('stores the document in a new project without a toast when the open project was deleted elsewhere', async () => {
      const store: AppStore = await newStartedStore();
      const deletedProjectId: string = selectProjectId(store.getState()) ?? '';
      const projectObject: ProjectObject = addObject(store, newProjectObject({ svgText: ARTWORK_SVG_TEXT }));
      await PROJECT_REPOSITORY.deleteProject(deletedProjectId);

      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      const recoveredProjectId: string = await waitForNewProject(store, deletedProjectId);
      await waitForSaveStatus(store, PROJECT_SAVE_STATUS.SAVED);

      expect((await getStoredProject(recoveredProjectId))?.document.objects).toEqual([projectObject]);
      expect(selectProjectName(store.getState())).toBe(getDefaultProjectName());
      expect(selectToasts(store.getState())).toEqual([]);
    });

    it('brings a deleted object back with its artwork after delete, autosave, undo, autosave, reload', async () => {
      const firstStore: AppStore = await newStartedStore();
      const projectObject: ProjectObject = addObject(firstStore, newProjectObject({ svgText: ARTWORK_SVG_TEXT }));
      await autosave(firstStore);
      firstStore.dispatch(new ProjectObjectsDeleted({ objectIds: [projectObject.id] }));
      await autosave(firstStore);
      expect(await getStoredSvgText(selectProjectId(firstStore.getState()) ?? '', projectObject.id))
        .toBe(ARTWORK_SVG_TEXT);
      firstStore.dispatch(new ProjectUndoRequested());
      await autosave(firstStore);

      const secondStore: AppStore = await newStartedStore();

      expect(selectProjectObjects(secondStore.getState())).toEqual([projectObject]);
      expect(selectProjectObjects(secondStore.getState())[0]?.svgText).toBe(ARTWORK_SVG_TEXT);
    });
  });

  describe('requests', () => {
    it('New keeps the old project, opens an empty one and clears the history', async () => {
      const store: AppStore = await newStartedStore();
      const oldProjectId: string = selectProjectId(store.getState()) ?? '';
      const projectObject: ProjectObject = addObject(store);

      const newProjectId: string = await requestNewProject(store);

      expect(selectProjectObjects(store.getState())).toEqual([]);
      expect(selectCanUndo(store.getState())).toBe(false);
      expect(selectProjectName(store.getState())).toBe(getDefaultProjectName());
      expect((await getStoredProject(oldProjectId))?.document.objects).toEqual([projectObject]);
      expect((await getStoredProject(newProjectId))?.document.objects).toEqual([]);
      expect(await PROJECT_REPOSITORY.getLastOpenedProjectId()).toBe(newProjectId);
    });

    it('Open loads the requested project with an empty history', async () => {
      const store: AppStore = await newStartedStore();
      const firstProjectId: string = selectProjectId(store.getState()) ?? '';
      const projectObject: ProjectObject = addObject(store);
      await requestNewProject(store);
      addObject(store);

      store.dispatch(new ProjectOpenRequested({ projectId: firstProjectId }));

      await vi.waitFor((): void => {
        expect(selectProjectId(store.getState())).toBe(firstProjectId);
      });
      expect(selectProjectObjects(store.getState())).toEqual([projectObject]);
      expect(selectCanUndo(store.getState())).toBe(false);
    });

    it('opening a project file creates a new project and leaves the old one unchanged', async () => {
      const store: AppStore = await newStartedStore();
      const oldProjectId: string = selectProjectId(store.getState()) ?? '';
      const oldObject: ProjectObject = addObject(store);
      const fileObject: ProjectObject = newProjectObject({ svgText: ARTWORK_SVG_TEXT });
      const fileText: string =
        getProjectFileText(IMPORTED_PROJECT_NAME, { objects: [fileObject], layers: [] }, undefined);

      store.dispatch(new ProjectFileImportRequested({ file: newProjectFile(fileText) }));

      const importedProjectId: string = await waitForNewProject(store, oldProjectId);
      const importedObjects: ProjectObject[] = (await getStoredProject(importedProjectId))?.document.objects ?? [];
      expect(selectProjectName(store.getState())).toBe(IMPORTED_PROJECT_NAME);
      expect(importedObjects).toHaveLength(1);
      expect(importedObjects[0]?.id).not.toBe(fileObject.id);
      expect(importedObjects[0]?.xMm).toBe(fileObject.xMm);
      expect(selectProjectObjects(store.getState())).toEqual(importedObjects);
      expect((await getStoredProject(oldProjectId))?.document.objects).toEqual([oldObject]);
    });

    it('an invalid project file shows a toast and changes nothing', async () => {
      const store: AppStore = await newStartedStore();
      const projectId: string = selectProjectId(store.getState()) ?? '';
      const projectObject: ProjectObject = addObject(store);

      store.dispatch(new ProjectFileImportRequested({ file: newProjectFile('{"format":"something-else"}') }));

      await vi.waitFor((): void => {
        expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_FILE_INVALID)).toHaveLength(1);
      });
      expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_FILE_INVALID)[0]?.severity).toBe(TOAST_SEVERITY.ERROR);
      expect(selectProjectId(store.getState())).toBe(projectId);
      expect(selectProjectObjects(store.getState())).toEqual([projectObject]);
      expect(await getStoredProjectIds()).toEqual([projectId]);
    });

    it('rejects a project file over the size limit before reading it', async () => {
      const store: AppStore = await newStartedStore();
      const projectId: string = selectProjectId(store.getState()) ?? '';
      const oversizedFile: File = newProjectFile(getProjectFileText(IMPORTED_PROJECT_NAME, EMPTY_DOCUMENT, undefined));
      Object.defineProperty(oversizedFile, 'size', { value: MAX_PROJECT_FILE_BYTES + 1 });
      const readSpy: MockInstance<File['text']> = vi.spyOn(oversizedFile, 'text');

      store.dispatch(new ProjectFileImportRequested({ file: oversizedFile }));

      await vi.waitFor((): void => {
        expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_FILE_INVALID)).toHaveLength(1);
      });
      expect(readSpy).not.toHaveBeenCalled();
      expect(selectProjectId(store.getState())).toBe(projectId);
      expect(await getStoredProjectIds()).toEqual([projectId]);
    });

    it('opens a project file of exactly the size limit', async () => {
      const store: AppStore = await newStartedStore();
      const oldProjectId: string = selectProjectId(store.getState()) ?? '';
      const limitSizedFile: File = newProjectFile(getProjectFileText(IMPORTED_PROJECT_NAME, EMPTY_DOCUMENT, undefined));
      Object.defineProperty(limitSizedFile, 'size', { value: MAX_PROJECT_FILE_BYTES });

      store.dispatch(new ProjectFileImportRequested({ file: limitSizedFile }));
      await waitForNewProject(store, oldProjectId);

      expect(selectProjectName(store.getState())).toBe(IMPORTED_PROJECT_NAME);
    });

    it('deleting the open project opens the most recent remaining one', async () => {
      const store: AppStore = await newStartedStore();
      const oldestProjectId: string = selectProjectId(store.getState()) ?? '';
      const middleProjectId: string = await requestNewProject(store);
      const newestProjectId: string = await requestNewProject(store);

      store.dispatch(new ProjectDeleteRequested({ projectId: newestProjectId }));

      await waitForNewProject(store, newestProjectId);
      expect(selectProjectId(store.getState())).toBe(middleProjectId);
      expect(await getStoredProjectIds()).toEqual([middleProjectId, oldestProjectId]);
      await vi.waitFor((): void => {
        expect(selectProjectSummaries(store.getState()).map((summary: ProjectSummary) => summary.id))
          .toEqual([middleProjectId, oldestProjectId]);
      });
    });

    it('deleting the only project opens a new empty one', async () => {
      const store: AppStore = await newStartedStore();
      const deletedProjectId: string = selectProjectId(store.getState()) ?? '';
      addObject(store);

      store.dispatch(new ProjectDeleteRequested({ projectId: deletedProjectId }));

      const newProjectId: string = await waitForNewProject(store, deletedProjectId);
      expect(selectProjectObjects(store.getState())).toEqual([]);
      expect(await getStoredProjectIds()).toEqual([newProjectId]);
    });

    it('deleting another project keeps the open one', async () => {
      const store: AppStore = await newStartedStore();
      const otherProjectId: string = selectProjectId(store.getState()) ?? '';
      const openProjectId: string = await requestNewProject(store);

      store.dispatch(new ProjectDeleteRequested({ projectId: otherProjectId }));

      await vi.waitFor((): void => {
        expect(selectProjectSummaries(store.getState()).map((summary: ProjectSummary) => summary.id))
          .toEqual([openProjectId]);
      });
      expect(selectProjectId(store.getState())).toBe(openProjectId);
    });

    it('rename ignores a blank and a 101-character name and applies a valid one', async () => {
      const store: AppStore = await newStartedStore();
      const projectId: string = selectProjectId(store.getState()) ?? '';
      const renameSpy: RenameProjectSpy = vi.spyOn(PROJECT_REPOSITORY, 'renameProject');

      store.dispatch(new ProjectRenameRequested({ projectId, name: '   ' }));
      store.dispatch(new ProjectRenameRequested({ projectId, name: 'x'.repeat(MAX_PROJECT_NAME_LENGTH + 1) }));
      store.dispatch(new ProjectRenameRequested({ projectId, name: `  ${RENAMED_PROJECT_NAME}  ` }));

      await vi.waitFor((): void => {
        expect(selectProjectName(store.getState())).toBe(RENAMED_PROJECT_NAME);
      });
      expect(renameSpy).toHaveBeenCalledTimes(1);
      expect(renameSpy).toHaveBeenCalledWith(projectId, RENAMED_PROJECT_NAME);
      await vi.waitFor((): void => {
        expect(selectProjectSummaries(store.getState())[0]?.name).toBe(RENAMED_PROJECT_NAME);
      });
    });

    it('keeps the derived name of the first import as the project name after every object is deleted', async () => {
      const store: AppStore = await newStartedStore();

      await vi.waitFor((): void => {
        expect(selectProjectSummaries(store.getState())).toHaveLength(1);
      });
      requestArtworkImport(store);
      await vi.waitFor((): void => {
        expect(selectProjectName(store.getState())).not.toBe(getDefaultProjectName());
      });

      const storedName: string = selectProjectName(store.getState());

      store.dispatch(new ProjectObjectsDeleted({
        objectIds: selectProjectObjects(store.getState()).map((projectObject: ProjectObject) => projectObject.id),
      }));

      expect(storedName).toContain(ARTWORK_OBJECT_NAME);
      expect(selectProjectName(store.getState())).toBe(storedName);
    });

    it('Save as file downloads the open project as a .webgrbl.json file', async () => {
      const store: AppStore = await newStartedStore();
      const projectId: string = selectProjectId(store.getState()) ?? '';
      store.dispatch(new ProjectRenameRequested({ projectId, name: NAME_WITH_FORBIDDEN_CHARACTERS }));
      addObject(store);

      store.dispatch(new ProjectFileExportRequested());

      await vi.waitFor((): void => {
        expect(downloadTextFile).toHaveBeenCalledWith({
          text: getProjectFileText(NAME_WITH_FORBIDDEN_CHARACTERS, selectProjectDocument(store.getState()), undefined),
          fileName: `Coasters roundsquare${PROJECT_FILE_EXTENSION}`,
          mimeType: PROJECT_FILE_MIME_TYPE,
        });
      });
    });
  });

  describe('edits during a project switch', () => {
    it('keeps an object added while New creates the project in the old project, with its artwork', async () => {
      const store: AppStore = await newStartedStore();
      const oldProjectId: string = selectProjectId(store.getState()) ?? '';
      const lateObject: ProjectObject = newProjectObject({ svgText: ARTWORK_SVG_TEXT });
      runWhenProjectIsCreated((): void => {
        addObject(store, lateObject);
      });

      await requestNewProject(store);

      expect(selectProjectObjects(store.getState())).toEqual([]);
      expect((await getStoredProject(oldProjectId))?.document.objects).toEqual([lateObject]);
      expect(await getStoredSvgText(oldProjectId, lateObject.id)).toBe(ARTWORK_SVG_TEXT);
    });

    it('keeps an object added while a project file is stored in the old project, with its artwork', async () => {
      const store: AppStore = await newStartedStore();
      const oldProjectId: string = selectProjectId(store.getState()) ?? '';
      const lateObject: ProjectObject = newProjectObject({ svgText: ARTWORK_SVG_TEXT });
      const fileText: string = getProjectFileText(IMPORTED_PROJECT_NAME, EMPTY_DOCUMENT, undefined);
      runWhenProjectIsCreated((): void => {
        addObject(store, lateObject);
      });

      store.dispatch(new ProjectFileImportRequested({ file: newProjectFile(fileText) }));
      await waitForNewProject(store, oldProjectId);

      expect((await getStoredProject(oldProjectId))?.document.objects).toEqual([lateObject]);
      expect(await getStoredSvgText(oldProjectId, lateObject.id)).toBe(ARTWORK_SVG_TEXT);
    });

    it('keeps an object added while Open finishes in the opened project', async () => {
      const store: AppStore = await newStartedStore();
      const firstProjectId: string = selectProjectId(store.getState()) ?? '';
      const firstObject: ProjectObject = addObject(store);
      await requestNewProject(store);
      const lateObject: ProjectObject = newProjectObject({ svgText: ARTWORK_SVG_TEXT });
      vi.spyOn(PROJECT_REPOSITORY, 'pruneAssets').mockImplementationOnce(
        async (projectId: string, objectIdsToKeep: string[]): Promise<void> => {
          addObject(store, lateObject);

          return ORIGINAL_PRUNE_ASSETS.call(PROJECT_REPOSITORY, projectId, objectIdsToKeep);
        },
      );

      store.dispatch(new ProjectOpenRequested({ projectId: firstProjectId }));
      await vi.waitFor((): void => {
        expect(selectProjectObjects(store.getState())).toHaveLength(2);
      });
      await autosave(store);

      expect(selectProjectId(store.getState())).toBe(firstProjectId);
      expect((await getStoredProject(firstProjectId))?.document.objects).toEqual([firstObject, lateObject]);
    });

    it('deletes the project New created when the open project cannot be saved, and stays open', async () => {
      const store: AppStore = await newStartedStore();
      const projectId: string = selectProjectId(store.getState()) ?? '';
      const projectObject: ProjectObject = addObject(store);
      vi.spyOn(PROJECT_REPOSITORY, 'saveDocument').mockRejectedValue(new Error(STORAGE_FAILURE_MESSAGE));
      const deleteSpy: MockInstance<typeof PROJECT_REPOSITORY.deleteProject> =
        vi.spyOn(PROJECT_REPOSITORY, 'deleteProject');

      store.dispatch(new NewProjectRequested());
      await vi.waitFor((): void => {
        expect(deleteSpy).toHaveBeenCalledTimes(1);
      });
      await vi.waitFor(async (): Promise<void> => {
        expect(await getStoredProjectIds()).toEqual([projectId]);
      });

      expect(selectProjectId(store.getState())).toBe(projectId);
      expect(selectProjectObjects(store.getState())).toEqual([projectObject]);
      expect(getToastsOf(store, DEFAULT.TOAST_PROJECT_SAVE_FAILED)).toHaveLength(1);
    });

    it('applies an svg import requested during New to the new project, after it opens', async () => {
      const store: AppStore = await newStartedStore();
      const oldProjectId: string = selectProjectId(store.getState()) ?? '';
      runWhenProjectIsCreated((): void => {
        requestArtworkImport(store);
      });

      const newProjectId: string = await requestNewProject(store);
      await vi.waitFor((): void => {
        expect(getObjectNames(selectProjectObjects(store.getState()))).toEqual([ARTWORK_OBJECT_NAME]);
      });
      await autosave(store);

      expect(selectProjectId(store.getState())).toBe(newProjectId);
      expect((await getStoredProject(oldProjectId))?.document.objects).toEqual([]);
      expect(getObjectNames((await getStoredProject(newProjectId))?.document.objects ?? [])).toEqual([
        ARTWORK_OBJECT_NAME,
      ]);
    });

    it('applies an svg import requested during the start to the reopened project', async () => {
      const firstStore: AppStore = await newStartedStore();
      const projectObject: ProjectObject = addObject(firstStore);
      await autosave(firstStore);
      let secondStore: AppStore | undefined;
      vi.spyOn(PROJECT_REPOSITORY, 'getProject').mockImplementationOnce(
        async (projectId: string): Promise<LoadedProject | undefined> => {
          try {
            // Gives an import that does not wait for the project the time to land before the project loads.
            await vi.waitFor((): void => {
              expect(selectProjectObjects(secondStore?.getState() ?? firstStore.getState())).toHaveLength(1);
            }, { timeout: EARLY_IMPORT_WAIT_MS });
          } catch {
            // The import waited for the project, as it should.
          }

          return ORIGINAL_GET_PROJECT.call(PROJECT_REPOSITORY, projectId);
        },
      );

      secondStore = newStore();
      requestArtworkImport(secondStore);
      await waitForOpenProject(secondStore);
      const startedStore: AppStore = secondStore;
      await vi.waitFor((): void => {
        expect(selectProjectObjects(startedStore.getState())).toHaveLength(2);
      });

      expect(selectProjectObjects(startedStore.getState())[0]).toEqual(projectObject);
      expect(selectProjectObjects(startedStore.getState())[1]?.name).toBe(ARTWORK_OBJECT_NAME);
    });
  });
});
