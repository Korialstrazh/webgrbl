/**
 * Tells whether a value is one of the layer modes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { LAYER_MODE } from './palette.constants';
import type { LayerMode } from './palette.constants';

const LAYER_MODES: readonly string[] = Object.values(LAYER_MODE);

export const isLayerMode = (value: unknown): value is LayerMode => LAYER_MODES.includes(String(value));
