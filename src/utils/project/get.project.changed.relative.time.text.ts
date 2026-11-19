/**
 * How long ago a stored project changed, in words in the given language, such as "5 minutes ago" or "yesterday", so
 * projects with the same name can be told apart at a glance in the Open dialog. Under a minute reads as "now"; a time
 * a little in the future (a clock that moved back) reads the same.
 *
 * @author michael.morosov
 *
 * @since 2026-11-08
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { INTL_RELATIVE_TIME_AUTO_FORMAT, INTL_RELATIVE_TIME_STEPS } from '../intl.constants';
import type { IntlRelativeTimeStep } from './interfaces/IntlRelativeTimeStep';

const MILLISECONDS_PER_SECOND = 1000;
const NOW_UNIT: Intl.RelativeTimeFormatUnit = 'second';

export const getProjectChangedRelativeTimeText = (updatedAt: string, nowMs: number, language: string): string => {
  const formatter: Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat(language, INTL_RELATIVE_TIME_AUTO_FORMAT);
  const agoSeconds: number = Math.max(0, (nowMs - new Date(updatedAt).getTime()) / MILLISECONDS_PER_SECOND);

  const reachedStep: IntlRelativeTimeStep | undefined = INTL_RELATIVE_TIME_STEPS
    .find((step: IntlRelativeTimeStep) => agoSeconds >= step.seconds);

  if (reachedStep) {
    return formatter.format(-Math.floor(agoSeconds / reachedStep.seconds), reachedStep.unit);
  }

  return formatter.format(0, NOW_UNIT);
};
