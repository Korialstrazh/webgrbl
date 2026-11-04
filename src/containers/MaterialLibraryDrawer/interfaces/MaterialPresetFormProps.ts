/**
 * Props of the edit panel of the material library. The panel edits a draft its parent owns, so the parent knows
 * whether there is something to save and keeps the draft after a save.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
  onCancel: () => void;
  onDelete: () => void;
}
