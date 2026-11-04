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
import type { BurnModelWorkerClient } from '../burn.model/interfaces/BurnModelWorkerClient';
import type { ToolpathWorkerClient } from '../toolpath/interfaces/ToolpathWorkerClient';
import { watchBedAppearance } from './bed.appearance.saga';
import { watchOnlineStatus } from './browser.environment.state';
import { watchBurnModel } from './burn.model.saga';
import { watchGrblController } from './grbl.controller.saga';
import type { GrblControllerSagaDependencies } from './interfaces/GrblControllerSagaDependencies';
import { watchLaserPointer } from './laser.pointer.saga';
import { watchMachineProfiles } from './machine.profile.saga';
import { watchMaterialPresets } from './material.preset.saga';
import { watchMaterials } from './material.saga';
import { watchPalette } from './palette.saga';
import { watchPanelLayout } from './panel.layout.saga';
import { watchProjects } from './project.saga';
import { watchSimulation } from './simulation.saga';
import { watchInfoToastExpiry } from './toast.state';
import { watchToolpath } from './toolpath.saga';

export function* rootSaga(
  grblControllerSagaDependencies: GrblControllerSagaDependencies,
  toolpathWorkerClient: ToolpathWorkerClient,
  burnModelWorkerClient: BurnModelWorkerClient,
): Generator {
  yield all([
    fork(watchOnlineStatus),
    fork(watchInfoToastExpiry),
    fork(watchMachineProfiles),
    fork(watchMaterials),
    fork(watchMaterialPresets),
    fork(watchPalette),
    fork(watchPanelLayout),
    fork(watchBedAppearance),
    fork(watchLaserPointer),
    fork(watchProjects),
    fork(watchGrblController, grblControllerSagaDependencies),
    fork(watchToolpath, toolpathWorkerClient),
    fork(watchBurnModel, burnModelWorkerClient),
    fork(watchSimulation),
  ]);
}
