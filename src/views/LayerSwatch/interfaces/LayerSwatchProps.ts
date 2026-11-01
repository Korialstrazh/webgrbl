/**
 * What a layer swatch needs: the layer colour and whether it is the shading layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface LayerSwatchProps {
  /** Colour as #rrggbb; ignored for the shading layer, which shows the black to white bar. */
  colour: string;
  /** Whether to draw the black to white bar of the shading layer. */
  isShading: boolean;
}
