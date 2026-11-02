import { WHEEL_DELTA_MODE_LINE } from '../browser/browser.events.constants';
import { BED_WHEEL_LINE_HEIGHT_PX } from './bed.zoom.constants';
import { getBedWheelZoomFactor } from './get.bed.wheel.zoom.factor';

const WHEEL_NOTCH_PX = 100;
const PIXEL_DELTA_MODE = 0;
const LINES = 3;
const LARGE_WHEEL_NOTCH_PX = 240;
const GENTLE_NOTCH_FACTOR_MAX = 1.155;

describe(getBedWheelZoomFactor.name, () => {
  it('zooms in when the wheel scrolls up and out by the same amount when it scrolls down', () => {
    const zoomInFactor: number = getBedWheelZoomFactor(-WHEEL_NOTCH_PX, PIXEL_DELTA_MODE);
    const zoomOutFactor: number = getBedWheelZoomFactor(WHEEL_NOTCH_PX, PIXEL_DELTA_MODE);

    expect(zoomInFactor).toBeGreaterThan(1);
    expect(zoomOutFactor).toBeLessThan(1);
    expect(zoomInFactor * zoomOutFactor).toBeCloseTo(1);
  });

  it('zooms by at most 15 % for one large 240 px wheel notch, gently enough to inspect a detail', () => {
    expect(getBedWheelZoomFactor(-LARGE_WHEEL_NOTCH_PX, PIXEL_DELTA_MODE)).toBeLessThanOrEqual(GENTLE_NOTCH_FACTOR_MAX);
    expect(getBedWheelZoomFactor(-LARGE_WHEEL_NOTCH_PX, PIXEL_DELTA_MODE)).toBeGreaterThan(1);
  });

  it('turns a wheel that counts lines into pixels', () => {
    expect(getBedWheelZoomFactor(LINES, WHEEL_DELTA_MODE_LINE))
      .toBeCloseTo(getBedWheelZoomFactor(LINES * BED_WHEEL_LINE_HEIGHT_PX, PIXEL_DELTA_MODE));
  });
});
