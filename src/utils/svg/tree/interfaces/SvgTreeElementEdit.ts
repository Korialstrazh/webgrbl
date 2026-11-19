/**
 * A change made in place to one element of a freshly parsed SVG document.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export type SvgTreeElementEdit = (element: Element, svgDocument: Document) => void;
