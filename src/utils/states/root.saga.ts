/**
 * Starts every long-running saga of the app.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { all, fork } from 'redux-saga/effects';
import type { ToolpathWorkerClient } from '../toolpath/interfaces/ToolpathWorkerClient';
import { watchOnlineStatus } from './browser.environment.state';
import { watchGrblController } from './grbl.controller.saga';
import type { GrblControllerSagaDependencies } from './interfaces/GrblControllerSagaDependencies';
import { watchLaserPointer } from './laser.pointer.saga';
import { watchMachineProfiles } from './machine.profile.saga';
import { watchPalette } from './palette.saga';
import { watchPanelLayout } from './panel.layout.saga';
import { watchProjects } from './project.saga';
import { watchSimulation } from './simulation.saga';
import { watchInfoToastExpiry } from './toast.state';
import { watchToolpath } from './toolpath.saga';

export function* rootSaga(
  grblControllerSagaDependencies: GrblControllerSagaDependencies,
  toolpathWorkerClient: ToolpathWorkerClient,
): Generator {
  yield all([
    fork(watchOnlineStatus),
    fork(watchInfoToastExpiry),
    fork(watchMachineProfiles),
    fork(watchPalette),
    fork(watchPanelLayout),
    fork(watchLaserPointer),
    fork(watchProjects),
    fork(watchGrblController, grblControllerSagaDependencies),
    fork(watchToolpath, toolpathWorkerClient),
    fork(watchSimulation),
  ]);
}
