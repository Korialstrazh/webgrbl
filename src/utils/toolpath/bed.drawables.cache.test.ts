import { describe, expect, it } from 'vitest';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { newProjectObject } from '../project/new.project.object';
import { BedDrawablesCache } from './bed.drawables.cache';
import { getBedDrawables } from './get.bed.drawables';

const RED_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/><rect fill="#ff0000" width="2" height="2"/></svg>';
const TEXT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<circle stroke="#0000ff" fill="none" cx="5" cy="5" r="3"/><text>Hi</text></svg>';
const MOVED_X_MM = 25;

const newTwoObjectDocument = (): ProjectDocument => ({
  objects: [newProjectObject({ svgText: RED_SVG_TEXT }), newProjectObject({ svgText: TEXT_SVG_TEXT })],
  layers: [],
});

describe(BedDrawablesCache.name, () => {
  it('gives the same drawables and warnings as getBedDrawables, with project-wide paint orders', () => {
    const projectDocument: ProjectDocument = newTwoObjectDocument();

    expect(new BedDrawablesCache().getBedDrawableSet(projectDocument)).toEqual(getBedDrawables(projectDocument));
  });

  it('follows a moved object and an object order change', () => {
    const cache: BedDrawablesCache = new BedDrawablesCache();
    const projectDocument: ProjectDocument = newTwoObjectDocument();
    const [firstObject, secondObject] = projectDocument.objects;

    cache.getBedDrawableSet(projectDocument);

    const changedDocument: ProjectDocument = {
      ...projectDocument,
      objects: [secondObject ?? newProjectObject(), { ...(firstObject ?? newProjectObject()), xMm: MOVED_X_MM }],
    };

    expect(cache.getBedDrawableSet(changedDocument)).toEqual(getBedDrawables(changedDocument));
  });
});
