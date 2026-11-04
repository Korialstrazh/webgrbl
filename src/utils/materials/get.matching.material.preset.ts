/**
 * Finds the stored preset that does the same job as a new one: same material, same operation and same machine. The
 * layer drawer asks whether to update it instead of adding a twin row.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from './interfaces/MaterialPreset';

type MaterialPresetJob = Pick<MaterialPreset, 'materialId' | 'machineProfileId' | 'operation'>;

export const getMatchingMaterialPreset = (
  presets: MaterialPreset[],
  { materialId, machineProfileId, operation }: MaterialPresetJob,
): MaterialPreset | undefined => presets.find((preset: MaterialPreset): boolean =>
  preset.materialId === materialId && preset.machineProfileId === machineProfileId && preset.operation === operation);
