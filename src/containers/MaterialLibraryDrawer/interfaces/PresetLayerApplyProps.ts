/**
 * Props of the part of the edit view that applies the open preset to a layer the user names. It is always there,
 * so the user sees where applying happens; while nothing can be applied, its note says why.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';

export interface PresetLayerApplyProps {
  /**
   * The stored preset of the active laser to apply; undefined while the open preset is not stored or is another
   * laser's.
   */
  preset: MaterialPreset | undefined;
  /** Whether the open preset is stored: without a preset to apply, this tells a new one from one of another laser. */
  isPresetStored: boolean;
  /** Rated power of the active laser, in watts. */
  maxPowerWatts: number;
  /** The layer picked to apply to; the library keeps it when the user moves to another preset. */
  pickedLayerKey: string | undefined;
  onPickLayer: (layerKey: string) => void;
  /** Called with the text that says what was applied, which the library shows where it stays visible. */
  onApplied: (appliedText: string) => void;
}
