/**
 * One jog step size offered in the step selector: the distance it reports and the text it shows.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface JogStepOption {
  /** The step distance in millimetres, as text. */
  value: string;
  label: string;
}
