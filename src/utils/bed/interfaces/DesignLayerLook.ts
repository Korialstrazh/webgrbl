/**
 * How the Design view draws the paths of one layer: by its mode, dimmed while it is off, outlined in its colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerMode } from '../../palette/palette.constants';

export interface DesignLayerLook {
  /** Line layers draw outlines only; fill and shading layers draw filled. */
  mode: LayerMode;
  /** Whether the layer goes to the laser; an off layer is drawn dimmed. */
  isEnabled: boolean;
  /** The layer colour as #rrggbb, the colour of a Line layer's outlines. */
  colour: string;
}
