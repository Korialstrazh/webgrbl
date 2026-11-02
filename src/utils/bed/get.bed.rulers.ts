/**
 * Lays out the bed rulers for the zoomed and panned bed: which bed coordinates get a label and a long tick, where the
 * short ticks between them go, and where on screen each one sits along its band. A label whose text would reach past
 * the bed or out of its band is left out, so no label is clipped; its long tick stays.
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
  BED_RULER_MIN_MINOR_TICK_SPACING_REM,
  BED_RULER_MINOR_TICKS_PER_STEP,
} from './bed.ruler.constants';
import { getBedRulerLabelStepMm } from './get.bed.ruler.label.step.mm';
import { getBedRulerTickPositions } from './get.bed.ruler.tick.positions';
import { getBedViewBox } from './get.bed.view.box';
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import type { BedRulerAxis } from './interfaces/BedRulerAxis';
import type { BedRulerLabel } from './interfaces/BedRulerLabel';
import type { BedRulerLayout } from './interfaces/BedRulerLayout';
import type { BedRulersRequest } from './interfaces/BedRulersRequest';
import type { BedRulerTextSizes } from './interfaces/BedRulerTextSizes';
import type { BedRulerTick } from './interfaces/BedRulerTick';

// A label exactly at the end of its band, such as Y 0 on a bed that fills the height, stays despite rounding.
const BED_RULER_EDGE_TOLERANCE_PX = 0.5;

const getLabelWidthPx = (valueMm: number, fontSizePx: number): number =>
  String(valueMm).length * BED_RULER_DIGIT_WIDTH_FRACTION * fontSizePx;

/** Lists the ticks of one band: a long tick at every label step, and short ticks between them when there is room. */
const getBedRulerTicks = (axis: BedRulerAxis, textSizes: BedRulerTextSizes): BedRulerTick[] => {
  const { visibleStartMm, visibleEndMm, bedLengthMm, pixelsPerMm, labelStepMm, getOffsetPx } = axis;
  const minorStepMm: number = labelStepMm / BED_RULER_MINOR_TICKS_PER_STEP;
  const hasRoomForMinorTicks: boolean = minorStepMm * pixelsPerMm >= textSizes.minMinorTickSpacingPx;
  const stepMm: number = hasRoomForMinorTicks ? minorStepMm : labelStepMm;
  const ticksPerLabel: number = hasRoomForMinorTicks ? BED_RULER_MINOR_TICKS_PER_STEP : 1;
  const ticks: BedRulerTick[] = [];
  const positions: number[] = getBedRulerTickPositions({ visibleStartMm, visibleEndMm, bedLengthMm, stepMm });

  for (const positionMm of positions) {
    ticks.push({
      offsetPx: getOffsetPx(positionMm),
      isMajor: Math.round(positionMm / stepMm) % ticksPerLabel === 0,
    });
  }

  return ticks;
};

const getLabelPositions = (axis: BedRulerAxis): number[] => {
  const { visibleStartMm, visibleEndMm, bedLengthMm, labelStepMm } = axis;

  return getBedRulerTickPositions({ visibleStartMm, visibleEndMm, bedLengthMm, stepMm: labelStepMm });
};

/** Labels of bed X, written to the right of their tick; each must end before the bed or the band does. */
const getTopRulerLabels = (axis: BedRulerAxis, textSizes: BedRulerTextSizes, labelEndPx: number): BedRulerLabel[] => {
  const labels: BedRulerLabel[] = [];

  for (const valueMm of getLabelPositions(axis)) {
    const offsetPx: number = axis.getOffsetPx(valueMm);

    if (offsetPx + textSizes.labelOffsetPx + getLabelWidthPx(valueMm, textSizes.fontSizePx) <= labelEndPx) {
      labels.push({ valueMm, offsetPx });
    }
  }

  return labels;
};

/** Labels of machine Y, written upwards from their tick; each must start below the bed's back edge and the band top. */
const getLeftRulerLabels = (
  axis: BedRulerAxis,
  textSizes: BedRulerTextSizes,
  labelStartPx: number,
): BedRulerLabel[] => {
  const labels: BedRulerLabel[] = [];

  for (const valueMm of getLabelPositions(axis)) {
    const offsetPx: number = axis.getOffsetPx(valueMm);
    const labelTopPx: number = offsetPx - textSizes.labelOffsetPx - getLabelWidthPx(valueMm, textSizes.fontSizePx);

    if (labelTopPx >= labelStartPx && offsetPx <= axis.bandLengthPx + BED_RULER_EDGE_TOLERANCE_PX) {
      labels.push({ valueMm, offsetPx });
    }
  }

  return labels;
};

export const getBedRulers = (request: BedRulersRequest): BedRulerLayout => {
  const { screenSize, dimensions, rootFontSizePx } = request;
  const pixelsPerMm: number = getBedViewPixelsPerMm(request);
  const { xMm, yMm, widthMm, heightMm } = getBedViewBox(request);
  const textSizes: BedRulerTextSizes = {
    fontSizePx: BED_RULER_FONT_SIZE_REM * rootFontSizePx,
    labelOffsetPx: BED_RULER_LABEL_OFFSET_REM * rootFontSizePx,
    minSpacingPx: BED_RULER_MIN_LABEL_SPACING_REM * rootFontSizePx,
    minMinorTickSpacingPx: BED_RULER_MIN_MINOR_TICK_SPACING_REM * rootFontSizePx,
  };
  const labelStepMm: number = pixelsPerMm > 0 ? getBedRulerLabelStepMm(pixelsPerMm, textSizes.minSpacingPx) : 0;
  const topAxis: BedRulerAxis = {
    visibleStartMm: xMm,
    visibleEndMm: xMm + widthMm,
    bedLengthMm: dimensions.widthMm,
    bandLengthPx: screenSize.widthPx,
    pixelsPerMm,
    labelStepMm,
    getOffsetPx: (valueMm: number): number => (valueMm - xMm) * pixelsPerMm,
  };
  // Machine Y grows up from the front edge, so the visible machine Y range is the SVG range turned over.
  const leftAxis: BedRulerAxis = {
    visibleStartMm: dimensions.heightMm - (yMm + heightMm),
    visibleEndMm: dimensions.heightMm - yMm,
    bedLengthMm: dimensions.heightMm,
    bandLengthPx: screenSize.heightPx,
    pixelsPerMm,
    labelStepMm,
    getOffsetPx: (valueMm: number): number => (dimensions.heightMm - valueMm - yMm) * pixelsPerMm,
  };
  const bedRightPx: number = topAxis.getOffsetPx(dimensions.widthMm);
  const bedBackPx: number = leftAxis.getOffsetPx(dimensions.heightMm);

  return {
    topLabels: getTopRulerLabels(topAxis, textSizes, Math.min(screenSize.widthPx, bedRightPx)),
    leftLabels: getLeftRulerLabels(leftAxis, textSizes, Math.max(0, bedBackPx)),
    topTicks: getBedRulerTicks(topAxis, textSizes),
    leftTicks: getBedRulerTicks(leftAxis, textSizes),
  };
};
