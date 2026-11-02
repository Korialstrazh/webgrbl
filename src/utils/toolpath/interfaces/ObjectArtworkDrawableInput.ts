/**
 * What flattening one project object's artwork needs: the object, its parsed SVG and the flattening tolerance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { ObjectSvgSource } from './ObjectSvgSource';

export interface ObjectArtworkDrawableInput {
  /** The object, for its id and intrinsic size. */
  projectObject: ProjectObject;
  /** Its parsed SVG. */
  svgSource: ObjectSvgSource;
  /** The largest distance a flattened outline may be from the true curve, in user units. */
  toleranceUserUnits: number;
}
