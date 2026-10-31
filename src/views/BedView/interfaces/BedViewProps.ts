/**
 * What the bed drawing needs: the bed size, the laser head and work zero positions, and an optional centred text.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDimensions } from '../../../utils/bed/interfaces/BedDimensions';
import type { GrblAxisPosition } from '../../../utils/grbl/interfaces/GrblAxisPosition';

export interface BedViewProps {
  dimensions: BedDimensions;
  /** The laser head in machine coordinates; undefined until a position is known. */
  headPosition: GrblAxisPosition | undefined;
  /** The work zero as a machine coordinate. */
  workOriginPosition: GrblAxisPosition | undefined;
  /** Text centred on the bed, for example when there is no machine yet. */
  placeholderLabel: string | undefined;
}
