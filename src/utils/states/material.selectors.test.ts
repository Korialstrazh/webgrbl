import { describe, expect, it } from 'vitest';
import type { Material } from '../materials/interfaces/Material';
import type { MaterialPreset } from '../materials/interfaces/MaterialPreset';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import { MATERIAL_PRESET_OPERATION } from '../materials/material.preset.constants';
import { newMaterial } from '../materials/new.material';
import { newMaterialPreset } from '../materials/new.material.preset';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import { selectActiveMaterial, selectActiveMaterialPresetCount, selectActiveMaterialTestResult } from './material.selectors';
import { MaterialPresetSaved } from './material.preset.state';
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

describe(selectActiveMaterialPresetCount.name, () => {
  const newPresetFixture = (materialId: string, machineProfileId: string): MaterialPreset => newMaterialPreset({
    materialId,
    machineProfileId,
    operation: MATERIAL_PRESET_OPERATION.CUT,
    powerWatts: 5,
    speedMmPerMin: 300,
    passes: 1,
    notes: '',
  });

  it('counts the presets of the project material on the active machine only', () => {
    const store: AppStore = newStore();
    const material: Material = newMaterial();
    const otherMaterial: Material = newMaterial();
    const profile: MachineProfile = newMachineProfile();
    const otherProfile: MachineProfile = newMachineProfile();

    store.dispatch(new MaterialsLoaded({ materials: [material, otherMaterial] }));
    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new MachineProfileSaved({ profile: otherProfile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    store.dispatch(new MaterialPresetSaved({ preset: newPresetFixture(material.id, profile.id) }));
    store.dispatch(new MaterialPresetSaved({ preset: newPresetFixture(otherMaterial.id, profile.id) }));
    store.dispatch(new MaterialPresetSaved({ preset: newPresetFixture(material.id, otherProfile.id) }));

    expect(selectActiveMaterialPresetCount(store.getState())).toBe(0);
    store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));
    expect(selectActiveMaterialPresetCount(store.getState())).toBe(1);
  });
});
