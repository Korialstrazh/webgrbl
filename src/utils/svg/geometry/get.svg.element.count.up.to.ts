/**
 * Counts an element and its descendants, but stops as soon as the count passes the limit and then gives limit + 1. A
 * copy too large for the budget is then rejected without walking all of it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgChildElements } from './get.svg.child.elements';

export const getSvgElementCountUpTo = (element: Element, limit: number): number => {
  const pendingElements: Element[] = [element];
  let elementCount = 0;

  for (let nextElement = pendingElements.pop(); nextElement; nextElement = pendingElements.pop()) {
    elementCount++;

    if (elementCount > limit) {
      return elementCount;
    }

    pendingElements.push(...getSvgChildElements(nextElement));
  }

  return elementCount;
};
