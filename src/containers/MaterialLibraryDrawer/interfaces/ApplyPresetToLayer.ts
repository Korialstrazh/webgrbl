/**
 * Applies a stored preset to the layer of a key, and gives the text that says what happened; undefined when the layer
 * is gone.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';

export type ApplyPresetToLayer = (preset: MaterialPreset, layerKey: string) => string | undefined;
