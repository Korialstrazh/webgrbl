/**
 * Builds the relative jog line for a direction, step and feed rate.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getFormattedGcodeNumber } from './format.gcode.number';
import { JOG_DIRECTION_AXIS_SIGNS } from './machine.command.constants';
import type { JogDirection } from './machine.command.constants';
import { JOG_RELATIVE_PREFIX } from './machine.commands';
import type { JogAxisSigns } from './interfaces/JogAxisSigns';

export const getJogCommand = (direction: JogDirection, stepMm: number, feedRate: number): string => {
  const { xSign, ySign }: JogAxisSigns = JOG_DIRECTION_AXIS_SIGNS[direction];
  const words: string[] = [JOG_RELATIVE_PREFIX];

  if (xSign) {
    words.push(`X${getFormattedGcodeNumber(xSign * stepMm)}`);
  }

  if (ySign) {
    words.push(`Y${getFormattedGcodeNumber(ySign * stepMm)}`);
  }

  words.push(`F${getFormattedGcodeNumber(feedRate)}`);

  return words.join(' ');
};
