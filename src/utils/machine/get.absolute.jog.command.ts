/**
 * Builds the absolute jog line to a work position in X and Y; Z is left out, so it stays where it is.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getFormattedGcodeNumber } from './format.gcode.number';
import { JOG_ABSOLUTE_PREFIX } from './machine.commands';

export const getAbsoluteJogCommand = (workPosition: GeometryPoint, feedRate: number): string => [
  JOG_ABSOLUTE_PREFIX,
  `X${getFormattedGcodeNumber(workPosition.x)}`,
  `Y${getFormattedGcodeNumber(workPosition.y)}`,
  `F${getFormattedGcodeNumber(feedRate)}`,
].join(' ');
