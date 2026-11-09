/**
 * Props of the arrows on the bed edges that point to where an object runs off the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
