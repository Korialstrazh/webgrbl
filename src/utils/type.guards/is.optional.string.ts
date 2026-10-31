/**
 * Tells whether a value is missing (undefined) or a string.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isString } from './is.string';

export const isOptionalString = (value: unknown): value is string | undefined =>
  typeof value === 'undefined' || isString(value);
