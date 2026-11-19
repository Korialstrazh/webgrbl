/**
 * What a layer swatch needs: the layer colour and whether it is the shading layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface LayerSwatchProps {
  /** Colour as #rrggbb; ignored for the shading layer, which shows the black to white bar. */
  colour: string;
  /** Whether to draw the black to white bar of the shading layer. */
  isShading: boolean;
}
