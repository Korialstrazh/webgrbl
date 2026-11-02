/**
 * Gets where a splitter bar goes for a key: one step back or forward along the bar direction for the arrow keys, the
 * start or the end of its range for Home and End; undefined for any other key.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  ARROW_DOWN_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  END_KEY,
  HOME_KEY,
} from '../browser/browser.events.constants';
import type { SplitterBarRange } from './interfaces/SplitterBarRange';
import type { SplitterKeyRequest } from './interfaces/SplitterKeyRequest';

/** Which keys move a bar back and forward: across a side-by-side splitter left and right, down a stack up and down. */
const getStepKeys = (isVertical: boolean): readonly [string, string] =>
  (isVertical ? [ARROW_UP_KEY, ARROW_DOWN_KEY] : [ARROW_LEFT_KEY, ARROW_RIGHT_KEY]);

export const getSplitterKeyTargetPercent = (
  request: SplitterKeyRequest,
  barRange: SplitterBarRange,
): number | undefined => {
  const { key, isVertical, stepPercent } = request;
  const [backKey, forwardKey] = getStepKeys(isVertical);

  switch (key) {
  case backKey:
    return barRange.positionPercent - stepPercent;
  case forwardKey:
    return barRange.positionPercent + stepPercent;
  case HOME_KEY:
    return barRange.minPercent;
  case END_KEY:
    return barRange.maxPercent;
  default:
    return undefined;
  }
};
