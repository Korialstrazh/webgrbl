/**
 * Tells whether two presets hold the same values. The library compares its draft with the stored preset to know
 * whether there is something to save.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from './interfaces/MaterialPreset';

export const isSameMaterialPreset = (first: MaterialPreset, second: MaterialPreset): boolean =>
  first.id === second.id
  && first.materialId === second.materialId
  && first.machineProfileId === second.machineProfileId
  && first.operation === second.operation
  && Object.is(first.powerWatts, second.powerWatts)
  && Object.is(first.speedMmPerMin, second.speedMmPerMin)
  && Object.is(first.passes, second.passes)
  && first.notes === second.notes;
