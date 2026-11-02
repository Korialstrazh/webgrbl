/**
 * Test factory for a burn move of the red layer from the origin to (10, 0) at half power, unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathMove } from '../interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND } from '../toolpath.constants';

const TEST_LAYER_KEY = '#ff0000';
const TEST_MOVE_END_X_MM = 10;
const TEST_POWER_PERCENT = 50;
const TEST_FEED_MM_PER_MIN = 6000;

export const newToolpathMove = (overrides: Partial<ToolpathMove> = {}): ToolpathMove => ({
  kind: TOOLPATH_MOVE_KIND.BURN,
  from: { x: 0, y: 0 },
  to: { x: TEST_MOVE_END_X_MM, y: 0 },
  powerPercent: TEST_POWER_PERCENT,
  feedMmPerMin: TEST_FEED_MM_PER_MIN,
  layerKey: TEST_LAYER_KEY,
  airAssist: false,
  ...overrides,
});
