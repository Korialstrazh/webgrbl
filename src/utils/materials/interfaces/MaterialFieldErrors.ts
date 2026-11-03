/**
 * What is wrong with the fields of a material being entered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface MaterialFieldErrors {
  /** Translation key of the problem with the name; undefined when the name is fine. */
  nameErrorKey: string | undefined;
  /** Translation key of the problem with the thickness; undefined when the thickness is fine. */
  thicknessErrorKey: string | undefined;
}
