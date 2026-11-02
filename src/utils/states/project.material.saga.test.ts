import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadTextFile } from '../browser/download.text.file';
import { DEFAULT } from '../localization/default.locales';
import type { Material } from '../materials/interfaces/Material';
import { MATERIAL_REPOSITORY } from '../materials/material.repository';
import { newMaterial } from '../materials/new.material';
import { getProjectFileText } from '../project/get.project.file.text';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import { newProjectObject } from '../project/new.project.object';
import { AUTOSAVE_DEBOUNCE_MS, PROJECT_FILE_EXTENSION } from '../project/project.constants';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { useStorageSafeFakeTimers } from '../test.support/use.storage.safe.fake.timers';
import type { AppToast } from './interfaces/AppToast';
import { selectActiveMaterial } from './material.selectors';
import { selectMaterials } from './material.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import {
  ProjectMaterialSelected,
  ProjectObjectsAdded,
  ProjectRedoRequested,
  ProjectUndoRequested,
  selectCanUndo,
  selectProjectDocument,
} from './project.document.state';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import {
  NewProjectRequested,
  ProjectFileExportRequested,
  ProjectFileImportRequested,
  ProjectOpenRequested,
  selectProjectId,
  selectProjectSaveStatus,
} from './project.state';
import { selectToasts } from './toast.state';

vi.mock('../browser/download.text.file', () => ({ downloadTextFile: vi.fn() }));

const PROJECT_NAME = 'Coasters';
const LOCAL_NAME = 'My local plywood';
const FILE_NAME = 'Name in the file';
const FIRST_MATERIAL_ID = 'material-a';
const SECOND_MATERIAL_ID = 'material-b';

const newStartedStore = async (): Promise<AppStore> => {
  const store: AppStore = newStore();

  await vi.waitFor((): void => {
    expect(selectProjectId(store.getState())).toBeDefined();
  });

  return store;
};

const newProjectFile = (fileText: string): File => new File([fileText], `${PROJECT_NAME}${PROJECT_FILE_EXTENSION}`);

const getMaterialFileText = (material: Material): string =>
  getProjectFileText(PROJECT_NAME, { objects: [], layers: [], materialId: material.id }, material);

const importFileText = async (store: AppStore, fileText: string): Promise<void> => {
  const previousProjectId: string | undefined = selectProjectId(store.getState());

  store.dispatch(new ProjectFileImportRequested({ file: newProjectFile(fileText) }));
  await vi.waitFor((): void => {
    expect(selectProjectId(store.getState())).not.toBe(previousProjectId);
  });
};

describe('project material', () => {
  beforeEach(() => {
    useStorageSafeFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(downloadTextFile).mockClear();
    vi.useRealTimers();
  });

  it('selecting a material is one undo step and a repeat makes no step', async () => {
    const store: AppStore = await newStartedStore();

    store.dispatch(new ProjectMaterialSelected({ materialId: FIRST_MATERIAL_ID }));
    store.dispatch(new ProjectMaterialSelected({ materialId: FIRST_MATERIAL_ID }));
    expect(selectProjectDocument(store.getState()).materialId).toBe(FIRST_MATERIAL_ID);

    store.dispatch(new ProjectUndoRequested());
    expect(selectProjectDocument(store.getState()).materialId).toBeUndefined();
    expect(selectCanUndo(store.getState())).toBe(false);

    store.dispatch(new ProjectRedoRequested());
    expect(selectProjectDocument(store.getState()).materialId).toBe(FIRST_MATERIAL_ID);
  });

  it('autosaves the material, keeps it when an object is added, and reopens with it', async () => {
    const store: AppStore = await newStartedStore();
    const openProjectId: string = selectProjectId(store.getState()) ?? '';

    store.dispatch(new ProjectMaterialSelected({ materialId: FIRST_MATERIAL_ID }));
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    await vi.waitFor(async (): Promise<void> => {
      const storedProject: LoadedProject | undefined = await PROJECT_REPOSITORY.getProject(openProjectId);

      expect(storedProject?.document.materialId).toBe(FIRST_MATERIAL_ID);
    });

    store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
    expect(selectProjectDocument(store.getState()).materialId).toBe(FIRST_MATERIAL_ID);
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    await vi.waitFor((): void => {
      expect(selectProjectSaveStatus(store.getState())).toBe(PROJECT_SAVE_STATUS.SAVED);
    });

    store.dispatch(new NewProjectRequested());
    await vi.waitFor((): void => {
      expect(selectProjectId(store.getState())).not.toBe(openProjectId);
    });
    expect(selectProjectDocument(store.getState()).materialId).toBeUndefined();

    store.dispatch(new ProjectOpenRequested({ projectId: openProjectId }));
    await vi.waitFor((): void => {
      expect(selectProjectId(store.getState())).toBe(openProjectId);
    });
    expect(selectProjectDocument(store.getState()).materialId).toBe(FIRST_MATERIAL_ID);
    expect(selectProjectDocument(store.getState()).objects).toHaveLength(1);
  });

  it('opens an existing project with no material id, with no active material', async () => {
    const createdProjectId: string = (await PROJECT_REPOSITORY.createProject(PROJECT_NAME)).id;
    const store: AppStore = await newStartedStore();

    store.dispatch(new ProjectOpenRequested({ projectId: createdProjectId }));
    await vi.waitFor((): void => {
      expect(selectProjectId(store.getState())).toBe(createdProjectId);
    });

    expect(selectActiveMaterial(store.getState())).toBeUndefined();
  });

  it('adds the material of an imported file when its id is unknown here', async () => {
    const fileMaterial: Material = newMaterial({ id: FIRST_MATERIAL_ID, name: FILE_NAME });
    const store: AppStore = await newStartedStore();

    await importFileText(store, getMaterialFileText(fileMaterial));

    expect(await MATERIAL_REPOSITORY.listMaterials()).toEqual([fileMaterial]);
    expect(selectMaterials(store.getState())).toEqual([fileMaterial]);
    expect(selectActiveMaterial(store.getState())).toEqual(fileMaterial);
  });

  it('keeps the local name and results when the id of an imported material exists here', async () => {
    const localMaterial: Material = newMaterial({ id: SECOND_MATERIAL_ID, name: LOCAL_NAME });
    const fileMaterial: Material = newMaterial({ id: SECOND_MATERIAL_ID, name: FILE_NAME, thicknessMm: 9 });

    await MATERIAL_REPOSITORY.putMaterial(localMaterial);

    const store: AppStore = await newStartedStore();

    await importFileText(store, getMaterialFileText(fileMaterial));

    expect(await MATERIAL_REPOSITORY.listMaterials()).toEqual([localMaterial]);
    expect(selectActiveMaterial(store.getState())).toEqual(localMaterial);
  });

  it('rejects a file with a malformed material with the invalid-file toast, opening nothing', async () => {
    const store: AppStore = await newStartedStore();
    const openProjectId: string | undefined = selectProjectId(store.getState());
    const fileValue: Record<string, unknown> = JSON.parse(getMaterialFileText(newMaterial()));

    store.dispatch(new ProjectFileImportRequested({
      file: newProjectFile(JSON.stringify({ ...fileValue, material: { thicknessMm: 'thick' } })),
    }));

    await vi.waitFor((): void => {
      expect(selectToasts(store.getState()).map((toast: AppToast): string => toast.messageKey))
        .toContain(DEFAULT.TOAST_PROJECT_FILE_INVALID);
    });
    expect(selectProjectId(store.getState())).toBe(openProjectId);
    expect(await MATERIAL_REPOSITORY.listMaterials()).toEqual([]);
  });

  it('exports the active material in the file', async () => {
    const material: Material = newMaterial({ id: FIRST_MATERIAL_ID });

    await MATERIAL_REPOSITORY.putMaterial(material);

    const store: AppStore = await newStartedStore();

    await vi.waitFor((): void => {
      expect(selectMaterials(store.getState())).toEqual([material]);
    });
    store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));
    store.dispatch(new ProjectFileExportRequested());

    await vi.waitFor((): void => {
      expect(downloadTextFile).toHaveBeenCalledTimes(1);
    });

    const exportedText: string = vi.mocked(downloadTextFile).mock.calls[0]?.[0].text ?? '';

    expect(JSON.parse(exportedText).material).toEqual(material);
  });
});
