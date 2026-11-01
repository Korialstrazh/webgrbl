/**
 * A parsed SVG document whose use elements have been replaced by copies of what they point to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgExpandedDocument {
  /** The document with the copies in place of the use elements. */
  svgDocument: Document;
  /** True when the element budget ran out and some uses were left out. */
  isUseLimitReached: boolean;
}
