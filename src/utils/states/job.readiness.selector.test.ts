import { GRBL_CONNECTION_STATUS } from '../grbl/grbl.constants';
import { ConnectionStatusChanged } from './grbl.connection.state';
import {
  JOB_READINESS_STEP,
  selectFirstUnmetJobReadinessStep,
  selectIsJobReadinessStepMet,
} from './job.readiness.selector';
import { newStore } from './new.store';
import type { AppStore } from './new.store';

describe(selectFirstUnmetJobReadinessStep.name, () => {
  it('starts at the profile in a fresh app', () => {
    expect(selectFirstUnmetJobReadinessStep(newStore().getState())).toBe(JOB_READINESS_STEP.PROFILE);
  });

  it('ticks Connect from the live connection state, without moving the first open step', () => {
    const store: AppStore = newStore();

    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));

    expect(selectIsJobReadinessStepMet(JOB_READINESS_STEP.CONNECT)(store.getState())).toBe(true);
    expect(selectFirstUnmetJobReadinessStep(store.getState())).toBe(JOB_READINESS_STEP.PROFILE);
  });
});
