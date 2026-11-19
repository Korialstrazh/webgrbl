/**
 * Gets a simulation time as a clock: minutes and seconds with two digits each ("01:06"), or hours, minutes and
 * seconds from one hour on ("1:02:05"). The time is rounded to the nearest second, like the job estimate, so the
 * total matches the estimate shown elsewhere.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from './motion.constants';

const CLOCK_PART_SEPARATOR = ':';
const CLOCK_PART_DIGITS = 2;
const CLOCK_PART_PADDING = '0';

const getClockPartText = (value: number): string => String(value).padStart(CLOCK_PART_DIGITS, CLOCK_PART_PADDING);

export const getSimulationClockText = (timeS: number): string => {
  const wholeSeconds: number = Math.max(Math.round(timeS), 0);
  const hours: number = Math.floor(wholeSeconds / SECONDS_PER_HOUR);
  const minutes: number = Math.floor((wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const minutesAndSecondsText: string = [minutes, wholeSeconds % SECONDS_PER_MINUTE]
    .map(getClockPartText)
    .join(CLOCK_PART_SEPARATOR);

  return hours ? [hours, minutesAndSecondsText].join(CLOCK_PART_SEPARATOR) : minutesAndSecondsText;
};
