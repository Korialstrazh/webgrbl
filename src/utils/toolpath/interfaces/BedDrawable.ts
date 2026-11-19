/**
 * One painted shape of a project object, flattened to line segments in bed millimetres (front-left origin, Y up). Its
 * paint order counts across the whole project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { SvgDrawable } from '../../svg/geometry/interfaces/SvgDrawable';

export interface BedDrawable extends SvgDrawable {
  /** Id of the project object the shape belongs to. */
  objectId: ProjectObject['id'];
}
