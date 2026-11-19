/**
 * Props of the fields of the layer settings drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';

export interface LayerSettingsFieldsProps {
  layer: ProjectLayer;
  onEditPalette: () => void;
}
