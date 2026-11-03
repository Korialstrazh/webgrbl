/**
 * Access to the projects in the webgrbl database: projects, the SVG text of their objects, and the last opened project.
 * Feature code (containers, slices, sagas) goes through this module, which owns name validation and timestamps. The
 * panel sizes have their own repository next to it.
 *
 * The SVG text of an object is written once, the first time a document with that object is saved, and is not touched
 * by later saves, so an autosave after a nudge writes only the small project row. A save never deletes SVG rows,
 * because undo can bring a removed object back; `pruneAssets` removes them at a point the caller chooses.
 *
 * The layers are saved in the project row. A row stored before projects had layers has none, and a stored layer that is
 * malformed is left out; the open path then derives the missing layers from the palette.
 *
 * Storage errors (quota full, blocked database) are not caught here: every method rejects, and the caller decides
 * how to report it. Invalid names reject with `InvalidProjectNameError`, writes to a missing project with
 * `ProjectNotFoundError`.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEXIE_TRANSACTION_MODE_READ, DEXIE_TRANSACTION_MODE_READ_WRITE } from '../dexie.constants';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { isProjectLayer } from '../layers/is.project.layer';
import { isString } from '../type.guards/is.string';
import { getValidProjectName } from './get.valid.project.name';
import type { AppStateEntry } from './interfaces/AppStateEntry';
import type { LoadedProject } from './interfaces/LoadedProject';
import type { ProjectDocument } from './interfaces/ProjectDocument';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectSummary } from './interfaces/ProjectSummary';
import type { StoredProject } from './interfaces/StoredProject';
import type { StoredProjectObject } from './interfaces/StoredProjectObject';
import type { StoredSvgAsset } from './interfaces/StoredSvgAsset';
import type { SvgAssetKey } from './interfaces/SvgAssetKey';
import { InvalidProjectNameError } from './invalid.project.name.error';
import {
  APP_STATE_KEY,
  PROJECT_UPDATED_AT_INDEX,
  SVG_ASSET_PROJECT_ID_INDEX,
} from './project.database.constants';
import { ProjectNotFoundError } from './project.not.found.error';
import { WEBGRBL_DATABASE } from './webgrbl.database';

const getCurrentUtcIsoTimestamp = (): string => new Date().toISOString();

const getCheckedProjectName = (projectName: string): string => {
  const validProjectName: string | undefined = getValidProjectName(projectName);

  if (!validProjectName) {
    throw new InvalidProjectNameError();
  }

  return validProjectName;
};

const getStoredProjectObject = (projectObject: ProjectObject): StoredProjectObject => {
  const { svgText: _svgText, ...storedProjectObject } = projectObject;

  return storedProjectObject;
};

const getProjectSummary = (storedProject: StoredProject): ProjectSummary => ({
  id: storedProject.id,
  name: storedProject.name,
  updatedAt: storedProject.updatedAt,
  objectCount: storedProject.objects.length,
});

const getStoredProjectLayers = (storedProject: StoredProject): ProjectLayer[] =>
  (storedProject.layers ?? []).filter(isProjectLayer);

/** Joins the SVG text into the stored objects; an object whose SVG row is missing is left out, never a crash. */
const getJoinedProjectDocument = (storedProject: StoredProject, svgAssetRows: StoredSvgAsset[]): ProjectDocument => {
  const svgTextByObjectId: Map<string, string> = new Map<string, string>();

  for (const svgAssetRow of svgAssetRows) {
    svgTextByObjectId.set(svgAssetRow.objectId, svgAssetRow.svgText);
  }

  const joinedObjects: ProjectObject[] = [];

  for (const storedObject of storedProject.objects) {
    const svgText: string | undefined = svgTextByObjectId.get(storedObject.id);

    if (isString(svgText)) {
      joinedObjects.push({ ...storedObject, svgText });
    }
  }

  return {
    objects: joinedObjects,
    layers: getStoredProjectLayers(storedProject),
    // The row comes from storage, so its value is checked rather than trusted.
    materialId: isString(storedProject.materialId) ? storedProject.materialId : undefined,
  };
};

const getRequiredStoredProject = async (projectId: string): Promise<StoredProject> => {
  const storedProject: StoredProject | undefined = await WEBGRBL_DATABASE.projects.get(projectId);

  if (!storedProject) {
    throw new ProjectNotFoundError(projectId);
  }

  return storedProject;
};

const getProjectAssetKeys = async (projectId: string): Promise<SvgAssetKey[]> =>
  WEBGRBL_DATABASE.svgAssets.where(SVG_ASSET_PROJECT_ID_INDEX).equals(projectId).primaryKeys();

/**
 * SVG rows for the objects of the document that have no row in this project yet; existing rows are never rewritten.
 * Only keys are read, so no stored SVG text is loaded.
 */
const getMissingSvgAssetRows = async (
  projectId: string,
  projectDocument: ProjectDocument,
): Promise<StoredSvgAsset[]> => {
  const storedObjectIds: Set<string> = new Set<string>();

  for (const [, objectId] of await getProjectAssetKeys(projectId)) {
    storedObjectIds.add(objectId);
  }

  const missingAssetRows: StoredSvgAsset[] = [];

  for (const projectObject of projectDocument.objects) {
    if (!storedObjectIds.has(projectObject.id)) {
      missingAssetRows.push({ objectId: projectObject.id, projectId, svgText: projectObject.svgText });
    }
  }

  return missingAssetRows;
};

export const PROJECT_REPOSITORY = {
  async createProject(projectName: string): Promise<StoredProject> {
    const createdAt: string = getCurrentUtcIsoTimestamp();
    const createdProject: StoredProject = {
      id: crypto.randomUUID(),
      name: getCheckedProjectName(projectName),
      createdAt,
      updatedAt: createdAt,
      objects: [],
      layers: [],
    };

    await WEBGRBL_DATABASE.projects.add(createdProject);

    return createdProject;
  },

  async getProject(projectId: string): Promise<LoadedProject | undefined> {
    const { projects, svgAssets } = WEBGRBL_DATABASE;

    return WEBGRBL_DATABASE.transaction(DEXIE_TRANSACTION_MODE_READ, projects, svgAssets, async () => {
      const storedProject: StoredProject | undefined = await projects.get(projectId);

      if (!storedProject) {
        return undefined;
      }

      const svgAssetRows: StoredSvgAsset[] = await svgAssets.where(SVG_ASSET_PROJECT_ID_INDEX).equals(projectId)
        .toArray();

      const projectDocument: ProjectDocument = getJoinedProjectDocument(storedProject, svgAssetRows);

      return {
        project: storedProject,
        document: projectDocument,
        hasDroppedLayers: projectDocument.layers.length < (storedProject.layers?.length ?? 0),
      };
    });
  },

  async listProjects(): Promise<ProjectSummary[]> {
    const storedProjects: StoredProject[] = await WEBGRBL_DATABASE.projects.orderBy(PROJECT_UPDATED_AT_INDEX)
      .reverse()
      .toArray();

    return storedProjects.map(getProjectSummary);
  },

  async saveDocument(projectId: string, projectDocument: ProjectDocument): Promise<void> {
    const { projects, svgAssets } = WEBGRBL_DATABASE;

    await WEBGRBL_DATABASE.transaction(DEXIE_TRANSACTION_MODE_READ_WRITE, projects, svgAssets, async () => {
      const storedProject: StoredProject = await getRequiredStoredProject(projectId);
      const missingAssetRows: StoredSvgAsset[] = await getMissingSvgAssetRows(projectId, projectDocument);

      await svgAssets.bulkPut(missingAssetRows);
      await projects.put({
        ...storedProject,
        objects: projectDocument.objects.map(getStoredProjectObject),
        layers: projectDocument.layers,
        materialId: projectDocument.materialId,
        updatedAt: getCurrentUtcIsoTimestamp(),
      });
    });
  },

  async renameProject(projectId: string, projectName: string): Promise<void> {
    const checkedProjectName: string = getCheckedProjectName(projectName);
    const { projects } = WEBGRBL_DATABASE;

    await WEBGRBL_DATABASE.transaction(DEXIE_TRANSACTION_MODE_READ_WRITE, projects, async () => {
      const storedProject: StoredProject = await getRequiredStoredProject(projectId);

      await projects.put({ ...storedProject, name: checkedProjectName, updatedAt: getCurrentUtcIsoTimestamp() });
    });
  },

  async deleteProject(projectId: string): Promise<void> {
    const { appState, projects, svgAssets } = WEBGRBL_DATABASE;

    await WEBGRBL_DATABASE.transaction(DEXIE_TRANSACTION_MODE_READ_WRITE, projects, svgAssets, appState, async () => {
      await projects.delete(projectId);
      await svgAssets.where(SVG_ASSET_PROJECT_ID_INDEX).equals(projectId).delete();

      const lastOpenedEntry: AppStateEntry | undefined = await appState.get(APP_STATE_KEY.LAST_OPENED_PROJECT_ID);

      if (lastOpenedEntry?.value === projectId) {
        await appState.delete(APP_STATE_KEY.LAST_OPENED_PROJECT_ID);
      }
    });
  },

  /** Deletes the SVG rows of the project whose object ids are not listed. */
  async pruneAssets(projectId: string, objectIdsToKeep: string[]): Promise<void> {
    const keptObjectIds: Set<string> = new Set<string>(objectIdsToKeep);
    const { svgAssets } = WEBGRBL_DATABASE;

    await WEBGRBL_DATABASE.transaction(DEXIE_TRANSACTION_MODE_READ_WRITE, svgAssets, async () => {
      const projectAssetKeys: SvgAssetKey[] = await getProjectAssetKeys(projectId);
      const prunedAssetKeys: SvgAssetKey[] = projectAssetKeys.filter(
        ([, objectId]: SvgAssetKey): boolean => !keptObjectIds.has(objectId),
      );

      await svgAssets.bulkDelete(prunedAssetKeys);
    });
  },

  async getLastOpenedProjectId(): Promise<string | undefined> {
    const lastOpenedEntry: AppStateEntry | undefined =
      await WEBGRBL_DATABASE.appState.get(APP_STATE_KEY.LAST_OPENED_PROJECT_ID);
    // The row comes from storage, so its value is checked rather than trusted.
    const lastOpenedProjectId: unknown = lastOpenedEntry?.value;

    return isString(lastOpenedProjectId) ? lastOpenedProjectId : undefined;
  },

  async setLastOpenedProjectId(projectId: string): Promise<void> {
    await WEBGRBL_DATABASE.appState.put({ key: APP_STATE_KEY.LAST_OPENED_PROJECT_ID, value: projectId });
  },
};
