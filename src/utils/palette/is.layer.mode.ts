/**
 * Tells whether a value is one of the layer modes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { LAYER_MODE } from './palette.constants';
import type { LayerMode } from './palette.constants';

const LAYER_MODES: readonly string[] = Object.values(LAYER_MODE);

export const isLayerMode = (value: unknown): value is LayerMode => LAYER_MODES.includes(String(value));
