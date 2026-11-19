/**
 * Props of the objects layer on the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedDimensions } from '../../../utils/bed/interfaces/BedDimensions';

export interface BedObjectsProps {
  /** The bed the objects are drawn on; its height turns machine Y into SVG Y. */
  dimensions: BedDimensions;
}
