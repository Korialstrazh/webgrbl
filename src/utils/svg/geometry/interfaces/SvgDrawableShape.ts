/**
 * A drawable before it gets its place in the paint order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgDrawable } from './SvgDrawable';

export type SvgDrawableShape = Omit<SvgDrawable, 'paintOrder'>;
