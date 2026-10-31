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
import { BROWSER_ENVIRONMENT_STATE_NAME, browserEnvironmentReducer } from './browser.environment.state';
import { GRBL_CONNECTION_STATE_NAME, grblConnectionReducer } from './grbl.connection.state';
import { GRBL_CONSOLE_STATE_NAME, grblConsoleReducer } from './grbl.console.state';
import { MACHINE_STATUS_STATE_NAME, machineStatusReducer } from './machine.status.state';
import { TOAST_STATE_NAME, toastReducer } from './toast.state';
import { UI_OVERLAY_STATE_NAME, uiOverlayReducer } from './ui.overlay.state';

export const rootReducer = combineReducers({
  [BROWSER_ENVIRONMENT_STATE_NAME]: browserEnvironmentReducer,
  [GRBL_CONNECTION_STATE_NAME]: grblConnectionReducer,
  [MACHINE_STATUS_STATE_NAME]: machineStatusReducer,
  [GRBL_CONSOLE_STATE_NAME]: grblConsoleReducer,
  [TOAST_STATE_NAME]: toastReducer,
  [UI_OVERLAY_STATE_NAME]: uiOverlayReducer,
});
