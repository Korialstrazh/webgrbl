import { describe, expect, it } from 'vitest';
import { GRBL_DOOR_SUBSTATE, GRBL_HOLD_SUBSTATE, GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblMachineState } from '../grbl/grbl.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import type { JobPauseControl } from './job.pause.control.constants';
import { selectJobPauseControl } from './job.pause.control.selector';
import { JOB_RUN_KIND } from './job.run.kind.constants';
import { JobRunStarted } from './job.run.state';
import { MachineStatusReceived } from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';

const DOOR_AJAR_SUBSTATE = 1;
const DOOR_OPENING_SUBSTATE = 2;
const DOOR_RESUMING_SUBSTATE = 3;

const newStatus = (machineState: GrblMachineState, machineSubstate?: number): GrblResolvedStatus => ({
  machineState,
  machineSubstate,
  machinePosition: undefined,
  workPosition: undefined,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
});

const getControlDuringRun = (status: GrblResolvedStatus): JobPauseControl => {
  const store: AppStore = newStore();

  store.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.JOB }));
  store.dispatch(new MachineStatusReceived({ status }));

  return selectJobPauseControl(store.getState());
};

describe(selectJobPauseControl.name, () => {
  it('offers nothing without a running job, even in a hold', () => {
    const store: AppStore = newStore();

    store.dispatch(new MachineStatusReceived({
      status: newStatus(GRBL_MACHINE_STATE.HOLD, GRBL_HOLD_SUBSTATE.COMPLETE),
    }));

    expect(selectJobPauseControl(store.getState())).toBe(JOB_PAUSE_CONTROL.HIDDEN);
  });

  it('offers Resume once a hold is complete, also when the firmware prints no substate', () => {
    expect(getControlDuringRun(newStatus(GRBL_MACHINE_STATE.HOLD, GRBL_HOLD_SUBSTATE.COMPLETE)))
      .toBe(JOB_PAUSE_CONTROL.RESUME);
    expect(getControlDuringRun(newStatus(GRBL_MACHINE_STATE.HOLD))).toBe(JOB_PAUSE_CONTROL.RESUME);
  });

  it('makes Resume wait while the hold is still slowing down', () => {
    expect(getControlDuringRun(newStatus(GRBL_MACHINE_STATE.HOLD, GRBL_HOLD_SUBSTATE.DECELERATING)))
      .toBe(JOB_PAUSE_CONTROL.RESUME_WAITING);
  });

  it('offers Resume once the door is closed, as the job could only be stopped otherwise', () => {
    expect(getControlDuringRun(newStatus(GRBL_MACHINE_STATE.DOOR, GRBL_DOOR_SUBSTATE.READY_TO_RESUME)))
      .toBe(JOB_PAUSE_CONTROL.RESUME);
  });

  it.each([DOOR_AJAR_SUBSTATE, DOOR_OPENING_SUBSTATE, DOOR_RESUMING_SUBSTATE])(
    'makes Resume wait in door substate %i',
    (doorSubstate: number) => {
      expect(getControlDuringRun(newStatus(GRBL_MACHINE_STATE.DOOR, doorSubstate)))
        .toBe(JOB_PAUSE_CONTROL.RESUME_WAITING);
    },
  );
});
