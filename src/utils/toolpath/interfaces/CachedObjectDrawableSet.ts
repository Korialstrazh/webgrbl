/**
 * The drawables of one project object as last parsed, with the key of the object fields they were made from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedDrawableSet } from './BedDrawableSet';

export interface CachedObjectDrawableSet {
  /** The SVG text and placement fields of the object, joined; a different key means the entry is out of date. */
  objectKey: string;
  /** The object's drawables, with paint orders counted from 0, and its warnings. */
  drawableSet: BedDrawableSet;
}
