/**
 * What placing one project object's flattened artwork on the bed needs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { SvgViewBox } from '../../svg/interfaces/SvgViewBox';
import type { ObjectArtworkDrawableSet } from './ObjectArtworkDrawableSet';

export interface ObjectPlacedDrawableInput {
  /** The object, for its id and placement. */
  projectObject: ProjectObject;
  /** Its flattened shapes in user units and its warning kinds. */
  artworkDrawableSet: ObjectArtworkDrawableSet;
  /** Its root viewBox, or undefined when it has none. */
  viewBox: SvgViewBox | undefined;
  /** The paint order of its first drawable. */
  firstPaintOrder: number;
}
