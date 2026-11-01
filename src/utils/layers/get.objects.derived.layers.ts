/**
 * Gets the layers of a project after its objects were read with the palette: the existing layers unchanged, plus one
 * new layer for every colour the objects draw that has no layer yet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getDerivedLayers } from './get.derived.layers';
import { getObjectPaints } from './get.object.paints';
import type { ProjectLayer } from './interfaces/ProjectLayer';
import type { Palette } from '../palette/interfaces/Palette';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';

export const getObjectsDerivedLayers = (
  objects: ProjectObject[],
  palette: Palette,
  existingLayers: ProjectLayer[],
): ProjectLayer[] => {
  const objectsPaints: SvgPaint[][] = objects.map(
    (projectObject: ProjectObject): SvgPaint[] => getObjectPaints(projectObject.svgText),
  );

  return getDerivedLayers(objectsPaints, palette, existingLayers);
};
