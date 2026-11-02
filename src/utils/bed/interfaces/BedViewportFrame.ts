/**
 * What turning the view's pixels into bed millimetres needs: the viewport, the size of the view and the bed size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDimensions } from './BedDimensions';
import type { BedScreenSize } from './BedScreenSize';
import type { BedViewport } from './BedViewport';

export interface BedViewportFrame {
  viewport: BedViewport;
  screenSize: BedScreenSize;
  dimensions: BedDimensions;
}
