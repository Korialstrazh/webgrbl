/**
 * What is needed to give the drawables of one project object in bed millimetres, numbered from the first free
 * paint order.
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
