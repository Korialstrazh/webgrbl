/**
 * Writes the palette as a GIMP palette (.gpl) that Inkscape can load, one line per entry with its RGB values and
 * name.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Palette } from './interfaces/Palette';
import type { PaletteEntry } from './interfaces/PaletteEntry';
import { COLOUR_CHANNEL_MAX, HEX_CHANNEL_DIGITS, HEX_RADIX } from './colour.constants';
import { getNormalizedColour } from './normalize.colour';
import { PALETTE_EXPORT_COLUMNS, PALETTE_EXPORT_NAME } from './palette.constants';

const GPL_HEADER_LINE = 'GIMP Palette';
const GPL_COMMENT_LINE = '#';
const GPL_CHANNEL_WIDTH = String(COLOUR_CHANNEL_MAX).length;
const GPL_LINE_BREAK = '\n';
const GPL_FIELD_SEPARATOR = ' ';
const LINE_BREAK_PATTERN = /[\r\n]+/g;
const CHANNEL_HEX_START_INDICES: number[] = [1, 3, 5];

const getChannelText = (colour: string, startIndex: number): string =>
  String(parseInt(colour.slice(startIndex, startIndex + HEX_CHANNEL_DIGITS), HEX_RADIX)).padStart(GPL_CHANNEL_WIDTH);

const getPaletteEntryLine = (entry: PaletteEntry): string | undefined => {
  const colour: string | undefined = getNormalizedColour(entry.colour);

  if (!colour) {
    return undefined;
  }

  const channelTexts: string[] = CHANNEL_HEX_START_INDICES.map(
    (startIndex: number): string => getChannelText(colour, startIndex),
  );

  return [...channelTexts, entry.name.replace(LINE_BREAK_PATTERN, GPL_FIELD_SEPARATOR)].join(GPL_FIELD_SEPARATOR);
};

export const getInkscapePaletteText = (palette: Palette): string => {
  const entryLines: string[] = [];

  for (const entry of palette.entries) {
    const entryLine: string | undefined = getPaletteEntryLine(entry);

    if (entryLine) {
      entryLines.push(entryLine);
    }
  }

  const lines: string[] = [
    GPL_HEADER_LINE,
    `Name: ${PALETTE_EXPORT_NAME}`,
    `Columns: ${PALETTE_EXPORT_COLUMNS}`,
    GPL_COMMENT_LINE,
    ...entryLines,
  ];

  return lines.join(GPL_LINE_BREAK) + GPL_LINE_BREAK;
};
