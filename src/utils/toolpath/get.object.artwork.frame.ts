/**
 * Measures where an object's drawn geometry (stroke centre lines and fill outlines, no stroke width) sits inside its
 * box, so the Objects list, the size fields and the selection box show the same size the job burns instead of the
 * SVG page with its empty margins. The frame depends only on the SVG and its imported size, so it is kept per SVG and
 * a move, scale or turn reads it again without parsing. An axis with no extent (a lone straight line) keeps the full
 * box on that axis, so a size typed for it can still be turned into a box size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getSvgMatrixPoint } from '../svg/geometry/get.svg.matrix.point';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgDrawable } from '../svg/geometry/interfaces/SvgDrawable';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import { getObjectArtworkDrawableSet } from './get.object.artwork.drawable.set';
import { getObjectArtworkScaleMatrix } from './get.object.artwork.scale.matrix';
import { getObjectFlatteningTolerance } from './get.object.flattening.tolerance';
import { getObjectSvgSource } from './get.object.svg.source';
import { getSubpathsBounds } from './get.subpaths.bounds';
import type { ObjectArtworkFrame } from './interfaces/ObjectArtworkFrame';
import type { ObjectArtworkFrameSource } from './interfaces/ObjectArtworkFrameSource';
import type { ObjectSvgSource } from './interfaces/ObjectSvgSource';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';
import { FULL_OBJECT_ARTWORK_FRAME } from './object.artwork.frame.constants';

// Enough for every object of an open project; older entries go first.
const MAX_CACHED_ARTWORK_FRAMES = 64;
const ARTWORK_FRAME_KEY_SEPARATOR = '\u0000';

const ARTWORK_FRAMES_BY_KEY: Map<string, ObjectArtworkFrame> = new Map<string, ObjectArtworkFrame>();

const getArtworkFrameKey = (source: ObjectArtworkFrameSource): string =>
  [source.svgText, source.intrinsicWidthMm, source.intrinsicHeightMm].join(ARTWORK_FRAME_KEY_SEPARATOR);

/** The geometry's box in the imported artwork frame: millimetres from the page's top-left corner, Y down. */
const getArtworkGeometryBounds = (source: ObjectArtworkFrameSource): ToolpathBounds | undefined => {
  const { intrinsicWidthMm, intrinsicHeightMm }: ObjectArtworkFrameSource = source;
  const projectObject: ProjectObject = {
    ...source,
    id: '',
    name: '',
    xMm: 0,
    yMm: 0,
    widthMm: intrinsicWidthMm,
    heightMm: intrinsicHeightMm,
    rotationDeg: 0,
  };
  const svgSource: ObjectSvgSource = getObjectSvgSource(source.svgText);
  const toleranceUserUnits: number = getObjectFlatteningTolerance(projectObject, svgSource.viewBox);
  const { svgDrawables } = getObjectArtworkDrawableSet({ projectObject, svgSource, toleranceUserUnits });
  const matrix: SvgMatrix = getObjectArtworkScaleMatrix(projectObject, svgSource.viewBox);

  return getSubpathsBounds(svgDrawables.flatMap((drawable: SvgDrawable): SvgSubpath[] => drawable.subpaths.map(
    (subpath: SvgSubpath): SvgSubpath => ({
      ...subpath,
      points: subpath.points.map((point: GeometryPoint): GeometryPoint => getSvgMatrixPoint(matrix, point)),
    }),
  )));
};

const hasArtworkExtent = (startMm: number, endMm: number, boxSizeMm: number): boolean =>
  boxSizeMm > 0 && endMm > startMm;

const measureObjectArtworkFrame = (source: ObjectArtworkFrameSource): ObjectArtworkFrame => {
  const { intrinsicWidthMm, intrinsicHeightMm }: ObjectArtworkFrameSource = source;
  const bounds: ToolpathBounds | undefined = getArtworkGeometryBounds(source);

  if (!bounds) {
    return FULL_OBJECT_ARTWORK_FRAME;
  }

  const hasWidth: boolean = hasArtworkExtent(bounds.minX, bounds.maxX, intrinsicWidthMm);
  const hasHeight: boolean = hasArtworkExtent(bounds.minY, bounds.maxY, intrinsicHeightMm);

  return {
    leftFraction: hasWidth ? bounds.minX / intrinsicWidthMm : 0,
    topFraction: hasHeight ? bounds.minY / intrinsicHeightMm : 0,
    widthFraction: hasWidth ? (bounds.maxX - bounds.minX) / intrinsicWidthMm : 1,
    heightFraction: hasHeight ? (bounds.maxY - bounds.minY) / intrinsicHeightMm : 1,
  };
};

export const getObjectArtworkFrame = (source: ObjectArtworkFrameSource): ObjectArtworkFrame => {
  const frameKey: string = getArtworkFrameKey(source);
  const cachedFrame: ObjectArtworkFrame | undefined = ARTWORK_FRAMES_BY_KEY.get(frameKey);

  if (cachedFrame) {
    return cachedFrame;
  }

  const artworkFrame: ObjectArtworkFrame = measureObjectArtworkFrame(source);

  if (ARTWORK_FRAMES_BY_KEY.size >= MAX_CACHED_ARTWORK_FRAMES) {
    ARTWORK_FRAMES_BY_KEY.delete(ARTWORK_FRAMES_BY_KEY.keys().next().value ?? '');
  }

  ARTWORK_FRAMES_BY_KEY.set(frameKey, artworkFrame);

  return artworkFrame;
};
