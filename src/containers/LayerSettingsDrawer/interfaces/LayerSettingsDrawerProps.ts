/**
 * Props of the layer settings drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';

export interface LayerSettingsDrawerProps {
  /** The layer whose settings are shown; undefined keeps the drawer closed. */
  layer: ProjectLayer | undefined;
  onClose: () => void;
  /** Called when the user asks to edit the palette. */
  onEditPalette: () => void;
}
