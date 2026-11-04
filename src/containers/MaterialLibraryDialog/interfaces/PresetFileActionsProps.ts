/**
 * Props of the import and export buttons of the material library.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';

export interface PresetFileActionsProps {
  /** The presets the user ticked, which Export writes. */
  selectedPresets: MaterialPreset[];
}
