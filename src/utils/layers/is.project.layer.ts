/**
 * Tells whether a value has every field of a project layer with the right type; the palette entry id may be missing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isBoolean } from '../type.guards/is.boolean';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isOptionalString } from '../type.guards/is.optional.string';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { ProjectLayer } from './interfaces/ProjectLayer';
import { isLayerSettings } from './is.layer.settings';

export const isProjectLayer = (value: unknown): value is ProjectLayer =>
  isRecord(value) &&
  isString(value.colour) &&
  isBoolean(value.enabled) &&
  isFiniteNumber(value.order) &&
  isLayerSettings(value.settings) &&
  isOptionalString(value.paletteEntryId) &&
  isBoolean(value.isShading);
