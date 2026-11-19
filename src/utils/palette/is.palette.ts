/**
 * Tells whether a value is a palette of the supported version whose entries all have the shape of a palette entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isRecord } from '../type.guards/is.record';
import type { Palette } from './interfaces/Palette';
import { isPaletteEntry } from './is.palette.entry';
import { PALETTE_VERSION } from './palette.constants';

export const isPalette = (value: unknown): value is Palette =>
  isRecord(value) &&
  value.version === PALETTE_VERSION &&
  Array.isArray(value.entries) &&
  value.entries.every(isPaletteEntry);
