/**
 * One step of the relative project change time: the Intl unit, and how many seconds it holds.
 *
 * @author michael.morosov
 *
 * @since 2026-11-08
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface IntlRelativeTimeStep {
  unit: Intl.RelativeTimeFormatUnit;
  seconds: number;
}
