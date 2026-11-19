/**
 * The result of a successful SVG import: the cleaned SVG text and its real size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgRemovedContentKind } from '../svg.constants';

export interface SanitizedSvg {
  /** The SVG text with all scripts, event handlers and remote references removed. */
  svgText: string;
  widthMm: number;
  heightMm: number;
  /** Visible content that was dropped from the file, each kind once, in a stable order. */
  removedContentKinds: SvgRemovedContentKind[];
}
