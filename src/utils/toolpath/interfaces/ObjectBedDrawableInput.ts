/**
 * What is needed to give the drawables of one project object in bed millimetres, numbered from the first free
 * paint order.
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
import type { SvgMatrix } from '../../svg/geometry/interfaces/SvgMatrix';

export interface ObjectBedDrawableInput {
  /** The object the drawables belong to. */
  projectObject: ProjectObject;
  /** Its drawables in user units. */
  svgDrawables: SvgDrawable[];
  /** Its matrix from user units to bed millimetres. */
  matrix: SvgMatrix;
  /** The paint order of its first drawable. */
  firstPaintOrder: number;
}
