/**
 * The material of the open project and its test result on the active machine profile. These read several states, so
 * they live apart from the material state. A result belongs to one laser, so another profile's result is never
 * returned.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from '../materials/interfaces/Material';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from './machine.profile.state';
import { selectMaterials } from './material.state';
import { selectProjectDocument } from './project.document.state';

type RootState =
  & Parameters<typeof selectMaterials>[0]
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
