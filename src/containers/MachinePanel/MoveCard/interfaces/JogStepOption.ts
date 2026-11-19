/**
 * One jog step size offered in the step selector: the distance it reports and the text it shows.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface JogStepOption {
  /** The step distance in millimetres. */
  value: number;
  label: string;
}
