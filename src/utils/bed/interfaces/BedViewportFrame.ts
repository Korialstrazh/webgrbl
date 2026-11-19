/**
 * What turning the view's pixels into bed millimetres needs: the viewport, the size of the view and the bed size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedDimensions } from './BedDimensions';
import type { BedScreenSize } from './BedScreenSize';
import type { BedViewport } from './BedViewport';

export interface BedViewportFrame {
  viewport: BedViewport;
  screenSize: BedScreenSize;
  dimensions: BedDimensions;
}
