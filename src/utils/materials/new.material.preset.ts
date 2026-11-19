/**
 * Builds a material preset with a new id from the fields that have no sensible default.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from './interfaces/MaterialPreset';

type MaterialPresetFields = Omit<MaterialPreset, 'id'>;

export const newMaterialPreset = (fields: MaterialPresetFields): MaterialPreset => ({
  ...fields,
  id: crypto.randomUUID(),
});
