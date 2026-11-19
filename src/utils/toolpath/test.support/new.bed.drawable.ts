/**
 * Test factory for a bed drawable with no subpaths and no paint unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
