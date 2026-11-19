/**
 * Turns the time a project was last changed into text in the language the app shows: date and time, short.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { INTL_MEDIUM_DATE_SHORT_TIME_FORMAT } from '../intl.constants';

export const getProjectChangedTimeText = (updatedAt: string, language: string): string =>
  new Intl.DateTimeFormat(language, INTL_MEDIUM_DATE_SHORT_TIME_FORMAT).format(new Date(updatedAt));
