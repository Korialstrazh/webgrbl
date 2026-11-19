/**
 * Gets SVG text with the element at a node path turned off (left out of the job, shown dimmed) or back on.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgTextWithElementEdit } from './get.svg.text.with.element.edit';
import { SVG_TREE_DISABLED_ATTRIBUTE_NAME, SVG_TREE_DISABLED_ATTRIBUTE_VALUE } from './svg.tree.constants';

export const getSvgTextWithElementDisabled = (svgText: string, nodePath: string, isDisabled: boolean): string =>
  getSvgTextWithElementEdit(svgText, nodePath, (element: Element): void => {
    if (isDisabled) {
      element.setAttribute(SVG_TREE_DISABLED_ATTRIBUTE_NAME, SVG_TREE_DISABLED_ATTRIBUTE_VALUE);
    } else {
      element.removeAttribute(SVG_TREE_DISABLED_ATTRIBUTE_NAME);
    }
  });
