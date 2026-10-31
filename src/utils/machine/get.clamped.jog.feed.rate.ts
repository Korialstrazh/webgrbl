/**
 * Limits a jog feed rate to what a machine profile accepts.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { MACHINE_JOG_FEED_RATE_MAX, MACHINE_JOG_FEED_RATE_MIN } from '../profiles/machine.profile.constants';

export const getClampedJogFeedRate = (feedRate: number): number =>
  Math.min(MACHINE_JOG_FEED_RATE_MAX, Math.max(MACHINE_JOG_FEED_RATE_MIN, feedRate));
