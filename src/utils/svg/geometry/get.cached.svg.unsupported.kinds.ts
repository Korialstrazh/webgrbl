/**
 * Gets the kinds of content of an SVG that the job leaves out (text, images, ...), parsed once per SVG text and kept
 * for the most recent texts, so the Objects list does not parse an SVG again on every render or remount.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { TOOLPATH_TOLERANCE_MM } from '../../toolpath/toolpath.constants';
import { getSvgDrawables } from './get.svg.drawables';
import type { SvgUnsupportedKind } from './svg.shape.constants';

/** At most this many SVG texts are kept; a project rarely holds more distinct files. */
const CACHED_SVG_TEXT_COUNT_MAX = 64;

// Kinds by SVG text, oldest first; a hit moves its entry to the end.
const UNSUPPORTED_KINDS_BY_SVG_TEXT: Map<string, SvgUnsupportedKind[]> = new Map<string, SvgUnsupportedKind[]>();

export const getCachedSvgUnsupportedKinds = (svgText: string): SvgUnsupportedKind[] => {
  const cachedKinds: SvgUnsupportedKind[] | undefined = UNSUPPORTED_KINDS_BY_SVG_TEXT.get(svgText);
  const unsupportedKinds: SvgUnsupportedKind[] = cachedKinds
    ?? getSvgDrawables(svgText, TOOLPATH_TOLERANCE_MM).unsupported;

  UNSUPPORTED_KINDS_BY_SVG_TEXT.delete(svgText);
  UNSUPPORTED_KINDS_BY_SVG_TEXT.set(svgText, unsupportedKinds);

  if (UNSUPPORTED_KINDS_BY_SVG_TEXT.size <= CACHED_SVG_TEXT_COUNT_MAX) {
    return unsupportedKinds;
  }

  const [oldestSvgText] = UNSUPPORTED_KINDS_BY_SVG_TEXT.keys();

  // eslint-disable-next-line no-restricted-syntax -- an empty SVG text is a valid key, distinct from no key
  if (oldestSvgText !== undefined) {
    UNSUPPORTED_KINDS_BY_SVG_TEXT.delete(oldestSvgText);
  }

  return unsupportedKinds;
};
