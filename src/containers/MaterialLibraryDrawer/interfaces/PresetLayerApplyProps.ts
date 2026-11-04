/**
 * Props of the part of the material library that applies a preset to a layer the user names.
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
  /** The layer picked to apply to; the library keeps it when the user moves to another preset. */
  pickedLayerKey: string | undefined;
  /** Whether the form beside holds unsaved edits: then Save is the main action and a note says what Apply uses. */
  isFormChanged: boolean;
  onPickLayer: (layerKey: string) => void;
  /** Called with the text that says what was applied, which the library shows where it stays visible. */
  onApplied: (appliedText: string) => void;
}
