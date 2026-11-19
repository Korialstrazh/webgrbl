/**
 * The material of the open project, its test result and its presets on the active machine profile. These read several
 * states, so they live apart from the material state. A result or a preset belongs to one laser, so another profile's
 * is never returned.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getMaterialPresetCount } from '../materials/get.material.preset.count';
import type { Material } from '../materials/interfaces/Material';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from './machine.profile.state';
import { selectMaterialPresets } from './material.preset.state';
import { selectMaterials } from './material.state';
import { selectProjectDocument } from './project.document.state';

type RootState =
  & Parameters<typeof selectMaterials>[0]
  & Parameters<typeof selectMaterialPresets>[0]
  & Parameters<typeof selectProjectDocument>[0]
  & Parameters<typeof selectActiveMachineProfile>[0];

export const selectActiveMaterial = (state: RootState): Material | undefined => {
  const { materialId } = selectProjectDocument(state);

  return selectMaterials(state).find((material: Material): boolean => material.id === materialId);
};

export const selectActiveMaterialTestResult = (state: RootState): MaterialTestResult | undefined => {
  const activeProfile: MachineProfile | undefined = selectActiveMachineProfile(state);

  return selectActiveMaterial(state)?.testResults.find(
    (testResult: MaterialTestResult): boolean => testResult.machineProfileId === activeProfile?.id,
  );
};

/** How many stored presets the project material has on the active machine; 0 without a material or a machine. */
export const selectActiveMaterialPresetCount = (state: RootState): number => {
  const activeMaterialId: string | undefined = selectActiveMaterial(state)?.id;
  const activeProfileId: string | undefined = selectActiveMachineProfile(state)?.id;

  if (!activeMaterialId || !activeProfileId) {
    return 0;
  }

  return getMaterialPresetCount(selectMaterialPresets(state), {
    materialId: activeMaterialId,
    machineProfileId: activeProfileId,
  });
};
