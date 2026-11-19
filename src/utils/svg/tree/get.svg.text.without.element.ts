/**
 * Gets SVG text without the element at a node path and its content.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgTextWithElementEdit } from './get.svg.text.with.element.edit';

export const getSvgTextWithoutElement = (svgText: string, nodePath: string): string =>
  getSvgTextWithElementEdit(svgText, nodePath, (element: Element): void => {
    element.remove();
  });
