/**
 * Combines the reducers of every state into the store's root reducer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { combineReducers } from '@reduxjs/toolkit';
import { BED_GESTURE_STATE_NAME, bedGestureReducer } from './bed.gesture.state';
import { BROWSER_ENVIRONMENT_STATE_NAME, browserEnvironmentReducer } from './browser.environment.state';
import { GRBL_CONNECTION_STATE_NAME, grblConnectionReducer } from './grbl.connection.state';
import { GRBL_CONSOLE_STATE_NAME, grblConsoleReducer } from './grbl.console.state';
import { LASER_POINTER_STATE_NAME, laserPointerReducer } from './laser.pointer.state';
import { MACHINE_PROFILE_STATE_NAME, machineProfileReducer } from './machine.profile.state';
import { MACHINE_STATUS_STATE_NAME, machineStatusReducer } from './machine.status.state';
import { PROJECT_DOCUMENT_STATE_NAME, projectDocumentReducer } from './project.document.state';
import { PROJECT_SELECTION_STATE_NAME, projectSelectionReducer } from './project.selection.state';
import { PROJECT_STATE_NAME, projectReducer } from './project.state';
import { TOAST_STATE_NAME, toastReducer } from './toast.state';
import { UI_OVERLAY_STATE_NAME, uiOverlayReducer } from './ui.overlay.state';

export const rootReducer = combineReducers({
  [BROWSER_ENVIRONMENT_STATE_NAME]: browserEnvironmentReducer,
  [GRBL_CONNECTION_STATE_NAME]: grblConnectionReducer,
  [MACHINE_STATUS_STATE_NAME]: machineStatusReducer,
  [MACHINE_PROFILE_STATE_NAME]: machineProfileReducer,
  [LASER_POINTER_STATE_NAME]: laserPointerReducer,
  [PROJECT_DOCUMENT_STATE_NAME]: projectDocumentReducer,
  [PROJECT_SELECTION_STATE_NAME]: projectSelectionReducer,
  [PROJECT_STATE_NAME]: projectReducer,
  [GRBL_CONSOLE_STATE_NAME]: grblConsoleReducer,
  [TOAST_STATE_NAME]: toastReducer,
  [UI_OVERLAY_STATE_NAME]: uiOverlayReducer,
  [BED_GESTURE_STATE_NAME]: bedGestureReducer,
});
