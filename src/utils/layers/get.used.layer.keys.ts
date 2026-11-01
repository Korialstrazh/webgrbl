/**
 * Gets the keys of the layers the objects draw with: their colours, and the shading key for greys.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getObjectPaints } from './get.object.paints';
import { getPaintLayerKey } from './get.paint.layer.key';
import type { ProjectObject } from '../project/interfaces/ProjectObject';

export const getUsedLayerKeys = (objects: ProjectObject[]): Set<string> => {
  const usedLayerKeys: Set<string> = new Set<string>();

  for (const projectObject of objects) {
    for (const paint of getObjectPaints(projectObject.svgText)) {
      usedLayerKeys.add(getPaintLayerKey(paint));
    }
  }

  return usedLayerKeys;
};
