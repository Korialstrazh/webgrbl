/**
 * Test factory for drawable paint with no fill or stroke, nonzero fill and no gradient mapping unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
