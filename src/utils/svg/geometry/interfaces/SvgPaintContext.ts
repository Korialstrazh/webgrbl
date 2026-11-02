/**
 * What reading a fill or stroke value needs besides the value: the inherited paint, the current colour and the
 * gradients that exist.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
