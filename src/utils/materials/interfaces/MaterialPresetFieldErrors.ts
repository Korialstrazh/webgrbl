/**
 * What is wrong with the fields of a material preset being entered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MaterialPresetFieldErrors {
  /** Translation key of the problem with the power; undefined when the power is fine. */
  powerErrorKey: string | undefined;
  /** Translation key of the problem with the speed; undefined when the speed is fine. */
  speedErrorKey: string | undefined;
  /** Translation key of the problem with the passes; undefined when the passes are fine. */
  passesErrorKey: string | undefined;
}
