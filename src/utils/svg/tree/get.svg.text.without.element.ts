/**
 * Gets SVG text without the element at a node path and its content.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgTextWithElementEdit } from './get.svg.text.with.element.edit';

export const getSvgTextWithoutElement = (svgText: string, nodePath: string): string =>
  getSvgTextWithElementEdit(svgText, nodePath, (element: Element): void => {
    element.remove();
  });
