/**
 * After a job finished normally, the laser goes back to where it was when the job started: the beam is switched off,
 * then one absolute jog in work coordinates takes the head there. A stopped, reset or alarmed job never moves, as the
 * user (or the machine) wanted the motion to end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select } from 'redux-saga/effects';
import type { GrblController } from '../grbl/grbl.controller';
import type { GrblStatusReport } from '../grbl/interfaces/GrblStatusReport';
import { getAbsoluteJogCommand } from '../machine/get.absolute.jog.command';
import { MACHINE_COMMAND } from '../machine/machine.commands';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { DEFAULT_MACHINE_JOG_FEED_RATE } from '../profiles/machine.profile.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';
import { selectActiveMachineProfile } from './machine.profile.state';
import { selectMachineStatus } from './machine.status.state';

/** The work position of the head right now, or undefined while no report has given one. */
export function* getJobStartWorkPosition(): Generator {
  const status: GrblStatusReport | undefined = (yield select(selectMachineStatus)) as GrblStatusReport | undefined;

  return status?.workPosition && { x: status.workPosition.x, y: status.workPosition.y };
}

/** Sends the laser back to the start position, only after a job that ended as finished. */
export function* returnToJobStartPosition(
  controller: GrblController,
  endStatus: JobRunStatus,
  startPosition: GeometryPoint | undefined,
): Generator {
  if (endStatus !== JOB_RUN_STATUS.COMPLETED || !startPosition) {
    return;
  }

  const profile: MachineProfile | undefined = (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;
  const feedRate: number = profile?.jogFeedRate ?? DEFAULT_MACHINE_JOG_FEED_RATE;

  try {
    yield call([controller, controller.sendConsoleCommand], MACHINE_COMMAND.LASER_OFF);
    yield call([controller, controller.sendConsoleCommand], getAbsoluteJogCommand(startPosition, feedRate));
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  }
}
