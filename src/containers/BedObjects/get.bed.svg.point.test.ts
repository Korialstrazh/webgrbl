import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import { getBedViewBox } from '../../utils/bed/get.bed.view.box';
import { getBedViewPixelsPerMm } from '../../utils/bed/get.bed.view.pixels.per.mm';
import { getBedViewPoint } from '../../utils/bed/get.bed.view.point';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { BedViewBox } from '../../utils/bed/interfaces/BedViewBox';
import type { BedViewPoint } from '../../utils/bed/interfaces/BedViewPoint';
import type { BedViewportFrame } from '../../utils/bed/interfaces/BedViewportFrame';
import { mockSvgScreenMatrix } from '../../utils/test.support/svg.screen.matrix.mock';
import { getBedSvgPoint } from './get.bed.svg.point';
import type { BedSvgPoint } from './interfaces/BedSvgPoint';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
// The bed view sits 300 px from the left and 56 px from the top of the window.
const VIEW_LEFT_PX = 300;
const VIEW_TOP_PX = 56;
const POINTER_X_PX = 520;
const POINTER_Y_PX = 180;
const POINTER_MOVE_PX = 60;
const ZOOM = 6;
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const SVG_TAG_NAME = 'svg';
const ZOOMED_FRAME: BedViewportFrame = {
  viewport: { zoom: ZOOM, centerXMm: 120, centerYMm: 90 },
  screenSize: { widthPx: 800, heightPx: 400 },
  dimensions: DIMENSIONS,
};

/** Mocks the screen matrix the browser gives the bed SVG for the frame's view box, the zoom and pan included. */
const mockZoomedScreenMatrix = (frame: BedViewportFrame): void => {
  const pixelsPerMm: number = getBedViewPixelsPerMm(frame);
  const viewBox: BedViewBox = getBedViewBox(frame);

  mockSvgScreenMatrix(
    {
      a: pixelsPerMm,
      b: 0,
      c: 0,
      d: pixelsPerMm,
      e: VIEW_LEFT_PX - viewBox.xMm * pixelsPerMm,
      f: VIEW_TOP_PX - viewBox.yMm * pixelsPerMm,
    },
    {
      a: 1 / pixelsPerMm,
      b: 0,
      c: 0,
      d: 1 / pixelsPerMm,
      e: viewBox.xMm - VIEW_LEFT_PX / pixelsPerMm,
      f: viewBox.yMm - VIEW_TOP_PX / pixelsPerMm,
    },
  );
};

describe(getBedSvgPoint.name, () => {
  it('gives the same bed point as the zoomed viewport for a pointer over the zoomed and panned bed', () => {
    mockZoomedScreenMatrix(ZOOMED_FRAME);
    const svgElement: SVGSVGElement = document.createElementNS(SVG_NAMESPACE, SVG_TAG_NAME);
    const bedSvgPoint: BedSvgPoint | undefined = getBedSvgPoint(svgElement, POINTER_X_PX, POINTER_Y_PX);
    const viewportPoint: BedViewPoint | undefined = getBedViewPoint(ZOOMED_FRAME, {
      xPx: POINTER_X_PX - VIEW_LEFT_PX,
      yPx: POINTER_Y_PX - VIEW_TOP_PX,
    });

    expect(bedSvgPoint?.x).toBeCloseTo(viewportPoint?.xMm ?? Number.NaN);
    expect(bedSvgPoint?.y).toBeCloseTo(viewportPoint?.yMm ?? Number.NaN);
  });

  it('moves six times fewer millimetres per pixel at six times the zoom', () => {
    mockZoomedScreenMatrix(ZOOMED_FRAME);
    const svgElement: SVGSVGElement = document.createElementNS(SVG_NAMESPACE, SVG_TAG_NAME);
    const startPoint: BedSvgPoint | undefined = getBedSvgPoint(svgElement, POINTER_X_PX, POINTER_Y_PX);
    const movedPoint: BedSvgPoint | undefined =
      getBedSvgPoint(svgElement, POINTER_X_PX + POINTER_MOVE_PX, POINTER_Y_PX);
    const fittedPixelsPerMm: number = getBedViewPixelsPerMm({
      ...ZOOMED_FRAME,
      viewport: { ...ZOOMED_FRAME.viewport, zoom: 1 },
    });

    expect((movedPoint?.x ?? 0) - (startPoint?.x ?? 0)).toBeCloseTo(POINTER_MOVE_PX / fittedPixelsPerMm / ZOOM);
  });
});
