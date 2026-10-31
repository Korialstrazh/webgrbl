/**
 * Keeps a laser pointer power percent inside the allowed range, so the pointer never fires above its cap.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { MAX_POINTER_POWER_PERCENT, MIN_POINTER_POWER_PERCENT } from './machine.command.constants';

export const getClampedPointerPowerPercent = (percent: number): number =>
  Math.min(Math.max(percent, MIN_POINTER_POWER_PERCENT), MAX_POINTER_POWER_PERCENT);
