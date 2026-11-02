import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import * as documentDrawablesModule from '../svg/geometry/get.svg.document.drawables';
import * as expandedDocumentModule from '../svg/geometry/get.svg.expanded.document';
import { BedDrawablesCache } from './bed.drawables.cache';
import { getBedDrawables } from './get.bed.drawables';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';

const RED_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/><rect fill="#ff0000" width="2" height="2"/></svg>';
const TEXT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<circle stroke="#0000ff" fill="none" cx="5" cy="5" r="3"/><text>Hi</text></svg>';
const MOVED_X_MM = 25;
const MOVED_Y_MM = 40;
const TURNED_ROTATION_DEG = 30;
const RESIZED_WIDTH_MM = 37;

const newTwoObjectDocument = (): ProjectDocument => ({
  objects: [newProjectObject({ svgText: RED_SVG_TEXT }), newProjectObject({ svgText: TEXT_SVG_TEXT })],
  layers: [],
});

const getTransformedObjects = (projectObjects: ProjectObject[]): ProjectObject[] => projectObjects.map(
  (projectObject: ProjectObject): ProjectObject => ({
    ...projectObject,
    xMm: MOVED_X_MM,
    yMm: MOVED_Y_MM,
    rotationDeg: TURNED_ROTATION_DEG,
  }),
);

describe(BedDrawablesCache.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('neither parses, expands nor flattens an SVG again when objects are only moved and turned', () => {
    const cache: BedDrawablesCache = new BedDrawablesCache();
    const projectDocument: ProjectDocument = newTwoObjectDocument();

    cache.getBedDrawableSet(projectDocument);

    const expandSpy = vi.spyOn(expandedDocumentModule, 'getSvgExpandedDocument');
    const flattenSpy = vi.spyOn(documentDrawablesModule, 'getSvgDocumentDrawables');
    const movedDocument: ProjectDocument = {
      ...projectDocument,
      objects: getTransformedObjects(projectDocument.objects),
    };
    const movedDrawableSet: BedDrawableSet = cache.getBedDrawableSet(movedDocument);

    expect(expandSpy).toHaveBeenCalledTimes(0);
    expect(flattenSpy).toHaveBeenCalledTimes(0);
    expect(movedDrawableSet).toEqual(getBedDrawables(movedDocument));
  });

  it('flattens a resized object again at its new tolerance without parsing its SVG again', () => {
    const cache: BedDrawablesCache = new BedDrawablesCache();
    const projectDocument: ProjectDocument = newTwoObjectDocument();
    const [firstObject, secondObject] = projectDocument.objects;

    cache.getBedDrawableSet(projectDocument);

    const expandSpy = vi.spyOn(expandedDocumentModule, 'getSvgExpandedDocument');
    const flattenSpy = vi.spyOn(documentDrawablesModule, 'getSvgDocumentDrawables');
    const resizedDocument: ProjectDocument = {
      ...projectDocument,
      objects: [
        { ...(firstObject ?? newProjectObject()), widthMm: RESIZED_WIDTH_MM },
        secondObject ?? newProjectObject(),
      ],
    };
    const resizedDrawableSet: BedDrawableSet = cache.getBedDrawableSet(resizedDocument);

    expect(expandSpy).toHaveBeenCalledTimes(0);
    expect(flattenSpy).toHaveBeenCalledTimes(1);
    expect(resizedDrawableSet).toEqual(getBedDrawables(resizedDocument));
  });
});
