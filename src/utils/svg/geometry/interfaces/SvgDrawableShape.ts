/**
 * A drawable before it gets its place in the paint order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgDrawable } from './SvgDrawable';

export type SvgDrawableShape = Omit<SvgDrawable, 'paintOrder'>;
