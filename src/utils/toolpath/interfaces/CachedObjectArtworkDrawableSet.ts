/**
 * The flattened artwork of one project object, with the key of the inputs it was flattened from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ObjectArtworkDrawableSet } from './ObjectArtworkDrawableSet';

export interface CachedObjectArtworkDrawableSet {
  /** The SVG text, intrinsic size and tolerance, joined; a different key means the entry is out of date. */
  artworkKey: string;
  /** The flattened shapes in user units and the warning kinds. */
  artworkDrawableSet: ObjectArtworkDrawableSet;
}
