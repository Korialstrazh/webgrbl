/**
 * Applies a stored preset to the layer of a key, and gives the text that says what happened; undefined when the layer
 * is gone.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';

export type ApplyPresetToLayer = (preset: MaterialPreset, layerKey: string) => string | undefined;
