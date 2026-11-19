/**
 * What reading a fill or stroke value needs besides the value: the inherited paint, the current colour and the
 * gradients that exist.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgResolvedPaint } from './SvgResolvedPaint';

export interface SvgPaintContext {
  /** The paint of the parent element, used when the element sets none. */
  parentPaint: SvgResolvedPaint;
  /** What currentColor means here, as lowercase #rrggbb. */
  currentColour: string;
  /** Ids of the gradients in the document; a url reference to any other id is missing. */
  gradientIds: Set<string>;
}
