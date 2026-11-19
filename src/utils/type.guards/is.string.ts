/**
 * Tells whether a value is a string.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const isString = (value: unknown): value is string => typeof value === 'string';
