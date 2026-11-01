/**
 * Turns the time a project was last changed into text in the language the app shows: date and time, short.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { INTL_MEDIUM_DATE_SHORT_TIME_FORMAT } from '../intl.constants';

export const getProjectChangedTimeText = (updatedAt: string, language: string): string =>
  new Intl.DateTimeFormat(language, INTL_MEDIUM_DATE_SHORT_TIME_FORMAT).format(new Date(updatedAt));
