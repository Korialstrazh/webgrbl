/**
 * Gets SVG text with every painted fill and stroke at and under the element at a node path set to one colour, so the
 * content moves to that colour's laser layer. A paint of none stays none; when nothing there is painted, the element
 * gets a stroke.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getResolvedSvgStyles } from '../geometry/resolve.svg.styles';
import type { SvgResolvedStyle } from '../geometry/interfaces/SvgResolvedStyle';
import { getSvgTextWithElementEdit } from './get.svg.text.with.element.edit';
import { setSvgInlineStyleProperty } from './set.svg.inline.style.property';
import { SVG_PAINT_NONE, SVG_PAINT_PROPERTY, SVG_TREE_SHAPE_ELEMENT_NAMES, SVG_TREE_SHAPE_SELECTOR } from './svg.tree.constants';

const getShapeElements = (element: Element): Element[] => [
  ...(SVG_TREE_SHAPE_ELEMENT_NAMES.includes(element.localName) ? [element] : []),
  ...Array.from(element.querySelectorAll(SVG_TREE_SHAPE_SELECTOR)),
];

export const getSvgTextWithElementColour = (svgText: string, nodePath: string, colour: string): string =>
  getSvgTextWithElementEdit(svgText, nodePath, (element: Element, svgDocument: Document): void => {
    const resolvedStyles: Map<Element, SvgResolvedStyle> = getResolvedSvgStyles(svgDocument);
    let hasPaintedShape = false;

    for (const shapeElement of getShapeElements(element)) {
      const shapeStyle: SvgResolvedStyle | undefined = resolvedStyles.get(shapeElement);

      for (const paintProperty of Object.values(SVG_PAINT_PROPERTY)) {
        if (shapeStyle && shapeStyle[paintProperty] !== SVG_PAINT_NONE) {
          setSvgInlineStyleProperty(shapeElement, paintProperty, colour);
          hasPaintedShape = true;
        }
      }
    }

    if (!hasPaintedShape) {
      setSvgInlineStyleProperty(element, SVG_PAINT_PROPERTY.STROKE, colour);
    }
  });
