/**
 * Tells whether a value is a non-null object whose properties can be read by name.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && !!value;
