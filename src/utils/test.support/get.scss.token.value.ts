/**
 * Reads the value of one custom property from the source text of a stylesheet, for tests that check token values.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/** Returns the trimmed value of `name: value;` in the source, or undefined when the property is missing. */
export const getScssTokenValue = (source: string, name: string): string | undefined => {
  const match: RegExpMatchArray | null = source.match(new RegExp(`(?<![\\w-])${name}:\\s*([^;]+);`));

  return match?.[1]?.trim();
};
