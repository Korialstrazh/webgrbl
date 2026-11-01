/**
 * Test factory for a bed drawable with no subpaths and no paint unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDrawable } from '../interfaces/BedDrawable';

const TEST_OBJECT_ID = 'test-object';
const TEST_STROKE_WIDTH_MM = 1;

export const newBedDrawable = (overrides: Partial<BedDrawable> = {}): BedDrawable => ({
  objectId: TEST_OBJECT_ID,
  subpaths: [],
  paint: { fill: undefined, stroke: undefined, strokeWidth: TEST_STROKE_WIDTH_MM },
  paintOrder: 0,
  ...overrides,
});
