/**
 * What is wrong with the fields of a material preset being entered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface MaterialPresetFieldErrors {
  /** Translation key of the problem with the power; undefined when the power is fine. */
  powerErrorKey: string | undefined;
  /** Translation key of the problem with the speed; undefined when the speed is fine. */
  speedErrorKey: string | undefined;
  /** Translation key of the problem with the passes; undefined when the passes are fine. */
  passesErrorKey: string | undefined;
}
