/**
 * What the bed drawing needs: the bed size, the laser head and work zero positions, an optional centred text, and the
 * content drawn on the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import type { BedDimensions } from '../../../utils/bed/interfaces/BedDimensions';
import type { BedViewBox } from '../../../utils/bed/interfaces/BedViewBox';
import type { GrblAxisPosition } from '../../../utils/grbl/interfaces/GrblAxisPosition';

export interface BedViewProps {
  dimensions: BedDimensions;
  /** The laser head in machine coordinates; undefined until a position is known. */
  headPosition: GrblAxisPosition | undefined;
  /** The work zero as a machine coordinate. */
  workOriginPosition: GrblAxisPosition | undefined;
  /** The part of the bed in view; the whole bed when left out. */
  viewBox?: BedViewBox;
  /** How much larger than fitted the bed is drawn; markers shrink by it to keep their screen size. 1 if left out. */
  zoom?: number;
  /**
   * Drawn above the grid and below the head and work zero markers, in the SVG's own units: millimetres from the bed's
   * top-left corner with Y pointing down, so content turns machine Y into SVG Y itself (Y = bed height - machine Y).
   */
  children?: ReactNode;
}
