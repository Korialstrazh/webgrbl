/**
 * The number text an input field parses: a comma typed as the decimal mark reads as a dot, so both work on any
 * keyboard layout, and anything that is not part of a number is dropped as the default parser does.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const getDecimalNumberText = (displayText: string | undefined): string =>
  (displayText ?? '').replace(/,/g, '.').replace(/[^\w.-]+/g, '');
