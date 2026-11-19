/**
 * Tests for the bed gesture state: off at start, on and off with the activity action.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { describe, expect, it } from 'vitest';
import { Action } from './action';
import { BedGestureActivityChanged, bedGestureReducer, selectIsBedGestureActive } from './bed.gesture.state';
import type { BedGestureState } from './bed.gesture.state';

const UNKNOWN_ACTION_TYPE = 'unknown action';

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

describe(bedGestureReducer.name, () => {
  it('starts with no gesture under way', () => {
    const state: BedGestureState = bedGestureReducer(undefined, new UnknownAction());

    expect(selectIsBedGestureActive({ bedGesture: state })).toBe(false);
  });

  it('reports a gesture from its start until its end', () => {
    const startedState: BedGestureState = bedGestureReducer(
      undefined,
      new BedGestureActivityChanged({ isBedGestureActive: true }),
    );
    const endedState: BedGestureState = bedGestureReducer(
      startedState,
      new BedGestureActivityChanged({ isBedGestureActive: false }),
    );

    expect(selectIsBedGestureActive({ bedGesture: startedState })).toBe(true);
    expect(selectIsBedGestureActive({ bedGesture: endedState })).toBe(false);
  });
});
