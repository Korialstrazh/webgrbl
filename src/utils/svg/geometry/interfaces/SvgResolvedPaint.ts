/**
 * A fill or stroke after reading: a #rrggbb colour, none, or a url(#id) reference, with the alpha of the colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgResolvedPaint {
  /** Lowercase #rrggbb, none, or a url(#id) reference. */
  value: string;
  /** Alpha of the colour itself, from 0 to 1. */
  alpha: number;
}
