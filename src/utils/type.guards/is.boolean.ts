/**
 * Tells whether a value is a boolean.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
