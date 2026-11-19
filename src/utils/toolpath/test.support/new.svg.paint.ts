/**
 * Test factory for an opaque flat paint, black unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgPaint } from '../../svg/geometry/interfaces/SvgPaint';

const TEST_PAINT_COLOUR = '#000000';

export const newSvgPaint = (overrides: Partial<SvgPaint> = {}): SvgPaint => ({
  colour: TEST_PAINT_COLOUR,
  opacity: 1,
  gradient: undefined,
  ...overrides,
});
