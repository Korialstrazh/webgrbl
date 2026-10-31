/**
 * Tests for the laser pointer state: the default power, power clamping and the firing flag.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POINTER_POWER_PERCENT,
  MAX_POINTER_POWER_PERCENT,
  MIN_POINTER_POWER_PERCENT,
} from '../machine/machine.command.constants';
import { Action } from './action';
import {
  LaserPointerFiringStarted,
  LaserPointerFiringStopped,
  LaserPointerPowerChanged,
  laserPointerReducer,
  selectIsLaserPointerFiring,
  selectLaserPointerPowerPercent,
} from './laser.pointer.state';
import type { LaserPointerState } from './laser.pointer.state';

const IN_RANGE_PERCENT = 2.5;
const ABOVE_CAP_PERCENT = 50;
const ZERO_PERCENT = 0;

class UnknownAction extends Action {
  public static readonly type: string = 'unknown action';
}

const getInitialState = (): LaserPointerState => laserPointerReducer(undefined, new UnknownAction());

describe(laserPointerReducer.name, () => {
  it('starts not firing at the default power', () => {
    const state: LaserPointerState = getInitialState();

    expect(selectIsLaserPointerFiring({ laserPointer: state })).toBe(false);
    expect(selectLaserPointerPowerPercent({ laserPointer: state })).toBe(DEFAULT_POINTER_POWER_PERCENT);
  });

  it('takes a power inside the range', () => {
    const state: LaserPointerState =
      laserPointerReducer(getInitialState(), new LaserPointerPowerChanged({ percent: IN_RANGE_PERCENT }));

    expect(state.powerPercent).toBe(IN_RANGE_PERCENT);
  });

  it('clamps a power above the cap to the cap', () => {
    const state: LaserPointerState =
      laserPointerReducer(getInitialState(), new LaserPointerPowerChanged({ percent: ABOVE_CAP_PERCENT }));

    expect(state.powerPercent).toBe(MAX_POINTER_POWER_PERCENT);
  });

  it('clamps a power below the minimum to the minimum', () => {
    const state: LaserPointerState =
      laserPointerReducer(getInitialState(), new LaserPointerPowerChanged({ percent: ZERO_PERCENT }));

    expect(state.powerPercent).toBe(MIN_POINTER_POWER_PERCENT);
  });

  it('is firing between firing started and firing stopped', () => {
    const firingState: LaserPointerState = laserPointerReducer(getInitialState(), new LaserPointerFiringStarted());

    expect(firingState.isFiring).toBe(true);
    expect(laserPointerReducer(firingState, new LaserPointerFiringStopped()).isFiring).toBe(false);
  });
});
