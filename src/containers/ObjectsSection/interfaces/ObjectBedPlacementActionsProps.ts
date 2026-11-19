/**
 * Props of the Move onto bed and Fit to bed buttons of an object outside the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';

export interface ObjectBedPlacementActionsProps {
  /** The object outside the bed that the buttons place. */
  projectObject: ProjectObject;
}
