/**
 * How one burn path group is coloured: by a stylesheet class, or by a colour taken from the design.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnPathColour {
  /** Class that sets the stroke colour; undefined when the stroke colour is given directly. */
  colourClassName: string | undefined;
  /** Stroke colour as #rrggbb, the layer colour; undefined when a class colours the path. */
  strokeColour: string | undefined;
}
