/**
 * Builds a material preset with a new id from the fields that have no sensible default.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from './interfaces/MaterialPreset';

type MaterialPresetFields = Omit<MaterialPreset, 'id'>;

export const newMaterialPreset = (fields: MaterialPresetFields): MaterialPreset => ({
  id: crypto.randomUUID(),
  ...fields,
});
