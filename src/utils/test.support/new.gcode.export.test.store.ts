/**
 * Test factory for a started store with an open project ready for G-code export: a named project whose document and
 * layers are loaded, an active machine profile, and a fake toolpath worker client.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { act } from '@testing-library/react';
import type { GcodeExportTestProject } from './interfaces/GcodeExportTestProject';
import { getObjectsDerivedLayers } from '../layers/get.objects.derived.layers';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { newProjectObject } from '../project/new.project.object';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../states/machine.profile.state';
import { newStore } from '../states/new.store';
import type { AppStore } from '../states/new.store';
import { ProjectDocumentLoaded } from '../states/project.document.state';
import { ProjectRenamed, selectProjectId } from '../states/project.state';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';

const TEST_PROJECT_NAME = 'Coaster set';
const RED_SQUARE_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/></svg>';

const newGcodeExportTestProject = (overrides: Partial<GcodeExportTestProject>): GcodeExportTestProject => ({
  projectName: TEST_PROJECT_NAME,
  objects: [newProjectObject({ svgText: RED_SQUARE_SVG_TEXT })],
  areLayersEnabled: true,
  activeProfile: newMachineProfile(),
  toolpathWorkerClient: new FakeToolpathWorkerClient(),
  ...overrides,
});

const getTestLayers = ({ objects, areLayersEnabled }: GcodeExportTestProject): ProjectLayer[] =>
  getObjectsDerivedLayers(objects, DEFAULT_PALETTE, []).map((layer: ProjectLayer): ProjectLayer => ({
    ...layer,
    enabled: areLayersEnabled,
  }));

const waitForOpenProjectId = async (store: AppStore): Promise<string> => {
  await vi.waitFor((): void => {
    expect(selectProjectId(store.getState())).toBeDefined();
  });

  return selectProjectId(store.getState()) ?? '';
};

export const newGcodeExportTestStore = async (
  overrides: Partial<GcodeExportTestProject> = {},
): Promise<AppStore> => {
  const testProject: GcodeExportTestProject = newGcodeExportTestProject(overrides);
  const store: AppStore = newStore(undefined, testProject.toolpathWorkerClient);
  const projectId: string = await waitForOpenProjectId(store);
  const { activeProfile } = testProject;

  act(() => {
    store.dispatch(new ProjectRenamed({ projectId, name: testProject.projectName }));
    store.dispatch(new ProjectDocumentLoaded({
      document: { objects: testProject.objects, layers: getTestLayers(testProject) },
    }));

    if (activeProfile) {
      store.dispatch(new MachineProfileSaved({ profile: activeProfile }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: activeProfile.id }));
    }
  });

  return store;
};
