import { describe, expect, it } from 'vitest';
import type { Material } from '../materials/interfaces/Material';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import { newMaterial } from '../materials/new.material';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import { selectActiveMaterial, selectActiveMaterialTestResult } from './material.selectors';
import { MaterialSaved, MaterialsLoaded } from './material.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ProjectDocumentLoaded, ProjectMaterialSelected } from './project.document.state';

const newTestResult = (machineProfileId: string, passes: number): MaterialTestResult => ({
  machineProfileId,
  powerPercent: 100,
  speedMmPerMin: 300,
  passes,
  thicknessMm: 3,
  outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
  depthMm: undefined,
  testedAtIso: '2026-11-03T10:00:00.000Z',
});

describe(selectActiveMaterial.name, () => {
  it('gives undefined for a project with no material id', () => {
    const store: AppStore = newStore();

    store.dispatch(new MaterialsLoaded({ materials: [newMaterial()] }));
    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [], layers: [] } }));

    expect(selectActiveMaterial(store.getState())).toBeUndefined();
  });

  it('gives undefined when the material of the id is missing', () => {
    const store: AppStore = newStore();

    store.dispatch(new MaterialsLoaded({ materials: [newMaterial()] }));
    store.dispatch(new ProjectMaterialSelected({ materialId: 'missing' }));

    expect(selectActiveMaterial(store.getState())).toBeUndefined();
  });

  it('gives the material the document points at', () => {
    const store: AppStore = newStore();
    const material: Material = newMaterial();

    store.dispatch(new MaterialsLoaded({ materials: [newMaterial(), material] }));
    store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));

    expect(selectActiveMaterial(store.getState())).toEqual(material);
  });
});

describe(selectActiveMaterialTestResult.name, () => {
  it('follows the active machine profile, and gives undefined for a profile with no result', () => {
    const store: AppStore = newStore();
    const profileA: MachineProfile = newMachineProfile();
    const profileB: MachineProfile = newMachineProfile();
    const profileWithoutResult: MachineProfile = newMachineProfile();
    const resultA: MaterialTestResult = newTestResult(profileA.id, 1);
    const resultB: MaterialTestResult = newTestResult(profileB.id, 2);
    const material: Material = newMaterial({ testResults: [resultA, resultB] });

    store.dispatch(new MachineProfileSaved({ profile: profileA }));
    store.dispatch(new MachineProfileSaved({ profile: profileB }));
    store.dispatch(new MachineProfileSaved({ profile: profileWithoutResult }));
    store.dispatch(new MaterialSaved({ material }));
    store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));

    store.dispatch(new ActiveMachineProfileSelected({ profileId: profileA.id }));
    expect(selectActiveMaterialTestResult(store.getState())).toEqual(resultA);

    store.dispatch(new ActiveMachineProfileSelected({ profileId: profileB.id }));
    expect(selectActiveMaterialTestResult(store.getState())).toEqual(resultB);

    store.dispatch(new ActiveMachineProfileSelected({ profileId: profileWithoutResult.id }));
    expect(selectActiveMaterialTestResult(store.getState())).toBeUndefined();
  });

  it('gives undefined with no active material', () => {
    expect(selectActiveMaterialTestResult(newStore().getState())).toBeUndefined();
  });
});
