/**
 * Props of the fields of the layer settings drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';

export interface LayerSettingsFieldsProps {
  layer: ProjectLayer;
  onEditPalette: () => void;
}
