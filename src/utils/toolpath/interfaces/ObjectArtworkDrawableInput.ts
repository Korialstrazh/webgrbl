/**
 * What flattening one project object's artwork needs: the object, its parsed SVG and the flattening tolerance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
