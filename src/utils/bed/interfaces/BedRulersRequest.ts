/**
 * What laying out the bed rulers needs: the viewport frame and the root font size, which turns the rem sizes of the
 * ruler text into pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedViewportFrame } from './BedViewportFrame';

export interface BedRulersRequest extends BedViewportFrame {
  rootFontSizePx: number;
}
