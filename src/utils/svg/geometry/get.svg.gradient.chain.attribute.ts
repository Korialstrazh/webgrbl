/**
 * Gets an attribute of a gradient, taken from the first gradient of its href chain that sets it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
