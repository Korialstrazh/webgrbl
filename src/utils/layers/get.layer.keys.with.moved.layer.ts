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
export const getLayerKeysWithMovedLayer = (layerKeys: string[], movedKey: string, targetKey: string): string[] => {
  const targetIndex: number = layerKeys.indexOf(targetKey);

  if (movedKey === targetKey || targetIndex < 0 || !layerKeys.includes(movedKey)) {
    return layerKeys;
  }

  const remainingKeys: string[] = layerKeys.filter((layerKey: string): boolean => layerKey !== movedKey);
  remainingKeys.splice(targetIndex, 0, movedKey);

  return remainingKeys;
};
