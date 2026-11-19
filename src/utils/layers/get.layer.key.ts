/**
 * Gives the key that identifies a layer: the shading constant for the shading layer, otherwise its colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SHADING_LAYER_COLOUR } from './layer.constants';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getLayerKey = (layer: ProjectLayer): string => (layer.isShading ? SHADING_LAYER_COLOUR : layer.colour);
