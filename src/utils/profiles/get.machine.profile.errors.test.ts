import { describe, expect, it } from 'vitest';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfileFieldError } from './interfaces/MachineProfileFieldError';
import { getMachineProfileErrors } from './get.machine.profile.errors';
import { MACHINE_PROFILE_ERROR_KEY } from './machine.profile.constants';
import { newMachineProfile } from './new.machine.profile';

const OVER_LIMIT_WORK_AREA_MM = 5001;
const LIMIT_WORK_AREA_MM = 5000;
const JOG_FEED_BELOW_RANGE = 99;
const JOG_FEED_ABOVE_RANGE = 10001;
const JOG_FEED_RANGE_MIN = 100;
const JOG_FEED_RANGE_MAX = 10000;
const FRAME_FEED_BELOW_RANGE = 99;
const FRAME_FEED_ABOVE_RANGE = 10001;
const FRAME_FEED_RANGE_MIN = 100;
const FRAME_FEED_RANGE_MAX = 10000;

const NAME_ERROR: MachineProfileFieldError = { field: 'name', messageKey: MACHINE_PROFILE_ERROR_KEY.NAME_REQUIRED };
const POWER_ERROR: MachineProfileFieldError = {
  field: 'maxPowerWatts',
  messageKey: MACHINE_PROFILE_ERROR_KEY.MAX_POWER_INVALID,
  messageParameters: { max: 500 },
};
const WORK_X_ERROR: MachineProfileFieldError = {
  field: 'workAreaXMm',
  messageKey: MACHINE_PROFILE_ERROR_KEY.WORK_AREA_X_INVALID,
  messageParameters: { max: 5000 },
};
const WORK_Y_ERROR: MachineProfileFieldError = {
  field: 'workAreaYMm',
  messageKey: MACHINE_PROFILE_ERROR_KEY.WORK_AREA_Y_INVALID,
  messageParameters: { max: 5000 },
};
const S_VALUE_ERROR: MachineProfileFieldError = {
  field: 'sValueMax',
  messageKey: MACHINE_PROFILE_ERROR_KEY.S_VALUE_MAX_INVALID,
  messageParameters: { min: 1, max: 100000 },
};
const JOG_FEED_ERROR: MachineProfileFieldError = {
  field: 'jogFeedRate',
  messageKey: MACHINE_PROFILE_ERROR_KEY.JOG_FEED_RATE_INVALID,
  messageParameters: { min: 100, max: 10000 },
};

const FRAME_MARGIN_ERROR: MachineProfileFieldError = {
  field: 'frameMarginMm',
  messageKey: MACHINE_PROFILE_ERROR_KEY.FRAME_MARGIN_INVALID,
};

const FRAME_FEED_ERROR: MachineProfileFieldError = {
  field: 'frameFeedMmPerMin',
  messageKey: MACHINE_PROFILE_ERROR_KEY.FRAME_FEED_RATE_INVALID,
  messageParameters: { min: FRAME_FEED_RANGE_MIN, max: FRAME_FEED_RANGE_MAX },
};

const INVALID_CASES: Array<[string, Partial<MachineProfile>, MachineProfileFieldError]> = [
  ['an empty name', { name: '' }, NAME_ERROR],
  ['a blank name', { name: '   ' }, NAME_ERROR],
  ['zero power', { maxPowerWatts: 0 }, POWER_ERROR],
  ['NaN power', { maxPowerWatts: NaN }, POWER_ERROR],
  ['a zero work width', { workAreaXMm: 0 }, WORK_X_ERROR],
  ['a work width over the cap', { workAreaXMm: OVER_LIMIT_WORK_AREA_MM }, WORK_X_ERROR],
  ['a negative work height', { workAreaYMm: -1 }, WORK_Y_ERROR],
  ['a work height over the cap', { workAreaYMm: OVER_LIMIT_WORK_AREA_MM }, WORK_Y_ERROR],
  ['a negative S value', { sValueMax: -5 }, S_VALUE_ERROR],
  ['a fractional S value below 1', { sValueMax: 0.5 }, S_VALUE_ERROR],
  ['a fractional S value', { sValueMax: 1.5 }, S_VALUE_ERROR],
  ['an S value over the limit', { sValueMax: 100001 }, S_VALUE_ERROR],
  ['a huge S value', { sValueMax: 1e308 }, S_VALUE_ERROR],
  ['power over the limit', { maxPowerWatts: 501 }, POWER_ERROR],
  ['infinite power', { maxPowerWatts: Infinity }, POWER_ERROR],
  ['a jog feed below the range', { jogFeedRate: JOG_FEED_BELOW_RANGE }, JOG_FEED_ERROR],
  ['a jog feed above the range', { jogFeedRate: JOG_FEED_ABOVE_RANGE }, JOG_FEED_ERROR],
  ['a NaN jog feed', { jogFeedRate: NaN }, JOG_FEED_ERROR],
  ['a negative frame margin', { frameMarginMm: -1 }, FRAME_MARGIN_ERROR],
  ['a NaN frame margin', { frameMarginMm: NaN }, FRAME_MARGIN_ERROR],
  ['a frame speed below the range', { frameFeedMmPerMin: FRAME_FEED_BELOW_RANGE }, FRAME_FEED_ERROR],
  ['a frame speed above the range', { frameFeedMmPerMin: FRAME_FEED_ABOVE_RANGE }, FRAME_FEED_ERROR],
  ['a NaN frame speed', { frameFeedMmPerMin: NaN }, FRAME_FEED_ERROR],
];

describe(getMachineProfileErrors.name, () => {
  it('finds no errors in the defaults', () => {
    expect(getMachineProfileErrors(newMachineProfile())).toEqual([]);
  });

  it.each(INVALID_CASES)(
    'reports %s',
    (_label: string, overrides: Partial<MachineProfile>, error: MachineProfileFieldError) => {
      expect(getMachineProfileErrors(newMachineProfile(overrides))).toEqual([error]);
    },
  );

  it('accepts the range limits', () => {
    const profile: MachineProfile = newMachineProfile({
      workAreaXMm: LIMIT_WORK_AREA_MM,
      workAreaYMm: LIMIT_WORK_AREA_MM,
      jogFeedRate: JOG_FEED_RANGE_MIN,
    });

    expect(getMachineProfileErrors(profile)).toEqual([]);
    expect(getMachineProfileErrors(newMachineProfile({ jogFeedRate: JOG_FEED_RANGE_MAX }))).toEqual([]);
  });

  it.each([[255], [1000], [10000]])('accepts S value %d', (sValueMax: number) => {
    expect(getMachineProfileErrors(newMachineProfile({ sValueMax }))).toEqual([]);
  });

  it.each([[undefined], [0], [5]])('accepts frame margin %s', (frameMarginMm: number | undefined) => {
    expect(getMachineProfileErrors(newMachineProfile({ frameMarginMm }))).toEqual([]);
  });

  it.each([[undefined], [FRAME_FEED_RANGE_MIN], [6000], [FRAME_FEED_RANGE_MAX]])(
    'accepts frame speed %s',
    (frameFeedMmPerMin: number | undefined) => {
      expect(getMachineProfileErrors(newMachineProfile({ frameFeedMmPerMin }))).toEqual([]);
    },
  );

  it('accepts 12 W power', () => {
    expect(getMachineProfileErrors(newMachineProfile({ maxPowerWatts: 12 }))).toEqual([]);
  });

  it('reports every invalid field', () => {
    expect(getMachineProfileErrors(newMachineProfile({ name: '', sValueMax: 0 }))).toEqual([NAME_ERROR, S_VALUE_ERROR]);
  });
});
