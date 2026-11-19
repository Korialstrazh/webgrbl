/**
 * The DIN A size a job is close to, in the job's orientation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface DinAMatch {
  /** Paper size name such as "A4". */
  name: string;
  /** Paper width in mm, in the job's orientation. */
  widthMm: number;
  /** Paper height in mm, in the job's orientation. */
  heightMm: number;
  /** Job width minus paper width, in mm. */
  widthDeltaMm: number;
  /** Job height minus paper height, in mm. */
  heightDeltaMm: number;
  /** True when both differences are below 0.1 mm. */
  isExact: boolean;
}
