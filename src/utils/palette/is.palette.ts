/**
 * Tells whether a value is a palette of the supported version whose entries all have the shape of a palette entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
