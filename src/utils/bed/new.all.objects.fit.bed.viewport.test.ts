import { describe, expect, it } from 'vitest';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import { BED_PLACEHOLDER_KIND } from './bed.constants';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewport } from './interfaces/BedViewport';
import { newAllObjectsFitBedViewport } from './new.all.objects.fit.bed.viewport';
import { newFitBedViewport } from './new.fit.bed.viewport';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 400, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const ON_BED_SIZE_MM = 50;
const HUGE_SIZE_MM = 800;

describe(newAllObjectsFitBedViewport.name, () => {
  it('is the fitted bed while every object lies on the bed', () => {
    const onBedObject: ProjectObject = newProjectObject({ widthMm: ON_BED_SIZE_MM, heightMm: ON_BED_SIZE_MM });

    expect(newAllObjectsFitBedViewport([onBedObject], DIMENSIONS)).toEqual(newFitBedViewport(DIMENSIONS));
  });

  it('zooms out and recentres so an object running off the back right of the bed is in view', () => {
    const hugeObject: ProjectObject = newProjectObject({ widthMm: HUGE_SIZE_MM, heightMm: HUGE_SIZE_MM });
    const viewport: BedViewport = newAllObjectsFitBedViewport([hugeObject], DIMENSIONS);

    expect(viewport.zoom).toBeLessThan(1);
    expect(viewport.centerXMm).toBeGreaterThan(DIMENSIONS.widthMm / 2);
    expect(viewport.centerYMm).toBeLessThan(DIMENSIONS.heightMm / 2);
  });
});
