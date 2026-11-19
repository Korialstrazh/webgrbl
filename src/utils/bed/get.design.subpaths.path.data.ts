/**
 * Gets the SVG path data of flattened subpaths, a closed subpath ending in a close command, with the coordinates
 * rounded like the Toolpath view paths.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import { getToolpathPathPointText } from '../toolpath/get.toolpath.path.point.text';
import { SVG_PATH_CLOSE, SVG_PATH_LINE_TO, SVG_PATH_MOVE_TO } from '../toolpath/toolpath.drawing.constants';

const getSubpathPathData = (subpath: SvgSubpath): string => {
  const pointTexts: string[] = subpath.points.map(getToolpathPathPointText);
  const pathData: string = SVG_PATH_MOVE_TO + pointTexts.join(SVG_PATH_LINE_TO);

  return subpath.isClosed ? pathData + SVG_PATH_CLOSE : pathData;
};

export const getDesignSubpathsPathData = (subpaths: SvgSubpath[]): string =>
  subpaths
    .filter((subpath: SvgSubpath): boolean => !!subpath.points.length)
    .map(getSubpathPathData)
    .join('');
