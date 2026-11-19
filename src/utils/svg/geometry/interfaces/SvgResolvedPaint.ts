/**
 * A fill or stroke after reading: a #rrggbb colour, none, or a url(#id) reference, with the alpha of the colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SvgResolvedPaint {
  /** Lowercase #rrggbb, none, or a url(#id) reference. */
  value: string;
  /** Alpha of the colour itself, from 0 to 1. */
  alpha: number;
}
