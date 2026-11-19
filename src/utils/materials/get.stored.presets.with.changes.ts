/**
 * Gets the stored presets merged with what happened while they were read: a preset in the state may be newer than its
 * stored copy or not stored at all, and a preset deleted meanwhile must not come back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from './interfaces/MaterialPreset';

export const getStoredPresetsWithChanges = (
  storedPresets: MaterialPreset[],
  savedPresets: MaterialPreset[],
  deletedPresetIds: ReadonlySet<string>,
): MaterialPreset[] => {
  const savedPresetIds: Set<string> = new Set<string>(savedPresets.map(({ id }: MaterialPreset): string => id));
  const remainingStoredPresets: MaterialPreset[] = storedPresets.filter(
    ({ id }: MaterialPreset): boolean => !savedPresetIds.has(id) && !deletedPresetIds.has(id),
  );

  return [...remainingStoredPresets, ...savedPresets];
};
