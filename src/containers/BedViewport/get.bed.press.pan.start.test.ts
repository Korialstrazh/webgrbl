import { describe, expect, it } from 'vitest';
import { MIDDLE_POINTER_BUTTON, PRIMARY_POINTER_BUTTON } from '../../utils/browser/browser.events.constants';
import { BED_PRESS_PAN_START } from './bed.press.pan.start.constants';
import { getBedPressPanStart } from './get.bed.press.pan.start';

const SECONDARY_POINTER_BUTTON = 2;

describe(getBedPressPanStart.name, () => {
  it.each([
    { name: 'a left press on empty bed pans after a drag', button: PRIMARY_POINTER_BUTTON, isSpaceHeld: false,
      isOnObject: false, expected: BED_PRESS_PAN_START.AFTER_DRAG },
    { name: 'a left press on an object moves the object', button: PRIMARY_POINTER_BUTTON, isSpaceHeld: false,
      isOnObject: true, expected: BED_PRESS_PAN_START.NONE },
    { name: 'Space plus a left press on an object pans at once', button: PRIMARY_POINTER_BUTTON, isSpaceHeld: true,
      isOnObject: true, expected: BED_PRESS_PAN_START.IMMEDIATE },
    { name: 'a middle press pans at once anywhere', button: MIDDLE_POINTER_BUTTON, isSpaceHeld: false,
      isOnObject: true, expected: BED_PRESS_PAN_START.IMMEDIATE },
    { name: 'a right press never pans', button: SECONDARY_POINTER_BUTTON, isSpaceHeld: false,
      isOnObject: false, expected: BED_PRESS_PAN_START.NONE },
  ])('$name', ({ button, isSpaceHeld, isOnObject, expected }) => {
    expect(getBedPressPanStart({ button, isSpaceHeld, isOnObject })).toBe(expected);
  });
});
