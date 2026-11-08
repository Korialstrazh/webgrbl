import { getProjectChangedRelativeTimeText } from './get.project.changed.relative.time.text';

const LANGUAGE = 'en';
const UPDATED_AT = '2026-03-05T09:00:00.000Z';
const UPDATED_AT_MS: number = Date.parse(UPDATED_AT);
const SECOND_MS = 1000;
const MINUTE_MS: number = 60 * SECOND_MS;
const HOUR_MS: number = 60 * MINUTE_MS;
const DAY_MS: number = 24 * HOUR_MS;

describe(getProjectChangedRelativeTimeText.name, () => {
  it.each([
    [0, 'now'],
    [30 * SECOND_MS, 'now'],
    [5 * MINUTE_MS, '5 minutes ago'],
    [2 * HOUR_MS, '2 hours ago'],
    [DAY_MS, 'yesterday'],
    [3 * DAY_MS, '3 days ago'],
    [14 * DAY_MS, '2 weeks ago'],
    [60 * DAY_MS, '2 months ago'],
    [400 * DAY_MS, 'last year'],
  ])('reads %i ms after the change as "%s"', (agoMs: number, expectedText: string) => {
    expect(getProjectChangedRelativeTimeText(UPDATED_AT, UPDATED_AT_MS + agoMs, LANGUAGE)).toBe(expectedText);
  });

  it('reads a change time slightly in the future as now', () => {
    expect(getProjectChangedRelativeTimeText(UPDATED_AT, UPDATED_AT_MS - MINUTE_MS, LANGUAGE)).toBe('now');
  });
});
