/**
 * Gets the paints an object's SVG text draws with. Reading an SVG is slow and the same text is read again after every
 * change and undo, so the result is kept per text in a small cache that drops the least recently used text first.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { OBJECT_PAINTS_CACHE_SIZE } from './layer.constants';
import { getSvgPaints } from '../svg/geometry/get.svg.paints';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';

const PAINTS_BY_SVG_TEXT: Map<string, SvgPaint[]> = new Map<string, SvgPaint[]>();

const dropLeastRecentlyUsedPaints = (): void => {
  const oldestEntry: IteratorResult<string> = PAINTS_BY_SVG_TEXT.keys().next();

  if (!oldestEntry.done) {
    PAINTS_BY_SVG_TEXT.delete(oldestEntry.value);
  }
};

export const getObjectPaints = (svgText: string): SvgPaint[] => {
  const cachedPaints: SvgPaint[] | undefined = PAINTS_BY_SVG_TEXT.get(svgText);
  const objectPaints: SvgPaint[] = cachedPaints ?? getSvgPaints(svgText);

  // Deleting and setting again moves the text to the end, so the first key is always the least recently used.
  PAINTS_BY_SVG_TEXT.delete(svgText);
  PAINTS_BY_SVG_TEXT.set(svgText, objectPaints);

  if (PAINTS_BY_SVG_TEXT.size > OBJECT_PAINTS_CACHE_SIZE) {
    dropLeastRecentlyUsedPaints();
  }

  return objectPaints;
};
