/**
 * Builds the lines that switch the laser pointer on at a low power percent.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  MAX_POINTER_POWER_PERCENT,
  MIN_POINTER_POWER_PERCENT,
  MIN_POINTER_S_VALUE,
  PERCENT_DIVISOR,
  POINTER_FEED_RATE,
} from './machine.command.constants';
import { POINTER_FEED_COMMAND_PREFIX, POINTER_ON_COMMAND_PREFIX } from './machine.commands';

export const getPointerOnCommands = (percent: number, sValueMax: number): string[] => {
  const clampedPercent: number = Math.min(Math.max(percent, MIN_POINTER_POWER_PERCENT), MAX_POINTER_POWER_PERCENT);
  const sValue: number = Math.max(Math.round(sValueMax * clampedPercent / PERCENT_DIVISOR), MIN_POINTER_S_VALUE);

  return [`${POINTER_ON_COMMAND_PREFIX}${sValue}`, `${POINTER_FEED_COMMAND_PREFIX}${POINTER_FEED_RATE}`];
};
