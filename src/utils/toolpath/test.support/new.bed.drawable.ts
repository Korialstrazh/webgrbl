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
import { newDrawablePaint } from './new.drawable.paint';

const TEST_OBJECT_ID = 'test-object';

export const newBedDrawable = (overrides: Partial<BedDrawable> = {}): BedDrawable => ({
  objectId: TEST_OBJECT_ID,
  subpaths: [],
  paint: newDrawablePaint(),
  paintOrder: 0,
  ...overrides,
});
