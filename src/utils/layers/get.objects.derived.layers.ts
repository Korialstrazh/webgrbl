/**
 * Gets the layers of a project after its objects were read with the palette: the existing layers unchanged, plus one
 * new layer for every colour the objects draw that has no layer yet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Palette } from '../palette/interfaces/Palette';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import { getDerivedLayers } from './get.derived.layers';
import { getObjectPaints } from './get.object.paints';
import type { ProjectLayer } from './interfaces/ProjectLayer';

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
