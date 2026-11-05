import { describe, expect, it } from 'vitest';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getJobActionBlockedReasonKeys } from './get.job.action.blocked.reason.keys';

describe(getJobActionBlockedReasonKeys.name, () => {
  it('gives one shared line while both buttons wait for a connection', () => {
    expect(getJobActionBlockedReasonKeys(
      DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED,
      DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED,
    )).toEqual([DEFAULT.JOB_ACTIONS_BLOCKED_NOT_CONNECTED]);
  });

  it('gives the reason of each button, naming the frame for its missing connection', () => {
    expect(getJobActionBlockedReasonKeys(
      DEFAULT.JOB_START_BLOCKED_NO_PROFILE,
      DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED,
    )).toEqual([DEFAULT.JOB_START_BLOCKED_NO_PROFILE, DEFAULT.FRAME_START_BLOCKED_NOT_CONNECTED]);
  });

  it('leaves out a repeated reason and an unblocked button', () => {
    expect(getJobActionBlockedReasonKeys(DEFAULT.JOB_START_BLOCKED_RUNNING, DEFAULT.JOB_START_BLOCKED_RUNNING))
      .toEqual([DEFAULT.JOB_START_BLOCKED_RUNNING]);
    expect(getJobActionBlockedReasonKeys(undefined, undefined)).toEqual([]);
  });
});
