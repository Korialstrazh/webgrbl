/**
 * Gets the matrix from an object's SVG user units to its artwork box at the size it was imported, in millimetres with
 * the origin at the top left and Y down. The bed draws the artwork stretched to its box, so the root's own
 * preserveAspectRatio is replaced by a stretch.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import { getSvgViewBoxMatrix } from '../svg/get.svg.view.box.matrix';
import type { SvgViewBox } from '../svg/interfaces/SvgViewBox';
import { SVG_STRETCH_ASPECT_RATIO_FIT } from '../svg/svg.constants';
import type { ObjectArtworkSize } from './interfaces/ObjectArtworkSize';

export const getObjectArtworkMatrix = (
  artworkSize: ObjectArtworkSize,
  svgViewBox: SvgViewBox | undefined,
): SvgMatrix => {
  const stretchedViewBox: SvgViewBox | undefined = svgViewBox && {
    ...svgViewBox,
    aspectRatioFit: SVG_STRETCH_ASPECT_RATIO_FIT,
  };

  return getSvgViewBoxMatrix(stretchedViewBox, {
    widthMm: artworkSize.intrinsicWidthMm,
    heightMm: artworkSize.intrinsicHeightMm,
  });
};
