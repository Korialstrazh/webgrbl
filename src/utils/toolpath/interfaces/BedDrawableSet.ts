/**
 * Every drawn shape of a project in bed millimetres, with the warnings about content left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDrawable } from './BedDrawable';
import type { ObjectWarning } from './ObjectWarning';

export interface BedDrawableSet {
  /** The shapes of all objects in paint order. */
  drawables: BedDrawable[];
  /** One warning per object and kind of content that cannot be drawn. */
  warnings: ObjectWarning[];
}
