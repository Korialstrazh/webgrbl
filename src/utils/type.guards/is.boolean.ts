/**
 * Tells whether a value is a boolean.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
