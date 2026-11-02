/**
 * What placing one project object's flattened artwork on the bed needs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
