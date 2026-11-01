/**
 * One painted shape of a project object, flattened to line segments in bed millimetres (front-left origin, Y up). Its
 * paint order counts across the whole project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { SvgDrawable } from '../../svg/geometry/interfaces/SvgDrawable';

export interface BedDrawable extends SvgDrawable {
  /** Id of the project object the shape belongs to. */
  objectId: ProjectObject['id'];
}
