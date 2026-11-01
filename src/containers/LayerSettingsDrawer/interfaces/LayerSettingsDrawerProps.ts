/**
 * Props of the layer settings drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';

export interface LayerSettingsDrawerProps {
  /** The layer whose settings are shown; undefined keeps the drawer closed. */
  layer: ProjectLayer | undefined;
  onClose: () => void;
  /** Called when the user asks to edit the palette. */
  onEditPalette: () => void;
}
