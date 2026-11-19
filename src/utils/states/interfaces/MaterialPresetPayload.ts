/**
 * What the MaterialPresetSaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from '../../materials/interfaces/MaterialPreset';

export interface MaterialPresetPayload {
  /** The preset to add, or to replace when its id already exists. */
  preset: MaterialPreset;
}
