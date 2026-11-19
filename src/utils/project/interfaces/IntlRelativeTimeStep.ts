/**
 * One step of the relative project change time: the Intl unit, and how many seconds it holds.
 *
 * @author michael.morosov
 *
 * @since 2026-11-08
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface IntlRelativeTimeStep {
  unit: Intl.RelativeTimeFormatUnit;
  seconds: number;
}
