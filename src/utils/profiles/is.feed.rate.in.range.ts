/**
 * Tells whether a feed rate is a finite number within the range the machine profile allows for speeds.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { MACHINE_JOG_FEED_RATE_MAX, MACHINE_JOG_FEED_RATE_MIN } from './machine.profile.constants';

export const isFeedRateInRange = (value: number): boolean =>
  isFiniteNumber(value) && value >= MACHINE_JOG_FEED_RATE_MIN && value <= MACHINE_JOG_FEED_RATE_MAX;
