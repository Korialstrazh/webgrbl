/**
 * Writes the toolpath as GRBL 1.1 laser G-code. Each layer in the toolpath is already an enabled layer, so nothing
 * else is written.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getFormattedGcodeNumber } from '../machine/format.gcode.number';
import { getGcodeHeaderLines } from './get.gcode.header.lines';
import { getGcodeSValue } from './get.gcode.s.value';
import { getOriginMappedPoint } from './get.origin.mapped.point';
import type { GcodeContext } from './interfaces/GcodeContext';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import {
  GCODE_AIR_ASSIST_OFF,
  GCODE_AIR_ASSIST_ON,
  GCODE_BURN_WORD,
  GCODE_F_PREFIX,
  GCODE_LASER_MODE_ON,
  GCODE_LASER_OFF_END,
  GCODE_LINE_SEPARATOR,
  GCODE_S_PREFIX,
  GCODE_TRAVEL_WORD,
  GCODE_UNITS_AND_ABSOLUTE,
  GCODE_WORD_SEPARATOR,
  GCODE_X_PREFIX,
  GCODE_Y_PREFIX,
} from './gcode.constants';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

export const getGcodeText = (toolpath: Toolpath, context: GcodeContext): string => {
  const lines: string[] = [...getGcodeHeaderLines(context), GCODE_UNITS_AND_ABSOLUTE, GCODE_LASER_MODE_ON];
  let lastS: string | undefined;
  let lastF: string | undefined;
  let isAirOn = false;

  for (const move of toolpath.moves) {
    const isAirWanted: boolean = context.hasAirAssist && move.airAssist;

    if (isAirWanted !== isAirOn) {
      lines.push(isAirWanted ? GCODE_AIR_ASSIST_ON : GCODE_AIR_ASSIST_OFF);
      isAirOn = isAirWanted;
    }

    const mappedPoint = getOriginMappedPoint(move.to, context.originCorner, context);
    const words: string[] = [
      getMoveWord(move),
      `${GCODE_X_PREFIX}${getFormattedGcodeNumber(mappedPoint.x)}`,
      `${GCODE_Y_PREFIX}${getFormattedGcodeNumber(mappedPoint.y)}`,
    ];

    if (move.kind === TOOLPATH_MOVE_KIND.BURN) {
      const sText: string = String(getGcodeSValue(move.powerPercent, context.sValueMax));
      const feedText: string = getFormattedGcodeNumber(move.feedMmPerMin);

      if (sText !== lastS) {
        words.push(`${GCODE_S_PREFIX}${sText}`);
        lastS = sText;
      }

      if (feedText !== lastF) {
        words.push(`${GCODE_F_PREFIX}${feedText}`);
        lastF = feedText;
      }
    }

    lines.push(words.join(GCODE_WORD_SEPARATOR));
  }

  if (isAirOn) {
    lines.push(GCODE_AIR_ASSIST_OFF);
  }

  lines.push(GCODE_LASER_OFF_END, '');

  return lines.join(GCODE_LINE_SEPARATOR);
};

const getMoveWord = (move: ToolpathMove): string =>
  move.kind === TOOLPATH_MOVE_KIND.BURN ? GCODE_BURN_WORD : GCODE_TRAVEL_WORD;
