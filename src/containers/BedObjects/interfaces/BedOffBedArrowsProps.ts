/**
 * Props of the arrows on the bed edges that point to where an object runs off the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedDimensions } from '../../../utils/bed/interfaces/BedDimensions';
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';

export interface BedOffBedArrowsProps {
  /** The object as drawn, with a drag or handle gesture in progress. */
  projectObject: ProjectObject;
  /** The bed the arrows sit on. */
  bed: BedDimensions;
  /** Length of an arrow in bed millimetres, so it keeps one size on screen at every zoom. */
  arrowSize: number;
}
