/**
 * Props of the part of the material library that applies a preset to a layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';

export interface PresetLayerApplyProps {
  /** The stored preset to apply. */
  preset: MaterialPreset;
  /** Rated power of the active laser, in watts. */
  maxPowerWatts: number;
  /** The layer picked at the start, when the library was opened from one. */
  initialLayerKey: string | undefined;
}
