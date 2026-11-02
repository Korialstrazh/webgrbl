/**
 * Tells whether a width or height attribute is zero in any unit, which stops a use or a nested svg from being drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const isSvgZeroLength = (value: string | null): boolean => Number.parseFloat(value ?? '') === 0;
