/**
 * A change made in place to one element of a freshly parsed SVG document.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export type SvgTreeElementEdit = (element: Element, svgDocument: Document) => void;
