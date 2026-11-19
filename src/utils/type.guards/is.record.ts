/**
 * Tells whether a value is a non-null object whose properties can be read by name.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && !!value;
