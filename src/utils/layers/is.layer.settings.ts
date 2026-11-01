/**
 * Tells whether a value has every laser setting of a layer with the right type.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettings } from './interfaces/LayerSettings';
import { isLayerMode } from '../palette/is.layer.mode';
import { isBoolean } from '../type.guards/is.boolean';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isRecord } from '../type.guards/is.record';

export const isLayerSettings = (value: unknown): value is LayerSettings =>
  isRecord(value) &&
  isLayerMode(value.mode) &&
  isFiniteNumber(value.maxPowerPercent) &&
  isFiniteNumber(value.minPowerPercent) &&
  isFiniteNumber(value.speedMmPerMin) &&
  isFiniteNumber(value.passes) &&
  isBoolean(value.airAssist) &&
  isFiniteNumber(value.lineIntervalMm);
