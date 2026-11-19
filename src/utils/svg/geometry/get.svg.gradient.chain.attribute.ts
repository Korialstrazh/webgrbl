/**
 * Gets an attribute of a gradient, taken from the first gradient of its href chain that sets it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const getSvgGradientChainAttribute = (chain: Element[], attributeName: string): string | undefined => {
  for (const gradientElement of chain) {
    const attributeValue: string | null = gradientElement.getAttribute(attributeName);

    if (attributeValue) {
      return attributeValue;
    }
  }

  return undefined;
};
