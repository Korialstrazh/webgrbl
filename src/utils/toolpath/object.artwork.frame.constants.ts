/**
 * The artwork frame of a box whose drawing fills it, used when an object has no measurable geometry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ObjectArtworkFrame } from './interfaces/ObjectArtworkFrame';

export const FULL_OBJECT_ARTWORK_FRAME: ObjectArtworkFrame = {
  leftFraction: 0,
  topFraction: 0,
  widthFraction: 1,
  heightFraction: 1,
};
