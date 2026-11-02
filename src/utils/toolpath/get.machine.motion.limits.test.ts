import { GRBL_SETTING_X_ACCELERATION, GRBL_SETTING_Y_MAX_RATE } from '../grbl/grbl.constants';
import { getMachineMotionLimits } from './get.machine.motion.limits';
import {
  DEFAULT_ACCELERATION_MM_PER_S2,
  DEFAULT_JUNCTION_DEVIATION_MM,
  DEFAULT_MAX_RATE_MM_PER_MIN,
} from './motion.constants';

const REPORTED_ACCELERATION = 250;
const REPORTED_MAX_RATE = 12000;

describe(getMachineMotionLimits.name, () => {
  it('reads the reported values', () => {
    const limits = getMachineMotionLimits({
      [GRBL_SETTING_X_ACCELERATION]: String(REPORTED_ACCELERATION),
      [GRBL_SETTING_Y_MAX_RATE]: String(REPORTED_MAX_RATE),
    });

    expect(limits.accelXMmPerS2).toBe(REPORTED_ACCELERATION);
    expect(limits.maxRateYMmPerMin).toBe(REPORTED_MAX_RATE);
  });

  it('falls back to the defaults when settings are missing', () => {
    expect(getMachineMotionLimits({})).toEqual({
      maxRateXMmPerMin: DEFAULT_MAX_RATE_MM_PER_MIN,
      maxRateYMmPerMin: DEFAULT_MAX_RATE_MM_PER_MIN,
      accelXMmPerS2: DEFAULT_ACCELERATION_MM_PER_S2,
      accelYMmPerS2: DEFAULT_ACCELERATION_MM_PER_S2,
      junctionDeviationMm: DEFAULT_JUNCTION_DEVIATION_MM,
    });
  });

  it('falls back to the default for zero, negative, empty and non-numeric values', () => {
    for (const reportedText of ['0', '-5', '', 'abc']) {
      const limits = getMachineMotionLimits({ [GRBL_SETTING_X_ACCELERATION]: reportedText });

      expect(limits.accelXMmPerS2).toBe(DEFAULT_ACCELERATION_MM_PER_S2);
    }
  });
});
