import { JOB_START_REQUEST_KIND } from './job.start.request.constants';
import {
  JOB_SAFETY_CHECKLIST_STATE_NAME,
  JobSafetyChecklistClosed,
  JobSafetyChecklistOpened,
  jobSafetyChecklistReducer,
  selectJobSafetyChecklistRequest,
} from './job.safety.checklist.state';
import type { JobStartRequest } from './interfaces/JobStartRequest';

const RECUT_REQUEST: JobStartRequest = {
  kind: JOB_START_REQUEST_KIND.RECUT,
  layerKeys: ['line:#ff0000'],
  isExtraPassAdded: true,
};

describe(jobSafetyChecklistReducer.name, () => {
  it('starts with no request', () => {
    const state = jobSafetyChecklistReducer(undefined, new JobSafetyChecklistClosed());

    expect(selectJobSafetyChecklistRequest({ [JOB_SAFETY_CHECKLIST_STATE_NAME]: state })).toBeUndefined();
  });

  it('holds the request that was opened', () => {
    const state = jobSafetyChecklistReducer(undefined, new JobSafetyChecklistOpened(RECUT_REQUEST));

    expect(selectJobSafetyChecklistRequest({ [JOB_SAFETY_CHECKLIST_STATE_NAME]: state })).toEqual(RECUT_REQUEST);
  });

  it('forgets the request once it is closed', () => {
    const openedState = jobSafetyChecklistReducer(undefined, new JobSafetyChecklistOpened(RECUT_REQUEST));
    const state = jobSafetyChecklistReducer(openedState, new JobSafetyChecklistClosed());

    expect(selectJobSafetyChecklistRequest({ [JOB_SAFETY_CHECKLIST_STATE_NAME]: state })).toBeUndefined();
  });
});
