/**
 * Props of the edit panel of the material library.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';

export interface MaterialPresetFormProps {
  /** The preset being edited; a new one is not stored yet and its numbers may not be valid. */
  preset: MaterialPreset;
  /** Rated power of the laser of the preset, in watts. */
  maxPowerWatts: number;
  /** Called after a save or a delete. */
  onDone: () => void;
}
