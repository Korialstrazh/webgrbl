import { describe, expect, it } from 'vitest';
import type { LoadedProject } from './interfaces/LoadedProject';
import type { StoredProject } from './interfaces/StoredProject';
import { PROJECT_REPOSITORY } from './project.repository';
import { WEBGRBL_DATABASE } from './webgrbl.database';

const PROJECT_NAME = 'Coasters';
const MATERIAL_ID = 'material-a';

describe('project repository material', () => {
  it('reads back a saved material id', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await PROJECT_REPOSITORY.saveDocument(createdProject.id, { objects: [], layers: [], materialId: MATERIAL_ID });

    const loadedProject: LoadedProject | undefined = await PROJECT_REPOSITORY.getProject(createdProject.id);

    expect(loadedProject?.document.materialId).toBe(MATERIAL_ID);
  });

  it('clears the stored id when the saved document has none, as after an undo', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await PROJECT_REPOSITORY.saveDocument(createdProject.id, { objects: [], layers: [], materialId: MATERIAL_ID });
    await PROJECT_REPOSITORY.saveDocument(createdProject.id, { objects: [], layers: [] });

    const loadedProject: LoadedProject | undefined = await PROJECT_REPOSITORY.getProject(createdProject.id);

    expect(loadedProject?.document.materialId).toBeUndefined();
  });

  it('opens a stored row with no material id, or with one that is not text', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    expect((await PROJECT_REPOSITORY.getProject(createdProject.id))?.document.materialId).toBeUndefined();

    await WEBGRBL_DATABASE.projects.put({ ...createdProject, materialId: 7 } as unknown as StoredProject);

    expect((await PROJECT_REPOSITORY.getProject(createdProject.id))?.document.materialId).toBeUndefined();
  });
});
