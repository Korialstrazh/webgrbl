/**
 * Gets the estimated job time as text: minutes and seconds ("1 min 6 s"), or hours and minutes from one hour on
 * ("1 h 2 min"). The time is rounded to the nearest second first.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { TFunction } from 'i18next';
import { DEFAULT } from '../localization/default.locales';
import { SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from './motion.constants';

export const getJobEstimateText = (t: TFunction, totalTimeS: number): string => {
  const roundedTimeS: number = Math.round(totalTimeS);
  const hours: number = Math.floor(roundedTimeS / SECONDS_PER_HOUR);
  const minutes: number = Math.floor((roundedTimeS % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);

  if (hours) {
    return t(DEFAULT.TOOLPATH_ESTIMATE_HOURS, { hours, minutes });
  }

  if (!minutes) {
    return t(DEFAULT.TOOLPATH_ESTIMATE_SECONDS, { seconds: roundedTimeS });
  }

  return t(DEFAULT.TOOLPATH_ESTIMATE_MINUTES, { minutes, seconds: roundedTimeS % SECONDS_PER_MINUTE });
};
