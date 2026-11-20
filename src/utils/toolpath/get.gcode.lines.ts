/**
 * Writes the toolpath as GRBL 1.1 laser G-code lines, each with the index of the move it carries out. Each layer
 * in the toolpath is already an enabled layer, so nothing else is written.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
import type { GcodeLine } from './interfaces/GcodeLine';
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

const getUnmappedGcodeLine = (text: string): GcodeLine => ({ text, moveIndex: undefined });

export const getGcodeLines = (toolpath: Toolpath, context: GcodeContext): GcodeLine[] => {
  const lines: GcodeLine[] = [...getGcodeHeaderLines(context), GCODE_UNITS_AND_ABSOLUTE, GCODE_LASER_MODE_ON].map(
    getUnmappedGcodeLine,
  );
  const lastWords: GcodeLastWords = { powerText: undefined, feedText: undefined };
  let isAirOn = false;

  for (const [moveIndex, move] of toolpath.moves.entries()) {
    const isAirWanted: boolean = context.hasAirAssist && move.airAssist;

    if (isAirWanted !== isAirOn) {
      lines.push(getUnmappedGcodeLine(isAirWanted ? GCODE_AIR_ASSIST_ON : GCODE_AIR_ASSIST_OFF));
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

    lines.push({ text: words.join(GCODE_WORD_SEPARATOR), moveIndex });
  }

  if (isAirOn) {
    lines.push(getUnmappedGcodeLine(GCODE_AIR_ASSIST_OFF));
  }

  lines.push(getUnmappedGcodeLine(GCODE_LASER_OFF_END), getUnmappedGcodeLine(''));

  return lines;
};
