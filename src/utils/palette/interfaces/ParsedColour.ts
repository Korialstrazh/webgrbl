/**
 * A colour read from text: its #rrggbb value and its alpha.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ParsedColour {
  /** Colour as lowercase #rrggbb. */
  colour: string;
  /** Opacity of the colour from 0 (transparent) to 1 (opaque). */
  alpha: number;
}
