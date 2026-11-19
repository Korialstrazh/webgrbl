/**
 * The artwork frame of a box whose drawing fills it, used when an object has no measurable geometry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ObjectArtworkFrame } from './interfaces/ObjectArtworkFrame';

export const FULL_OBJECT_ARTWORK_FRAME: ObjectArtworkFrame = {
  leftFraction: 0,
  topFraction: 0,
  widthFraction: 1,
  heightFraction: 1,
};
