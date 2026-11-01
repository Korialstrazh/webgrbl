/**
 * Test factory for drawable paint with no fill or stroke, nonzero fill and no gradient mapping unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgDrawablePaint } from '../../svg/geometry/interfaces/SvgDrawablePaint';
import { SVG_FILL_RULE } from '../../svg/geometry/svg.geometry.constants';

const TEST_STROKE_WIDTH_MM = 1;

export const newDrawablePaint = (overrides: Partial<SvgDrawablePaint> = {}): SvgDrawablePaint => ({
  fill: undefined,
  stroke: undefined,
  strokeWidth: TEST_STROKE_WIDTH_MM,
  fillRule: SVG_FILL_RULE.NONZERO,
  fillGradientMatrix: undefined,
  strokeGradientMatrix: undefined,
  ...overrides,
});
