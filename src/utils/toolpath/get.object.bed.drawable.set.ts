/**
 * Gets the drawn shapes of one project object in bed millimetres, with its warnings. The paint order of its shapes
 * starts at firstPaintOrder. It parses the SVG, flattens it in the object's user units at the object's flattening
 * tolerance (never coarser than 0.05 mm on the bed) and places the result on the bed. Parsing needs DOMParser, so
 * it runs on the main thread; BedDrawablesCache runs the same three steps and keeps the first two.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getObjectArtworkDrawableSet } from './get.object.artwork.drawable.set';
import { getObjectFlatteningTolerance } from './get.object.flattening.tolerance';
import { getObjectPlacedDrawableSet } from './get.object.placed.drawable.set';
import { getObjectSvgSource } from './get.object.svg.source';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';
import type { ObjectSvgSource } from './interfaces/ObjectSvgSource';

export const getObjectBedDrawableSet = (projectObject: ProjectObject, firstPaintOrder: number): BedDrawableSet => {
  const svgSource: ObjectSvgSource = getObjectSvgSource(projectObject.svgText);
  const toleranceUserUnits: number = getObjectFlatteningTolerance(projectObject, svgSource.viewBox);

  return getObjectPlacedDrawableSet({
    projectObject,
    artworkDrawableSet: getObjectArtworkDrawableSet({ projectObject, svgSource, toleranceUserUnits }),
    viewBox: svgSource.viewBox,
    firstPaintOrder,
  });
};
