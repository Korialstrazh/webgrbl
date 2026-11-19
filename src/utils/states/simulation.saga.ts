/**
 * Keeps the simulation from playing a toolpath that may not play: after every action, a running playback is paused
 * when the toolpath is no longer ready (out of date, generating, failed or gone) or takes no time. This covers a play
 * toggled on while the toolpath could not play, too, so a stale toolpath never plays as the current job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { put, select, takeEvery } from 'redux-saga/effects';
import { EVERY_ACTION_PATTERN } from '../redux.saga.constants';
import { SimulationPaused, selectIsSimulationPlaying } from './simulation.state';
import { selectIsSimulationPlayable } from './toolpath.timeline.selectors';

function* pauseUnplayableSimulation(): Generator {
  const isPlaying: boolean = (yield select(selectIsSimulationPlaying)) as boolean;

  if (!isPlaying) {
    return;
  }

  const isPlayable: boolean = (yield select(selectIsSimulationPlayable)) as boolean;

  if (!isPlayable) {
    yield put(new SimulationPaused());
  }
}

// Every action, not a list: playability can change after any reducer pass, so it is checked after each one.
export function* watchSimulation(): Generator {
  yield takeEvery(EVERY_ACTION_PATTERN, pauseUnplayableSimulation);
}
