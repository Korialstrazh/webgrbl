/**
 * Tells whether a value has the shape of a palette entry; the values are range-checked separately.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isBoolean } from '../type.guards/is.boolean';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { PaletteEntry } from './interfaces/PaletteEntry';
import { isLayerMode } from './is.layer.mode';

export const isPaletteEntry = (value: unknown): value is PaletteEntry =>
  isRecord(value) &&
  isString(value.id) &&
  !!value.id &&
  isString(value.name) &&
  isString(value.colour) &&
  isLayerMode(value.mode) &&
  isFiniteNumber(value.maxPowerPercent) &&
  isFiniteNumber(value.minPowerPercent) &&
  isFiniteNumber(value.speedMmPerMin) &&
  isFiniteNumber(value.passes) &&
  isBoolean(value.airAssist) &&
  isFiniteNumber(value.lineIntervalMm);
