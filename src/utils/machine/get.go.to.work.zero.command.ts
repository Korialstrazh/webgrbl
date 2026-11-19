/**
 * Builds the jog line that moves to the work origin.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getFormattedGcodeNumber } from './format.gcode.number';
import { JOG_ABSOLUTE_PREFIX } from './machine.commands';

export const getGoToWorkZeroCommand = (feedRate: number): string =>
  `${JOG_ABSOLUTE_PREFIX} X0 Y0 F${getFormattedGcodeNumber(feedRate)}`;
