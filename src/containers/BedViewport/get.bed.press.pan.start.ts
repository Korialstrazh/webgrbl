/**
 * Decides how a press on the bed view pans. A middle press, or a left press while Space or Ctrl (Cmd) is held, pans
 * at once and keeps the press from the objects. A left press on empty bed, or on an object while nothing is selected,
 * pans once the pointer has moved past the drag distance, and still reaches the objects layer, so a click there
 * clears or makes the selection and a double-click works as before. With a selection, a left press on an object
 * never pans: it selects and moves it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { MIDDLE_POINTER_BUTTON, PRIMARY_POINTER_BUTTON } from '../../utils/browser/browser.events.constants';
import { BED_PRESS_PAN_START } from './bed.press.pan.start.constants';
import type { BedPressPanStart } from './bed.press.pan.start.constants';
import type { BedPressPanInput } from './interfaces/BedPressPanInput';

// Empty bed, or an object while nothing is selected yet: a drag there pans rather than moves the object.
const isLeftPressThatPansAfterDrag = (input: BedPressPanInput): boolean =>
  input.button === PRIMARY_POINTER_BUTTON && (!input.isOnObject || !input.hasSelection);

export const getBedPressPanStart = (input: BedPressPanInput): BedPressPanStart => {
  const isHeldKeyPan: boolean = input.button === PRIMARY_POINTER_BUTTON && (input.isSpaceHeld || input.isCtrlHeld);

  if (input.button === MIDDLE_POINTER_BUTTON || isHeldKeyPan) {
    return BED_PRESS_PAN_START.IMMEDIATE;
  }

  return isLeftPressThatPansAfterDrag(input) ? BED_PRESS_PAN_START.AFTER_DRAG : BED_PRESS_PAN_START.NONE;
};
