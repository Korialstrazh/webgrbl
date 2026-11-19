/**
 * Gets a bed colour that can be used, from a value read from storage or a picker: a six-digit hex colour, in lower
 * case, or undefined for anything else, so the caller falls back to the default.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isString } from '../type.guards/is.string';
import { BED_COLOUR_PATTERN } from './bed.colour.constants';

export const getValidBedColour = (value: unknown): string | undefined =>
  isString(value) && BED_COLOUR_PATTERN.test(value) ? value.toLowerCase() : undefined;
