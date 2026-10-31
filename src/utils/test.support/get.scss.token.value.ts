/**
 * Reads the value of one custom property from the source text of a stylesheet, for tests that check token values.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** Returns the trimmed value of `name: value;` in the source, or undefined when the property is missing. */
export const getScssTokenValue = (source: string, name: string): string | undefined => {
  const match: RegExpMatchArray | null = source.match(new RegExp(`(?<![\\w-])${name}:\\s*([^;]+);`));

  return match?.[1]?.trim();
};
