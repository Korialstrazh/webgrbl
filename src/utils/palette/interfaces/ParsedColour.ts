/**
 * A colour read from text: its #rrggbb value and its alpha.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ParsedColour {
  /** Colour as lowercase #rrggbb. */
  colour: string;
  /** Opacity of the colour from 0 (transparent) to 1 (opaque). */
  alpha: number;
}
