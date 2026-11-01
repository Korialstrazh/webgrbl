/**
 * Gives the key that identifies a layer: the shading constant for the shading layer, otherwise its colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SHADING_LAYER_COLOUR } from './layer.constants';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getLayerKey = (layer: ProjectLayer): string => (layer.isShading ? SHADING_LAYER_COLOUR : layer.colour);
