/**
 * Keeps the drawables of each project object, so a new toolpath does not parse every SVG again on the main thread.
 * Each object keeps three entries, each reused while its own inputs are unchanged:
 * - the parsed SVG (DOMParser and use expansion), keyed on the SVG text only;
 * - the flattened artwork in user units, keyed on the SVG text, the intrinsic size and the flattening tolerance;
 * - the placed drawables in bed millimetres, keyed on the SVG text and every placement field.
 * A layer change does no work, a move or a turn only places the cached artwork again, and a resize flattens the
 * cached document again at the new tolerance without parsing it. Entries of objects no longer in the document are
 * dropped, so the cache never holds more than the open document.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getObjectArtworkDrawableSet } from './get.object.artwork.drawable.set';
import { getObjectFlatteningTolerance } from './get.object.flattening.tolerance';
import { getObjectPlacedDrawableSet } from './get.object.placed.drawable.set';
import { getObjectSvgSource } from './get.object.svg.source';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';
import type { CachedObjectArtworkDrawableSet } from './interfaces/CachedObjectArtworkDrawableSet';
import type { CachedObjectDrawableSet } from './interfaces/CachedObjectDrawableSet';
import type { CachedObjectSvgSource } from './interfaces/CachedObjectSvgSource';
import type { ObjectArtworkDrawableSet } from './interfaces/ObjectArtworkDrawableSet';
import type { ObjectSvgSource } from './interfaces/ObjectSvgSource';

const OBJECT_KEY_SEPARATOR = '\u0000';

/** Every object field the placed drawables depend on: the SVG and the fields getObjectBedMatrix reads. */
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

/** Every input the flattened artwork depends on; the move and turn of the object are not among them. */
const getObjectArtworkKey = (projectObject: ProjectObject, toleranceUserUnits: number): string => [
  projectObject.svgText,
  projectObject.intrinsicWidthMm,
  projectObject.intrinsicHeightMm,
  toleranceUserUnits,
].join(OBJECT_KEY_SEPARATOR);

export class BedDrawablesCache {
  // The parsed SVG of each object, by object id.
  private readonly svgSourcesByObjectId: Map<string, CachedObjectSvgSource> = new Map<string, CachedObjectSvgSource>();

  // The flattened artwork of each object in user units, by object id.
  private readonly artworksByObjectId: Map<string, CachedObjectArtworkDrawableSet> = new Map<
    string,
    CachedObjectArtworkDrawableSet
  >();

  // The last placed drawables of each object, by object id.
  private readonly entriesByObjectId: Map<string, CachedObjectDrawableSet> = new Map<string, CachedObjectDrawableSet>();

  /** The same drawables and warnings as getBedDrawables, parsing and flattening only what changed. */
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

    const svgSource: ObjectSvgSource = this.getObjectSvgSource(projectObject);
    const drawableSet: BedDrawableSet = getObjectPlacedDrawableSet({
      projectObject,
      artworkDrawableSet: this.getObjectArtworkDrawableSet(projectObject, svgSource),
      viewBox: svgSource.viewBox,
      firstPaintOrder: 0,
    });

    this.entriesByObjectId.set(projectObject.id, { objectKey, drawableSet });

    return drawableSet;
  }

  private getObjectSvgSource(projectObject: ProjectObject): ObjectSvgSource {
    const cachedSource: CachedObjectSvgSource | undefined = this.svgSourcesByObjectId.get(projectObject.id);

    if (cachedSource?.svgText === projectObject.svgText) {
      return cachedSource.svgSource;
    }

    const svgSource: ObjectSvgSource = getObjectSvgSource(projectObject.svgText);

    this.svgSourcesByObjectId.set(projectObject.id, { svgText: projectObject.svgText, svgSource });

    return svgSource;
  }

  private getObjectArtworkDrawableSet(
    projectObject: ProjectObject,
    svgSource: ObjectSvgSource,
  ): ObjectArtworkDrawableSet {
    const toleranceUserUnits: number = getObjectFlatteningTolerance(projectObject, svgSource.viewBox);
    const artworkKey: string = getObjectArtworkKey(projectObject, toleranceUserUnits);
    const cachedArtwork: CachedObjectArtworkDrawableSet | undefined = this.artworksByObjectId.get(projectObject.id);

    if (cachedArtwork?.artworkKey === artworkKey) {
      return cachedArtwork.artworkDrawableSet;
    }

    const artworkDrawableSet: ObjectArtworkDrawableSet = getObjectArtworkDrawableSet({
      projectObject,
      svgSource,
      toleranceUserUnits,
    });

    this.artworksByObjectId.set(projectObject.id, { artworkKey, artworkDrawableSet });

    return artworkDrawableSet;
  }

  private dropRemovedObjects(projectObjects: ProjectObject[]): void {
    const objectIds: Set<string> = new Set(
      projectObjects.map((projectObject: ProjectObject): string => projectObject.id),
    );

    for (const objectCache of [this.svgSourcesByObjectId, this.artworksByObjectId, this.entriesByObjectId]) {
      for (const objectId of objectCache.keys()) {
        if (!objectIds.has(objectId)) {
          objectCache.delete(objectId);
        }
      }
    }
  }
}
