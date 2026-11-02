/**
 * What deciding the warnings of one project object needs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { SvgDrawableSet } from '../../svg/geometry/interfaces/SvgDrawableSet';
import type { SvgViewBox } from '../../svg/interfaces/SvgViewBox';

export interface ObjectWarningInput {
  /** The object, for its intrinsic size. */
  projectObject: ProjectObject;
  /** Its drawables in user units and its unsupported content. */
  drawableSet: SvgDrawableSet;
  /** Its root viewBox, or undefined when it has none. */
  viewBox: SvgViewBox | undefined;
  /** How far, in user units, geometry may stick out before it counts as off the page. */
  marginUserUnits: number;
}
