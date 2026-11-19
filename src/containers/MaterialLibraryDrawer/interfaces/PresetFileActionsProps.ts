/**
 * Props of the import and export buttons of the material library.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';

export interface PresetFileActionsProps {
  /** The presets the user ticked, which Export writes. */
  selectedPresets: MaterialPreset[];
}
