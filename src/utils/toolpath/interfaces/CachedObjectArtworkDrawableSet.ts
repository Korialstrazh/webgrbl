/**
 * The flattened artwork of one project object, with the key of the inputs it was flattened from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ObjectArtworkDrawableSet } from './ObjectArtworkDrawableSet';

export interface CachedObjectArtworkDrawableSet {
  /** The SVG text, intrinsic size and tolerance, joined; a different key means the entry is out of date. */
  artworkKey: string;
  /** The flattened shapes in user units and the warning kinds. */
  artworkDrawableSet: ObjectArtworkDrawableSet;
}
