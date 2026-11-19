/**
 * The date of a material test as the user reads it; undefined for a stored date that cannot be read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
const TEST_DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

export const getMaterialTestDateText = (testedAtIso: string, language: string): string | undefined => {
  const testedAt: Date = new Date(testedAtIso);

  return Number.isNaN(testedAt.getTime())
    ? undefined
    : new Intl.DateTimeFormat(language, TEST_DATE_FORMAT).format(testedAt);
};
