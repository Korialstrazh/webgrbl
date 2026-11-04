/**
 * What the MaterialPresetSaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from '../../materials/interfaces/MaterialPreset';

export interface MaterialPresetPayload {
  /** The preset to add, or to replace when its id already exists. */
  preset: MaterialPreset;
}
