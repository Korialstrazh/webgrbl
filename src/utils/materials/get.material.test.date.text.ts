/**
 * The date of a material test as the user reads it; undefined for a stored date that cannot be read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
const TEST_DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

export const getMaterialTestDateText = (testedAtIso: string, language: string): string | undefined => {
  const testedAt: Date = new Date(testedAtIso);

  return Number.isNaN(testedAt.getTime())
    ? undefined
    : new Intl.DateTimeFormat(language, TEST_DATE_FORMAT).format(testedAt);
};
