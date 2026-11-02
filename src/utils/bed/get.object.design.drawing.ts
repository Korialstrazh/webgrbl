/**
 * Gets an object artwork as the Design view draws it: the same flattened shapes the toolpath is built from, each paint
 * with the layer it belongs to, in the millimetres of the artwork box at its imported size. Reading an SVG is slow, so
 * the drawing is read once per artwork and kept in a small cache that drops the least recently used one first; moving,
 * scaling or turning an object never reads it again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getPaintLayerKey } from '../layers/get.paint.layer.key';
import { getSvgDocumentDrawables } from '../svg/geometry/get.svg.document.drawables';
import { getSvgExpandedDocument } from '../svg/geometry/get.svg.expanded.document';
import { getSvgMatrixAreaScale } from '../svg/geometry/get.svg.matrix.area.scale';
import { getSvgMatrixMaxScale } from '../svg/geometry/get.svg.matrix.max.scale';
import { getSvgMatrixPoint } from '../svg/geometry/get.svg.matrix.point';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgDrawable } from '../svg/geometry/interfaces/SvgDrawable';
import type { SvgExpandedDocument } from '../svg/geometry/interfaces/SvgExpandedDocument';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import { getSvgViewBox } from '../svg/get.svg.view.box';
import { getObjectArtworkMatrix } from '../toolpath/get.object.artwork.matrix';
import { TOOLPATH_TOLERANCE_MM } from '../toolpath/toolpath.constants';
import {
  DESIGN_DRAWING_KEY_SEPARATOR,
  DESIGN_PAINT_ROLE,
  OBJECT_DESIGN_DRAWING_CACHE_SIZE,
} from './bed.design.constants';
import { getDesignPaintRuns } from './get.design.paint.runs';
import { getDesignSubpathsPathData } from './get.design.subpaths.path.data';
import type { DesignDrawingSource } from './interfaces/DesignDrawingSource';
import type { ObjectDesignDrawing } from './interfaces/ObjectDesignDrawing';
import type { ObjectDesignPaint } from './interfaces/ObjectDesignPaint';

const EMPTY_DESIGN_DRAWING: ObjectDesignDrawing = { runs: [] };

const DRAWINGS_BY_KEY: Map<string, ObjectDesignDrawing> = new Map<string, ObjectDesignDrawing>();

const getDesignDrawingKey = (source: DesignDrawingSource): string =>
  [source.svgText, source.intrinsicWidthMm, source.intrinsicHeightMm].join(DESIGN_DRAWING_KEY_SEPARATOR);

const getArtworkSubpaths = (subpaths: SvgSubpath[], matrix: SvgMatrix, isClosed: boolean): SvgSubpath[] =>
  subpaths.map((subpath: SvgSubpath): SvgSubpath => ({
    points: subpath.points.map((point: GeometryPoint): GeometryPoint => getSvgMatrixPoint(matrix, point)),
    isClosed: isClosed || subpath.isClosed,
  }));

/** The fill path, then the stroke path, the order SVG paints them in; a fill outline is always closed. */
const getDrawableDesignPaints = (drawable: SvgDrawable, matrix: SvgMatrix): ObjectDesignPaint[] => {
  const { fill, stroke, strokeWidth, fillRule } = drawable.paint;
  const designPaints: ObjectDesignPaint[] = [];

  if (fill) {
    designPaints.push({
      role: DESIGN_PAINT_ROLE.FILL,
      layerKey: getPaintLayerKey(fill),
      pathData: getDesignSubpathsPathData(getArtworkSubpaths(drawable.subpaths, matrix, true)),
      colour: fill.colour,
      opacity: fill.opacity,
      strokeWidthMm: 0,
      fillRule,
    });
  }

  if (stroke) {
    designPaints.push({
      role: DESIGN_PAINT_ROLE.STROKE,
      layerKey: getPaintLayerKey(stroke),
      pathData: getDesignSubpathsPathData(getArtworkSubpaths(drawable.subpaths, matrix, false)),
      colour: stroke.colour,
      opacity: stroke.opacity,
      strokeWidthMm: strokeWidth * getSvgMatrixAreaScale(matrix),
      fillRule,
    });
  }

  return designPaints;
};

const readObjectDesignDrawing = (source: DesignDrawingSource): ObjectDesignDrawing => {
  const expandedDocument: SvgExpandedDocument | undefined = getSvgExpandedDocument(source.svgText);

  if (!expandedDocument) {
    return EMPTY_DESIGN_DRAWING;
  }

  const matrix: SvgMatrix = getObjectArtworkMatrix(source, getSvgViewBox(expandedDocument.svgDocument.documentElement));
  const toleranceUserUnits: number = TOOLPATH_TOLERANCE_MM / getSvgMatrixMaxScale(matrix);

  if (!(toleranceUserUnits > 0)) {
    return EMPTY_DESIGN_DRAWING;
  }

  const designPaints: ObjectDesignPaint[] = [];

  for (const drawable of getSvgDocumentDrawables(expandedDocument, toleranceUserUnits).drawables) {
    designPaints.push(...getDrawableDesignPaints(drawable, matrix));
  }

  return { runs: getDesignPaintRuns(designPaints) };
};

const dropLeastRecentlyUsedDrawing = (): void => {
  const oldestEntry: IteratorResult<string> = DRAWINGS_BY_KEY.keys().next();

  if (!oldestEntry.done) {
    DRAWINGS_BY_KEY.delete(oldestEntry.value);
  }
};

export const getObjectDesignDrawing = (source: DesignDrawingSource): ObjectDesignDrawing => {
  const drawingKey: string = getDesignDrawingKey(source);
  const designDrawing: ObjectDesignDrawing = DRAWINGS_BY_KEY.get(drawingKey) ?? readObjectDesignDrawing(source);

  // Deleting and setting again moves the drawing to the end, so the first key is always the least recently used.
  DRAWINGS_BY_KEY.delete(drawingKey);
  DRAWINGS_BY_KEY.set(drawingKey, designDrawing);

  if (DRAWINGS_BY_KEY.size > OBJECT_DESIGN_DRAWING_CACHE_SIZE) {
    dropLeastRecentlyUsedDrawing();
  }

  return designDrawing;
};
