/**
 * Tells whether a width or height attribute is zero in any unit, which stops a use or a nested svg from being drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const isSvgZeroLength = (value: string | null): boolean => Number.parseFloat(value ?? '') === 0;
