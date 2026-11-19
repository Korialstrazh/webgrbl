/**
 * Gets the layer keys in the order they have after one layer moves to the position of another.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
const isMoveImpossible = (layerKeys: string[], movedKey: string, targetKey: string): boolean =>
  movedKey === targetKey || !layerKeys.includes(targetKey) || !layerKeys.includes(movedKey);

export const getLayerKeysWithMovedLayer = (layerKeys: string[], movedKey: string, targetKey: string): string[] => {
  if (isMoveImpossible(layerKeys, movedKey, targetKey)) {
    return layerKeys;
  }

  const targetIndex: number = layerKeys.indexOf(targetKey);
  const remainingKeys: string[] = layerKeys.filter((layerKey: string): boolean => layerKey !== movedKey);
  remainingKeys.splice(targetIndex, 0, movedKey);

  return remainingKeys;
};
