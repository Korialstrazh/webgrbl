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
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
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
import { getGcodeHeaderLines } from './get.gcode.header.lines';
import { getGcodeSValue } from './get.gcode.s.value';
import { getOriginMappedPoint } from './get.origin.mapped.point';
import type { GcodeContext } from './interfaces/GcodeContext';
import type { GcodeLastWords } from './interfaces/GcodeLastWords';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

const getMoveWord = (move: ToolpathMove): string =>
  move.kind === TOOLPATH_MOVE_KIND.BURN ? GCODE_BURN_WORD : GCODE_TRAVEL_WORD;

/** The S and F words of a burn move; a word is left out while it still has the value the laser already has. */
const getBurnWords = (move: ToolpathMove, sValueMax: number, lastWords: GcodeLastWords): string[] => {
  const burnWords: string[] = [];
  const powerText: string = String(getGcodeSValue(move.powerPercent, sValueMax));
  const feedText: string = getFormattedGcodeNumber(move.feedMmPerMin);

  if (powerText !== lastWords.powerText) {
    burnWords.push(`${GCODE_S_PREFIX}${powerText}`);
    lastWords.powerText = powerText;
  }

  if (feedText !== lastWords.feedText) {
    burnWords.push(`${GCODE_F_PREFIX}${feedText}`);
    lastWords.feedText = feedText;
  }

  return burnWords;
};

export const getGcodeText = (toolpath: Toolpath, context: GcodeContext): string => {
  const lines: string[] = [...getGcodeHeaderLines(context), GCODE_UNITS_AND_ABSOLUTE, GCODE_LASER_MODE_ON];
  const lastWords: GcodeLastWords = { powerText: undefined, feedText: undefined };
  let isAirOn = false;

  for (const move of toolpath.moves) {
    const isAirWanted: boolean = context.hasAirAssist && move.airAssist;

    if (isAirWanted !== isAirOn) {
      lines.push(isAirWanted ? GCODE_AIR_ASSIST_ON : GCODE_AIR_ASSIST_OFF);
      isAirOn = isAirWanted;
    }

    const mappedPoint: GeometryPoint = getOriginMappedPoint(move.to, context.originCorner, context);
    const words: string[] = [
      getMoveWord(move),
      `${GCODE_X_PREFIX}${getFormattedGcodeNumber(mappedPoint.x)}`,
      `${GCODE_Y_PREFIX}${getFormattedGcodeNumber(mappedPoint.y)}`,
    ];

    if (move.kind === TOOLPATH_MOVE_KIND.BURN) {
      words.push(...getBurnWords(move, context.sValueMax, lastWords));
    }

    lines.push(words.join(GCODE_WORD_SEPARATOR));
  }

  if (isAirOn) {
    lines.push(GCODE_AIR_ASSIST_OFF);
  }

  lines.push(GCODE_LASER_OFF_END, '');

  return lines.join(GCODE_LINE_SEPARATOR);
};
