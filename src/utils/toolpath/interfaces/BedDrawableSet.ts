/**
 * Every drawn shape of a project in bed millimetres, with the warnings about content left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedDrawable } from './BedDrawable';
import type { ObjectWarning } from './ObjectWarning';

export interface BedDrawableSet {
  /** The shapes of all objects in paint order. */
  drawables: BedDrawable[];
  /** One warning per object and kind of content that cannot be drawn. */
  warnings: ObjectWarning[];
}
