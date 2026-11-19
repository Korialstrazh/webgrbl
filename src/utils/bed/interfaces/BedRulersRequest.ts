/**
 * What laying out the bed rulers needs: the viewport frame and the root font size, which turns the rem sizes of the
 * ruler text into pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedViewportFrame } from './BedViewportFrame';

export interface BedRulersRequest extends BedViewportFrame {
  rootFontSizePx: number;
}
