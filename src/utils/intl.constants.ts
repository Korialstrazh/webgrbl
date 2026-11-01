/**
 * Values for the browser's Intl formatters.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** A medium date followed by a short time, such as "Mar 4, 2026, 12:30 PM": how a project's change time reads. */
export const INTL_MEDIUM_DATE_SHORT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};
