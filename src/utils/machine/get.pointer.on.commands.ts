/**
 * Builds the lines that switch the laser pointer on at a low power percent.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getClampedPointerPowerPercent } from './get.clamped.pointer.power.percent';
import { MIN_POINTER_S_VALUE, POINTER_FEED_RATE } from './machine.command.constants';
import { POINTER_FEED_COMMAND_PREFIX, POINTER_ON_COMMAND_PREFIX } from './machine.commands';
import { PERCENT_DIVISOR } from '../percent.constants';

export const getPointerOnCommands = (percent: number, sValueMax: number): string[] => {
  const clampedPercent: number = getClampedPointerPowerPercent(percent);
  const sValue: number = Math.max(Math.round(sValueMax * clampedPercent / PERCENT_DIVISOR), MIN_POINTER_S_VALUE);

  return [`${POINTER_ON_COMMAND_PREFIX}${sValue}`, `${POINTER_FEED_COMMAND_PREFIX}${POINTER_FEED_RATE}`];
};
