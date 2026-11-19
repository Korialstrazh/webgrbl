/**
 * Props of the edit view of the material library. The view edits a draft its parent owns, so the parent knows
 * whether there is something to save and keeps the draft after a save.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';

export type MaterialPresetChange = Partial<MaterialPreset>;

export interface MaterialPresetFormProps {
  /** The draft being edited; a new one is not stored yet and its numbers may not be valid. */
  preset: MaterialPreset;
  /** Whether a preset with this id is stored, which makes Delete available. */
  isStored: boolean;
  /** Whether the draft differs from what is stored, which makes Save the main action. */
  isChanged: boolean;
  /** Rated power of the laser of the preset, in watts. */
  maxPowerWatts: number;
  /** The heading above the fields: the name of the preset, or that it is new. */
  headingText: string;
  onChange: (change: MaterialPresetChange) => void;
  onSave: () => void;
  /** Goes back to the list; unsaved edits are dropped. */
  onBack: () => void;
  onDelete: () => void;
  /** Opens the dialog that adds a material, which becomes the material of the draft. */
  onNewMaterial: () => void;
}
