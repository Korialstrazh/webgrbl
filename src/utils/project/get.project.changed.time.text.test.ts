import { describe, expect, it } from 'vitest';
import { getProjectChangedTimeText } from './get.project.changed.time.text';

const UPDATED_AT = '2026-03-04T12:30:00.000Z';
const ENGLISH = 'en';
const GERMAN = 'de';

describe(getProjectChangedTimeText.name, () => {
  it('writes the date and the time in the given language', () => {
    const expectedText: string = new Intl.DateTimeFormat(ENGLISH, { dateStyle: 'medium', timeStyle: 'short' })
      .format(new Date(UPDATED_AT));

    expect(getProjectChangedTimeText(UPDATED_AT, ENGLISH)).toBe(expectedText);
    expect(getProjectChangedTimeText(UPDATED_AT, ENGLISH)).toMatch(/2026/);
  });

  it('follows the language', () => {
    expect(getProjectChangedTimeText(UPDATED_AT, GERMAN)).not.toBe(getProjectChangedTimeText(UPDATED_AT, ENGLISH));
  });
});
