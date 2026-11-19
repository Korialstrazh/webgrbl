/**
 * Reads the declarations of a CSS block or style attribute into a property to value record.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  CSS_DECLARATION_SEPARATOR,
  CSS_IMPORTANT_PATTERN,
  CSS_PROPERTY_VALUE_SEPARATOR,
} from './svg.geometry.constants';

export const getCssDeclarations = (declarationText: string): Record<string, string> => {
  const declarations: Record<string, string> = {};

  for (const declarationPart of declarationText.split(CSS_DECLARATION_SEPARATOR)) {
    const separatorIndex: number = declarationPart.indexOf(CSS_PROPERTY_VALUE_SEPARATOR);

    if (separatorIndex < 0) {
      continue;
    }

    const propertyName: string = declarationPart.slice(0, separatorIndex).trim().toLowerCase();
    const propertyValue: string = declarationPart
      .slice(separatorIndex + 1)
      .replace(CSS_IMPORTANT_PATTERN, '')
      .trim();

    if (propertyName && propertyValue) {
      declarations[propertyName] = propertyValue;
    }
  }

  return declarations;
};
