/**
 * Gives the preset id of a layer read from storage or a file, or undefined when it is missing or not a string.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isString } from '../type.guards/is.string';

export const getValidPresetId = (presetId: unknown): string | undefined => (isString(presetId) ? presetId : undefined);
