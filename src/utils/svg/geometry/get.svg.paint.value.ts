/**
 * Reads a fill or stroke value: a lowercase #rrggbb, none or a url(#id) reference; anything else falls back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getNormalizedColour } from '../../palette/normalize.colour';
import { SVG_PAINT_NONE, SVG_PAINT_URL_PATTERN } from './svg.geometry.constants';

export const getSvgPaintValue = (value: string | undefined, fallback: string): string => {
  if (!value) {
    return fallback;
  }

  const trimmedValue: string = value.trim();

  if (trimmedValue.toLowerCase() === SVG_PAINT_NONE) {
    return SVG_PAINT_NONE;
  }

  const urlMatch: RegExpMatchArray | null = trimmedValue.match(SVG_PAINT_URL_PATTERN);

  return urlMatch ? urlMatch[0] : (getNormalizedColour(trimmedValue) ?? fallback);
};
