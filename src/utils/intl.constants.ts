/**
 * Values for the browser's Intl formatters.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { IntlRelativeTimeStep } from './project/interfaces/IntlRelativeTimeStep';

/** A medium date followed by a short time, such as "Mar 4, 2026, 12:30 PM": how a project's change time reads. */
export const INTL_MEDIUM_DATE_SHORT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

/** A medium date alone, such as "Mar 4, 2026": the day a project was made. */
export const INTL_MEDIUM_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
};

/** Relative times in words, with "yesterday" or "now" where the language has them: how long ago a project changed. */
export const INTL_RELATIVE_TIME_AUTO_FORMAT: Intl.RelativeTimeFormatOptions = {
  numeric: 'auto',
  style: 'long',
};

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;
const SECONDS_PER_MONTH = 2592000;
const SECONDS_PER_YEAR = 31536000;

/** From the largest unit down: a time reads in the largest unit it fills at least once. */
export const INTL_RELATIVE_TIME_STEPS: readonly IntlRelativeTimeStep[] = [
  { unit: 'year', seconds: SECONDS_PER_YEAR },
  { unit: 'month', seconds: SECONDS_PER_MONTH },
  { unit: 'week', seconds: SECONDS_PER_WEEK },
  { unit: 'day', seconds: SECONDS_PER_DAY },
  { unit: 'hour', seconds: SECONDS_PER_HOUR },
  { unit: 'minute', seconds: SECONDS_PER_MINUTE },
];

/** A 24-hour time of day, such as "14:05": the time in a project's automatic name. */
export const INTL_HOUR_MINUTE_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};
