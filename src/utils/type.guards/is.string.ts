/**
 * Tells whether a value is a string.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const isString = (value: unknown): value is string => typeof value === 'string';
