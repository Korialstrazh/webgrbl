/**
 * Lays out the bed rulers for the zoomed and panned bed: which bed coordinates get a label and where on screen each
 * one sits. A label whose text would reach past the bed or out of the view is left out, so no label is clipped.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BED_RULER_DIGIT_WIDTH_FRACTION,
  BED_RULER_FONT_SIZE_REM,
  BED_RULER_LABEL_OFFSET_REM,
  BED_RULER_MIN_LABEL_SPACING_REM,
} from './bed.ruler.constants';
import { getBedRulerTickPositions } from './get.bed.ruler.tick.positions';
import { getBedViewBox } from './get.bed.view.box';
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import type { BedRulerLabel } from './interfaces/BedRulerLabel';
import type { BedRulerLayout } from './interfaces/BedRulerLayout';
import type { BedRulersRequest } from './interfaces/BedRulersRequest';
import type { BedRulerTextSizes } from './interfaces/BedRulerTextSizes';
import type { BedRulerView } from './interfaces/BedRulerView';
import type { BedViewBox } from './interfaces/BedViewBox';

const getLabelWidthPx = (valueMm: number, fontSizePx: number): number =>
  String(valueMm).length * BED_RULER_DIGIT_WIDTH_FRACTION * fontSizePx;

const getTopRulerLabels = (view: BedRulerView, labelEndPx: number): BedRulerLabel[] => {
  const { request: { dimensions }, viewBox, pixelsPerMm, textSizes } = view;
  const labels: BedRulerLabel[] = [];
  const positions: number[] = getBedRulerTickPositions({
    visibleStartMm: viewBox.xMm,
    visibleEndMm: viewBox.xMm + viewBox.widthMm,
    bedLengthMm: dimensions.widthMm,
    pixelsPerMm,
    minSpacingPx: textSizes.minSpacingPx,
  });

  for (const valueMm of positions) {
    const offsetPx: number = (valueMm - viewBox.xMm) * pixelsPerMm;

    if (offsetPx + textSizes.labelOffsetPx + getLabelWidthPx(valueMm, textSizes.fontSizePx) <= labelEndPx) {
      labels.push({ valueMm, offsetPx });
    }
  }

  return labels;
};

const getLeftRulerLabels = (view: BedRulerView, labelStartPx: number): BedRulerLabel[] => {
  const { request: { dimensions, screenSize }, viewBox, pixelsPerMm, textSizes } = view;
  const labels: BedRulerLabel[] = [];
  // Machine Y grows up from the front edge, so the visible machine Y range is the SVG range turned over.
  const positions: number[] = getBedRulerTickPositions({
    visibleStartMm: dimensions.heightMm - (viewBox.yMm + viewBox.heightMm),
    visibleEndMm: dimensions.heightMm - viewBox.yMm,
    bedLengthMm: dimensions.heightMm,
    pixelsPerMm,
    minSpacingPx: textSizes.minSpacingPx,
  });

  for (const valueMm of positions) {
    const offsetPx: number = (dimensions.heightMm - valueMm - viewBox.yMm) * pixelsPerMm;
    const hasRoomAbove: boolean = offsetPx - textSizes.labelOffsetPx - textSizes.fontSizePx >= labelStartPx;

    if (hasRoomAbove && offsetPx <= screenSize.heightPx) {
      labels.push({ valueMm, offsetPx });
    }
  }

  return labels;
};

export const getBedRulers = (request: BedRulersRequest): BedRulerLayout => {
  const { screenSize, dimensions, rootFontSizePx } = request;
  const pixelsPerMm: number = getBedViewPixelsPerMm(request);
  const viewBox: BedViewBox = getBedViewBox(request);
  const textSizes: BedRulerTextSizes = {
    fontSizePx: BED_RULER_FONT_SIZE_REM * rootFontSizePx,
    labelOffsetPx: BED_RULER_LABEL_OFFSET_REM * rootFontSizePx,
    minSpacingPx: BED_RULER_MIN_LABEL_SPACING_REM * rootFontSizePx,
  };
  const view: BedRulerView = { request, viewBox, pixelsPerMm, textSizes };
  const bedTopPx: number = -viewBox.yMm * pixelsPerMm;
  const bedLeftPx: number = -viewBox.xMm * pixelsPerMm;
  const topRulerYPx: number = Math.max(0, bedTopPx);

  return {
    topRulerYPx,
    leftRulerXPx: Math.max(0, bedLeftPx),
    topLabels: getTopRulerLabels(view, Math.min(screenSize.widthPx, bedLeftPx + dimensions.widthMm * pixelsPerMm)),
    leftLabels: getLeftRulerLabels(view, topRulerYPx),
  };
};
