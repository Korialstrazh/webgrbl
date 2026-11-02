/**
 * How one burn path group is coloured: by a stylesheet class, or by a colour taken from the design.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnPathColour {
  /** Class that sets the stroke colour; undefined when the stroke colour is given directly. */
  colourClassName: string | undefined;
  /** Stroke colour as #rrggbb, the layer colour; undefined when a class colours the path. */
  strokeColour: string | undefined;
}
