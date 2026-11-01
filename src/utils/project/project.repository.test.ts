import { describe, expect, it } from 'vitest';
import type { ProjectDocument } from './interfaces/ProjectDocument';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { StoredProject } from './interfaces/StoredProject';
import { InvalidProjectNameError } from './invalid.project.name.error';
import { newProjectObject } from './new.project.object';
import { MAX_PROJECT_NAME_LENGTH } from './project.constants';
import { SVG_ASSET_PROJECT_ID_INDEX } from './project.database.constants';
import { ProjectNotFoundError } from './project.not.found.error';
import { PROJECT_REPOSITORY } from './project.repository';
import { WEBGRBL_DATABASE } from './webgrbl.database';

const PROJECT_NAME = 'Coasters';
const OTHER_PROJECT_NAME = 'Signs';
const RENAMED_PROJECT_NAME = 'Round coasters';
const SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm"></svg>';
const OTHER_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm"></svg>';
const MARKER_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="1mm" height="1mm"></svg>';
const MISSING_PROJECT_ID = 'missing-project';
const MOVED_X_MM = 42;
const FIRST_OPENED_PROJECT_ID = 'first-opened-project';
const SECOND_OPENED_PROJECT_ID = 'second-opened-project';

const getDocument = (objects: ProjectObject[]): ProjectDocument => ({ objects });

const getAssetCount = async (projectId: string): Promise<number> =>
  WEBGRBL_DATABASE.svgAssets.where(SVG_ASSET_PROJECT_ID_INDEX).equals(projectId).count();

/** Makes the next timestamp differ from the previous one, so newest-first order is not a tie. */
const waitForNextMillisecond = async (): Promise<void> => {
  const startTime: number = Date.now();

  while (Date.now() === startTime) {
    await new Promise((resolve: (value: unknown) => void): void => {
      setTimeout(resolve, 1);
    });
  }
};

describe(PROJECT_REPOSITORY.createProject.name, () => {
  it('stores an empty project with a new id and equal created and updated times', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    expect(createdProject.name).toBe(PROJECT_NAME);
    expect(createdProject.objects).toEqual([]);
    expect(createdProject.createdAt).toBe(createdProject.updatedAt);
    expect(new Date(createdProject.createdAt).toISOString()).toBe(createdProject.createdAt);
    expect(await WEBGRBL_DATABASE.projects.get(createdProject.id)).toEqual(createdProject);
  });

  it('trims the name', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(`  ${PROJECT_NAME}  `);

    expect(createdProject.name).toBe(PROJECT_NAME);
  });

  it('rejects an empty or too long name and stores nothing', async () => {
    await expect(PROJECT_REPOSITORY.createProject('   ')).rejects.toBeInstanceOf(InvalidProjectNameError);
    await expect(PROJECT_REPOSITORY.createProject('a'.repeat(MAX_PROJECT_NAME_LENGTH + 1)))
      .rejects.toBeInstanceOf(InvalidProjectNameError);
    expect(await WEBGRBL_DATABASE.projects.count()).toBe(0);
  });
});

describe(PROJECT_REPOSITORY.getProject.name, () => {
  it('joins the stored SVG text into the objects in drawing order', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const firstObject: ProjectObject = newProjectObject({ svgText: SVG_TEXT });
    const secondObject: ProjectObject = newProjectObject({ svgText: OTHER_SVG_TEXT });

    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([firstObject, secondObject]));

    const loadedProject = await PROJECT_REPOSITORY.getProject(createdProject.id);

    expect(loadedProject?.document).toEqual(getDocument([firstObject, secondObject]));
    expect(loadedProject?.project.name).toBe(PROJECT_NAME);
  });

  it('gives undefined for an unknown id', async () => {
    expect(await PROJECT_REPOSITORY.getProject(MISSING_PROJECT_ID)).toBeUndefined();
  });

  it('drops an object whose SVG row is missing instead of failing', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const brokenObject: ProjectObject = newProjectObject({ svgText: SVG_TEXT });
    const intactObject: ProjectObject = newProjectObject({ svgText: OTHER_SVG_TEXT });

    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([brokenObject, intactObject]));
    await WEBGRBL_DATABASE.svgAssets.delete(brokenObject.id);

    const loadedProject = await PROJECT_REPOSITORY.getProject(createdProject.id);

    expect(loadedProject?.document).toEqual(getDocument([intactObject]));
  });
});

describe(PROJECT_REPOSITORY.listProjects.name, () => {
  it('lists summaries newest first with object counts', async () => {
    const olderProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await waitForNextMillisecond();

    const newerProject: StoredProject = await PROJECT_REPOSITORY.createProject(OTHER_PROJECT_NAME);

    await waitForNextMillisecond();
    await PROJECT_REPOSITORY.saveDocument(olderProject.id, getDocument([newProjectObject({ svgText: SVG_TEXT })]));

    const savedOlderProject = await WEBGRBL_DATABASE.projects.get(olderProject.id);

    expect(await PROJECT_REPOSITORY.listProjects()).toEqual([
      { id: olderProject.id, name: PROJECT_NAME, updatedAt: savedOlderProject?.updatedAt, objectCount: 1 },
      { id: newerProject.id, name: OTHER_PROJECT_NAME, updatedAt: newerProject.updatedAt, objectCount: 0 },
    ]);
  });

  it('gives an empty list when there are no projects', async () => {
    expect(await PROJECT_REPOSITORY.listProjects()).toEqual([]);
  });
});

describe(PROJECT_REPOSITORY.saveDocument.name, () => {
  it('stores the objects without SVG text and moves the updated time forward', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const projectObject: ProjectObject = newProjectObject({ svgText: SVG_TEXT });

    await waitForNextMillisecond();
    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([projectObject]));

    const storedProject = await WEBGRBL_DATABASE.projects.get(createdProject.id);
    const { svgText: _svgText, ...storedObject } = projectObject;

    expect(storedProject?.objects).toEqual([storedObject]);
    expect(storedProject?.objects[0]).not.toHaveProperty('svgText');
    expect(storedProject?.createdAt).toBe(createdProject.createdAt);
    expect((storedProject?.updatedAt ?? '') > createdProject.updatedAt).toBe(true);
  });

  it('writes the SVG row of an object only once', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const projectObject: ProjectObject = newProjectObject({ svgText: SVG_TEXT });

    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([projectObject]));
    // A second save that rewrote the row would replace this marker with the document's SVG text.
    await WEBGRBL_DATABASE.svgAssets.update(projectObject.id, { svgText: MARKER_SVG_TEXT });
    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([{ ...projectObject, xMm: MOVED_X_MM }]));

    expect((await WEBGRBL_DATABASE.svgAssets.get(projectObject.id))?.svgText).toBe(MARKER_SVG_TEXT);
    expect((await WEBGRBL_DATABASE.projects.get(createdProject.id))?.objects[0]?.xMm).toBe(MOVED_X_MM);
    expect(await getAssetCount(createdProject.id)).toBe(1);
  });

  it('adds the SVG row of an object added later', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const firstObject: ProjectObject = newProjectObject({ svgText: SVG_TEXT });
    const addedObject: ProjectObject = newProjectObject({ svgText: OTHER_SVG_TEXT });

    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([firstObject]));
    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([firstObject, addedObject]));

    expect(await WEBGRBL_DATABASE.svgAssets.get(addedObject.id)).toEqual({
      objectId: addedObject.id,
      projectId: createdProject.id,
      svgText: OTHER_SVG_TEXT,
    });
  });

  it('keeps the SVG row of an object removed from the document, so undo can bring it back', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const projectObject: ProjectObject = newProjectObject({ svgText: SVG_TEXT });

    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([projectObject]));
    await PROJECT_REPOSITORY.saveDocument(createdProject.id, getDocument([]));

    expect(await getAssetCount(createdProject.id)).toBe(1);
  });

  it('rejects a save for an unknown project and writes nothing', async () => {
    const projectObject: ProjectObject = newProjectObject({ svgText: SVG_TEXT });

    await expect(PROJECT_REPOSITORY.saveDocument(MISSING_PROJECT_ID, getDocument([projectObject])))
      .rejects.toBeInstanceOf(ProjectNotFoundError);
    expect(await WEBGRBL_DATABASE.svgAssets.count()).toBe(0);
  });
});

describe(PROJECT_REPOSITORY.renameProject.name, () => {
  it('stores the trimmed new name', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await PROJECT_REPOSITORY.renameProject(createdProject.id, ` ${RENAMED_PROJECT_NAME} `);

    expect((await WEBGRBL_DATABASE.projects.get(createdProject.id))?.name).toBe(RENAMED_PROJECT_NAME);
  });

  it('rejects an empty name and keeps the old one', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await expect(PROJECT_REPOSITORY.renameProject(createdProject.id, ''))
      .rejects.toBeInstanceOf(InvalidProjectNameError);
    expect((await WEBGRBL_DATABASE.projects.get(createdProject.id))?.name).toBe(PROJECT_NAME);
  });
});

describe(PROJECT_REPOSITORY.deleteProject.name, () => {
  it('removes the project and its SVG rows but not those of other projects', async () => {
    const deletedProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const otherProject: StoredProject = await PROJECT_REPOSITORY.createProject(OTHER_PROJECT_NAME);

    await PROJECT_REPOSITORY.saveDocument(deletedProject.id, getDocument([newProjectObject({ svgText: SVG_TEXT })]));
    await PROJECT_REPOSITORY.saveDocument(otherProject.id, getDocument([newProjectObject({ svgText: SVG_TEXT })]));
    await PROJECT_REPOSITORY.deleteProject(deletedProject.id);

    expect(await PROJECT_REPOSITORY.getProject(deletedProject.id)).toBeUndefined();
    expect(await getAssetCount(deletedProject.id)).toBe(0);
    expect(await getAssetCount(otherProject.id)).toBe(1);
  });

  it('forgets the last opened project when that project is deleted', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await PROJECT_REPOSITORY.setLastOpenedProjectId(createdProject.id);
    await PROJECT_REPOSITORY.deleteProject(createdProject.id);

    expect(await PROJECT_REPOSITORY.getLastOpenedProjectId()).toBeUndefined();
  });

  it('keeps the last opened project when another project is deleted', async () => {
    const openedProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const deletedProject: StoredProject = await PROJECT_REPOSITORY.createProject(OTHER_PROJECT_NAME);

    await PROJECT_REPOSITORY.setLastOpenedProjectId(openedProject.id);
    await PROJECT_REPOSITORY.deleteProject(deletedProject.id);

    expect(await PROJECT_REPOSITORY.getLastOpenedProjectId()).toBe(openedProject.id);
  });
});

describe(PROJECT_REPOSITORY.pruneAssets.name, () => {
  it('keeps only the SVG rows of the listed objects of that project', async () => {
    const prunedProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);
    const otherProject: StoredProject = await PROJECT_REPOSITORY.createProject(OTHER_PROJECT_NAME);
    const keptObject: ProjectObject = newProjectObject({ svgText: SVG_TEXT });
    const removedObject: ProjectObject = newProjectObject({ svgText: OTHER_SVG_TEXT });

    await PROJECT_REPOSITORY.saveDocument(prunedProject.id, getDocument([keptObject, removedObject]));
    await PROJECT_REPOSITORY.saveDocument(otherProject.id, getDocument([newProjectObject({ svgText: SVG_TEXT })]));
    await PROJECT_REPOSITORY.pruneAssets(prunedProject.id, [keptObject.id]);

    const remainingObjectIds: string[] = await WEBGRBL_DATABASE.svgAssets.where(SVG_ASSET_PROJECT_ID_INDEX)
      .equals(prunedProject.id)
      .primaryKeys();

    expect(remainingObjectIds).toEqual([keptObject.id]);
    expect(await getAssetCount(otherProject.id)).toBe(1);
  });
});

describe(PROJECT_REPOSITORY.getLastOpenedProjectId.name, () => {
  it('gives undefined before any project was opened', async () => {
    expect(await PROJECT_REPOSITORY.getLastOpenedProjectId()).toBeUndefined();
  });

  it('gives the id stored last', async () => {
    await PROJECT_REPOSITORY.setLastOpenedProjectId(FIRST_OPENED_PROJECT_ID);
    await PROJECT_REPOSITORY.setLastOpenedProjectId(SECOND_OPENED_PROJECT_ID);

    expect(await PROJECT_REPOSITORY.getLastOpenedProjectId()).toBe(SECOND_OPENED_PROJECT_ID);
  });
});
