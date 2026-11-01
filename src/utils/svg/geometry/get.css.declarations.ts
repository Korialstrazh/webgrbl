/**
 * Reads the declarations of a CSS block or style attribute into a property to value record.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
