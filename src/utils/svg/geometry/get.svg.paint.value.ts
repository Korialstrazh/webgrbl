/**
 * Reads a fill or stroke value into none, a colour with its alpha, or a url(#id) gradient reference. An unset
 * value is inherited; a value that cannot be read, and transparent, is no paint. A reference to a missing gradient
 * uses its fallback colour, if any.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgPaintContext } from './interfaces/SvgPaintContext';
import type { SvgResolvedPaint } from './interfaces/SvgResolvedPaint';
import {
  SVG_CURRENT_COLOUR_KEYWORD,
  SVG_DEFAULT_OPACITY,
  SVG_INHERITING_KEYWORDS,
  SVG_PAINT_NONE,
  SVG_PAINT_URL_PATTERN,
} from './svg.geometry.constants';
import { TRANSPARENT_ALPHA } from '../../palette/colour.constants';
import { getParsedColour } from '../../palette/get.parsed.colour';
import type { ParsedColour } from '../../palette/interfaces/ParsedColour';

const NO_PAINT: SvgResolvedPaint = { value: SVG_PAINT_NONE, alpha: SVG_DEFAULT_OPACITY };

const getColourPaint = (colourText: string, context: SvgPaintContext): SvgResolvedPaint => {
  if (SVG_INHERITING_KEYWORDS.includes(colourText.toLowerCase())) {
    return context.parentPaint;
  }

  if (colourText.toLowerCase() === SVG_CURRENT_COLOUR_KEYWORD) {
    return { value: context.currentColour, alpha: SVG_DEFAULT_OPACITY };
  }

  const parsedColour: ParsedColour | undefined = getParsedColour(colourText);

  if (!parsedColour || parsedColour.alpha <= TRANSPARENT_ALPHA) {
    return NO_PAINT;
  }

  return { value: parsedColour.colour, alpha: parsedColour.alpha };
};

export const getSvgPaintValue = (value: string | undefined, context: SvgPaintContext): SvgResolvedPaint => {
  const trimmedValue: string = value?.trim() ?? '';

  if (!trimmedValue) {
    return context.parentPaint;
  }

  const urlMatch: RegExpMatchArray | null = trimmedValue.match(SVG_PAINT_URL_PATTERN);

  if (!urlMatch) {
    return getColourPaint(trimmedValue, context);
  }

  const fallbackText: string = trimmedValue.slice(urlMatch[0].length).trim();

  if (context.gradientIds.has(urlMatch[1] ?? '')) {
    return { value: urlMatch[0], alpha: SVG_DEFAULT_OPACITY };
  }

  return fallbackText ? getColourPaint(fallbackText, context) : NO_PAINT;
};
