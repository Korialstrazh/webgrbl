/**
 * Props of the element tree of one object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../../../utils/project/interfaces/ProjectObject';

export interface ObjectElementTreeProps {
  /** The object whose SVG structure is listed. */
  projectObject: ProjectObject;
}
