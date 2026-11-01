/**
 * The painting properties of one SVG element after attributes, rules, inline style and inheritance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgResolvedStyle {
  /** Lowercase #rrggbb, none, or a url(#id) reference. */
  fill: string;
  /** Lowercase #rrggbb, none, or a url(#id) reference. */
  stroke: string;
  /** Stroke width in user units. */
  strokeWidth: number;
  /** Opacity of this element times the opacity of all its ancestors. */
  opacity: number;
  /** Fill opacity from 0 to 1, inherited. */
  fillOpacity: number;
  /** Stroke opacity from 0 to 1, inherited. */
  strokeOpacity: number;
  /** False when the element or an ancestor has display none. */
  isDisplayed: boolean;
  /** False when the visibility is hidden, inherited from the parent unless the element sets it. */
  isVisible: boolean;
  /** Stop colour as lowercase #rrggbb; only meaningful on a gradient stop. */
  stopColour: string;
  /** Stop opacity from 0 to 1; only meaningful on a gradient stop. */
  stopOpacity: number;
}
