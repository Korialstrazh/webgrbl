/**
 * Keeps the parsed drawables of each project object, so a new toolpath does not parse every SVG again on the main
 * thread. An entry is reused while the object's SVG text and placement fields are unchanged: a layer change parses
 * nothing, and moving one object parses only that object. Entries of objects no longer in the document are dropped,
 * so the cache never holds more than the open document.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getObjectBedDrawableSet } from './get.object.bed.drawable.set';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';
import type { CachedObjectDrawableSet } from './interfaces/CachedObjectDrawableSet';

const OBJECT_KEY_SEPARATOR = '\u0000';

/** Every object field the drawables depend on: the SVG and the fields getObjectBedMatrix reads. */
const getObjectDrawablesKey = (projectObject: ProjectObject): string => [
  projectObject.svgText,
  projectObject.intrinsicWidthMm,
  projectObject.intrinsicHeightMm,
  projectObject.xMm,
  projectObject.yMm,
  projectObject.widthMm,
  projectObject.heightMm,
  projectObject.rotationDeg,
].join(OBJECT_KEY_SEPARATOR);

export class BedDrawablesCache {
  // The last parsed drawables of each object, by object id.
  private readonly entriesByObjectId: Map<string, CachedObjectDrawableSet> = new Map<string, CachedObjectDrawableSet>();

  /** The same drawables and warnings as getBedDrawables, parsing only objects that changed. */
  public getBedDrawableSet(projectDocument: ProjectDocument): BedDrawableSet {
    const drawables: BedDrawable[] = [];
    const warnings: BedDrawableSet['warnings'] = [];

    for (const projectObject of projectDocument.objects) {
      const objectDrawableSet: BedDrawableSet = this.getObjectDrawableSet(projectObject);
      const firstPaintOrder: number = drawables.length;

      for (const drawable of objectDrawableSet.drawables) {
        drawables.push({ ...drawable, paintOrder: firstPaintOrder + drawable.paintOrder });
      }

      warnings.push(...objectDrawableSet.warnings);
    }

    this.dropRemovedObjects(projectDocument.objects);

    return { drawables, warnings };
  }

  private getObjectDrawableSet(projectObject: ProjectObject): BedDrawableSet {
    const objectKey: string = getObjectDrawablesKey(projectObject);
    const cachedEntry: CachedObjectDrawableSet | undefined = this.entriesByObjectId.get(projectObject.id);

    if (cachedEntry?.objectKey === objectKey) {
      return cachedEntry.drawableSet;
    }

    const drawableSet: BedDrawableSet = getObjectBedDrawableSet(projectObject, 0);

    this.entriesByObjectId.set(projectObject.id, { objectKey, drawableSet });

    return drawableSet;
  }

  private dropRemovedObjects(projectObjects: ProjectObject[]): void {
    const objectIds: Set<string> = new Set(
      projectObjects.map((projectObject: ProjectObject): string => projectObject.id),
    );

    for (const objectId of this.entriesByObjectId.keys()) {
      if (!objectIds.has(objectId)) {
        this.entriesByObjectId.delete(objectId);
      }
    }
  }
}
