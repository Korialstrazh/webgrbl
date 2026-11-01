import { describe, expect, it } from 'vitest';
import { getLayerSettings } from '../layers/get.layer.settings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_CUT_ENTRY } from '../palette/palette.constants';
import type { LoadedProject } from './interfaces/LoadedProject';
import type { StoredProject } from './interfaces/StoredProject';
import { PROJECT_REPOSITORY } from './project.repository';
import { WEBGRBL_DATABASE } from './webgrbl.database';

const PROJECT_NAME = 'Coasters';
const ORPHAN_COLOUR = '#00ffff';

const CUT_LAYER: ProjectLayer = {
  colour: DEFAULT_CUT_ENTRY.colour,
  enabled: true,
  order: 0,
  settings: getLayerSettings(DEFAULT_CUT_ENTRY),
  paletteEntryId: DEFAULT_CUT_ENTRY.id,
  isShading: false,
};

const ORPHAN_LAYER: ProjectLayer = {
  ...CUT_LAYER,
  colour: ORPHAN_COLOUR,
  enabled: false,
  order: 1,
  paletteEntryId: undefined,
};

describe('project repository layers', () => {
  it('creates a project with no layers', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    expect(createdProject.layers).toEqual([]);
  });

  it('saves the layers with the project row and reads them back, layers no object uses included', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await PROJECT_REPOSITORY.saveDocument(createdProject.id, { objects: [], layers: [CUT_LAYER, ORPHAN_LAYER] });
    const loadedProject: LoadedProject | undefined = await PROJECT_REPOSITORY.getProject(createdProject.id);

    expect((await WEBGRBL_DATABASE.projects.get(createdProject.id))?.layers).toEqual([CUT_LAYER, ORPHAN_LAYER]);
    expect(loadedProject?.document.layers).toEqual([CUT_LAYER, ORPHAN_LAYER]);
  });

  it('loads a project row stored without layers with an empty layer list', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await WEBGRBL_DATABASE.projects.put({ ...createdProject, layers: undefined });

    expect((await PROJECT_REPOSITORY.getProject(createdProject.id))?.document.layers).toEqual([]);
  });

  it('leaves out a stored layer that is malformed', async () => {
    const createdProject: StoredProject = await PROJECT_REPOSITORY.createProject(PROJECT_NAME);

    await WEBGRBL_DATABASE.projects.put({
      ...createdProject,
      layers: [CUT_LAYER, { ...ORPHAN_LAYER, settings: { ...ORPHAN_LAYER.settings, passes: Number.NaN } }],
    });

    expect((await PROJECT_REPOSITORY.getProject(createdProject.id))?.document.layers).toEqual([CUT_LAYER]);
  });
});
