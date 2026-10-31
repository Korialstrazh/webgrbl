/**
 * Builds the jog line that moves to the work origin.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getFormattedGcodeNumber } from './format.gcode.number';
import { JOG_ABSOLUTE_PREFIX } from './machine.commands';

export const getGoToWorkZeroCommand = (feedRate: number): string =>
  `${JOG_ABSOLUTE_PREFIX} X0 Y0 F${getFormattedGcodeNumber(feedRate)}`;
