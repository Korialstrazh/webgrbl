/**
 * What is wrong with the fields of a material being entered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MaterialFieldErrors {
  /** Translation key of the problem with the name; undefined when the name is fine. */
  nameErrorKey: string | undefined;
  /** Translation key of the problem with the thickness; undefined when the thickness is fine. */
  thicknessErrorKey: string | undefined;
}
