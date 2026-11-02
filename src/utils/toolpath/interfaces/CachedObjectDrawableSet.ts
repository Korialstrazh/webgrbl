/**
 * The drawables of one project object as last parsed, with the key of the object fields they were made from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDrawableSet } from './BedDrawableSet';

export interface CachedObjectDrawableSet {
  /** The SVG text and placement fields of the object, joined; a different key means the entry is out of date. */
  objectKey: string;
  /** The object's drawables, with paint orders counted from 0, and its warnings. */
  drawableSet: BedDrawableSet;
}
