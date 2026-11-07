/**
 * Decides how a press on the bed view pans. A middle press, or a left press while Space is held, pans at once and
 * keeps the press from the objects. A left press on empty bed (anything but a drawn object or its handles) pans once
 * the pointer has moved past the drag distance, and still reaches the objects layer, so a click there clears the
 * selection and a double-click works as before. A left press on an object never pans: it selects and moves it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { MIDDLE_POINTER_BUTTON, PRIMARY_POINTER_BUTTON } from '../../utils/browser/browser.events.constants';
import { BED_PRESS_PAN_START } from './bed.press.pan.start.constants';
import type { BedPressPanStart } from './bed.press.pan.start.constants';
import type { BedPressPanInput } from './interfaces/BedPressPanInput';

const isLeftPressOnEmptyBed = (input: BedPressPanInput): boolean =>
  input.button === PRIMARY_POINTER_BUTTON && !input.isOnObject;

export const getBedPressPanStart = (input: BedPressPanInput): BedPressPanStart => {
  if (input.button === MIDDLE_POINTER_BUTTON || (input.button === PRIMARY_POINTER_BUTTON && input.isSpaceHeld)) {
    return BED_PRESS_PAN_START.IMMEDIATE;
  }

  return isLeftPressOnEmptyBed(input) ? BED_PRESS_PAN_START.AFTER_DRAG : BED_PRESS_PAN_START.NONE;
};
