/**
 * Checks a console height read from storage: one finite percentage of the bed column, above 0 and below 100.
 * Anything else gives undefined, so the caller falls back to the default height instead of a broken layout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PANEL_SIZE_PERCENT_TOTAL } from '../layout.constants';
import { isFiniteNumber } from '../type.guards/is.finite.number';

const isConsoleSizePercent = (storedValue: unknown): storedValue is number =>
  isFiniteNumber(storedValue) && storedValue > 0 && storedValue < PANEL_SIZE_PERCENT_TOTAL;

export const getValidConsoleSizePercent = (storedValue: unknown): number | undefined =>
  isConsoleSizePercent(storedValue) ? storedValue : undefined;
