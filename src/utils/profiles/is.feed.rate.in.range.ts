/**
 * Tells whether a feed rate is a finite number within the range the machine profile allows for speeds.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { MACHINE_JOG_FEED_RATE_MAX, MACHINE_JOG_FEED_RATE_MIN } from './machine.profile.constants';

export const isFeedRateInRange = (value: number): boolean =>
  isFiniteNumber(value) && value >= MACHINE_JOG_FEED_RATE_MIN && value <= MACHINE_JOG_FEED_RATE_MAX;
