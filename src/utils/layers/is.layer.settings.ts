/**
 * Tells whether a value has every laser setting of a layer with the right type.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isLayerMode } from '../palette/is.layer.mode';
import { isBoolean } from '../type.guards/is.boolean';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isRecord } from '../type.guards/is.record';
import type { LayerSettings } from './interfaces/LayerSettings';

export const isLayerSettings = (value: unknown): value is LayerSettings =>
  isRecord(value) &&
  isLayerMode(value.mode) &&
  isFiniteNumber(value.maxPowerPercent) &&
  isFiniteNumber(value.minPowerPercent) &&
  isFiniteNumber(value.speedMmPerMin) &&
  isFiniteNumber(value.passes) &&
  isBoolean(value.airAssist) &&
  isFiniteNumber(value.lineIntervalMm);
