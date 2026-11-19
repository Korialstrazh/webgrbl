/**
 * Props of the Move onto bed and Fit to bed buttons of an object outside the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';

export interface ObjectBedPlacementActionsProps {
  /** The object outside the bed that the buttons place. */
  projectObject: ProjectObject;
}
