/**
 * Props of the objects layer on the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDimensions } from '../../../utils/bed/interfaces/BedDimensions';

export interface BedObjectsProps {
  /** The bed the objects are drawn on; its height turns machine Y into SVG Y. */
  dimensions: BedDimensions;
}
