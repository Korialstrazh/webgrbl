/**
 * A parsed SVG document whose use elements have been replaced by copies of what they point to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SvgExpandedDocument {
  /** The document with the copies in place of the use elements. */
  svgDocument: Document;
  /** True when the element budget ran out and some uses were left out. */
  isUseLimitReached: boolean;
}
