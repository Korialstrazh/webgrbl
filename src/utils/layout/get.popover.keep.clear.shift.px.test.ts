import { describe, expect, it } from 'vitest';
import { getPopoverKeepClearShiftPx } from './get.popover.keep.clear.shift.px';
import type { ScreenBox } from './interfaces/ScreenBox';

const PILL_BOX: ScreenBox = { left: 1180, right: 1428, top: 8, bottom: 48 };

describe('getPopoverKeepClearShiftPx', () => {
  it('leaves the popover in place without an area to keep clear', () => {
    expect(getPopoverKeepClearShiftPx(PILL_BOX, undefined, 380)).toEqual({ leftPx: 0, downPx: 0 });
  });

  it('moves the popover to the left of the steps when the window has room', () => {
    const stepsBox: ScreenBox = { left: 1114, right: 1406, top: 170, bottom: 280 };

    expect(getPopoverKeepClearShiftPx(PILL_BOX, stepsBox, 380)).toEqual({ leftPx: 322, downPx: 0 });
  });

  it('moves the popover below the steps when there is no room beside them', () => {
    const narrowPill: ScreenBox = { left: 565, right: 788, top: 8, bottom: 48 };
    const stepsBox: ScreenBox = { left: 25, right: 775, top: 215, bottom: 326 };

    expect(getPopoverKeepClearShiftPx(narrowPill, stepsBox, 380)).toEqual({ leftPx: 0, downPx: 286 });
  });

  it('leaves the popover in place when it already ends left of the steps', () => {
    const stepsBox: ScreenBox = { left: 1500, right: 1900, top: 170, bottom: 280 };

    expect(getPopoverKeepClearShiftPx(PILL_BOX, stepsBox, 380)).toEqual({ leftPx: 0, downPx: 0 });
  });
});
