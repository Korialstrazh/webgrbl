/**
 * Gets the layer keys in the order they have after one layer moves to the position of another.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
