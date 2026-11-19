/**
 * Gets every drawn shape of a project in bed millimetres (front-left origin, Y up). Objects are taken in document
 * order and the shapes of each in SVG document order, so the paint order counts across the whole project. Curves are
 * flattened in each object's user units at 0.05 mm divided by the largest stretch of the object matrix, so they are
 * never coarser than 0.05 mm on the bed. Text and images give a warning per object and kind.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { getObjectBedDrawableSet } from './get.object.bed.drawable.set';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';
import type { ObjectWarning } from './interfaces/ObjectWarning';

export const getBedDrawables = (projectDocument: ProjectDocument): BedDrawableSet => {
  const drawables: BedDrawable[] = [];
  const warnings: ObjectWarning[] = [];

  for (const projectObject of projectDocument.objects) {
    const objectDrawableSet: BedDrawableSet = getObjectBedDrawableSet(projectObject, drawables.length);

    drawables.push(...objectDrawableSet.drawables);
    warnings.push(...objectDrawableSet.warnings);
  }

  return { drawables, warnings };
};
