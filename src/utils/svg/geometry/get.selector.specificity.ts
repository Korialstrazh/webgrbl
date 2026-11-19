/**
 * Weighs a simple selector made of type, class and id parts: an id beats any classes, a class beats any types.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  CSS_CLASS_PREFIX,
  CSS_CLASS_SPECIFICITY,
  CSS_ID_PREFIX,
  CSS_ID_SPECIFICITY,
  CSS_SELECTOR_PART_PATTERN,
  CSS_TYPE_SPECIFICITY,
} from './svg.geometry.constants';

const getPartSpecificity = (partPrefix: string): number => {
  if (partPrefix === CSS_ID_PREFIX) {
    return CSS_ID_SPECIFICITY;
  }

  return partPrefix === CSS_CLASS_PREFIX ? CSS_CLASS_SPECIFICITY : CSS_TYPE_SPECIFICITY;
};

export const getSelectorSpecificity = (selector: string): number => {
  let specificity = 0;

  for (const partMatch of selector.matchAll(CSS_SELECTOR_PART_PATTERN)) {
    specificity += getPartSpecificity(partMatch[1] ?? '');
  }

  return specificity;
};
