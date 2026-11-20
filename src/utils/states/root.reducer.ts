/**
 * Combines the reducers of every state into the store's root reducer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { combineReducers } from '@reduxjs/toolkit';
import { APP_PREFERENCES_STATE_NAME, appPreferencesReducer } from './app.preferences.state';
import { BED_APPEARANCE_STATE_NAME, bedAppearanceReducer } from './bed.appearance.state';
import { BED_GESTURE_STATE_NAME, bedGestureReducer } from './bed.gesture.state';
import { BED_VIEW_STATE_NAME, bedViewReducer } from './bed.view.state';
import { BROWSER_ENVIRONMENT_STATE_NAME, browserEnvironmentReducer } from './browser.environment.state';
import { BURN_MODEL_STATE_NAME, burnModelReducer } from './burn.model.state';
import { GRBL_CONNECTION_STATE_NAME, grblConnectionReducer } from './grbl.connection.state';
import { GRBL_CONSOLE_STATE_NAME, grblConsoleReducer } from './grbl.console.state';
import { JOB_RESUME_STATE_NAME, jobResumeReducer } from './job.resume.state';
import { JOB_RUN_STATE_NAME, jobRunReducer } from './job.run.state';
import { JOB_SAFETY_CHECKLIST_STATE_NAME, jobSafetyChecklistReducer } from './job.safety.checklist.state';
import { LASER_POINTER_STATE_NAME, laserPointerReducer } from './laser.pointer.state';
import { MACHINE_PROFILE_STATE_NAME, machineProfileReducer } from './machine.profile.state';
import { MACHINE_STATUS_STATE_NAME, machineStatusReducer } from './machine.status.state';
import { MATERIAL_PRESET_STATE_NAME, materialPresetReducer } from './material.preset.state';
import { MATERIAL_STATE_NAME, materialReducer } from './material.state';
import { MESSAGE_HISTORY_STATE_NAME, messageHistoryReducer } from './message.history.state';
import { PALETTE_STATE_NAME, paletteReducer } from './palette.state';
import { PANEL_LAYOUT_STATE_NAME, panelLayoutReducer } from './panel.layout.state';
import { PROJECT_DOCUMENT_STATE_NAME, projectDocumentReducer } from './project.document.state';
import { PROJECT_SELECTION_STATE_NAME, projectSelectionReducer } from './project.selection.state';
import { PROJECT_STATE_NAME, projectReducer } from './project.state';
import { SIMULATION_STATE_NAME, simulationReducer } from './simulation.state';
import { TOAST_STATE_NAME, toastReducer } from './toast.state';
import { TOOLPATH_STATE_NAME, toolpathReducer } from './toolpath.state';
import { UI_OVERLAY_STATE_NAME, uiOverlayReducer } from './ui.overlay.state';
import { UI_WORKBENCH_STATE_NAME, uiWorkbenchReducer } from './ui.workbench.state';

export const rootReducer = combineReducers({
  [BROWSER_ENVIRONMENT_STATE_NAME]: browserEnvironmentReducer,
  [GRBL_CONNECTION_STATE_NAME]: grblConnectionReducer,
  [MACHINE_STATUS_STATE_NAME]: machineStatusReducer,
  [MACHINE_PROFILE_STATE_NAME]: machineProfileReducer,
  [MATERIAL_STATE_NAME]: materialReducer,
  [MATERIAL_PRESET_STATE_NAME]: materialPresetReducer,
  [PALETTE_STATE_NAME]: paletteReducer,
  [PANEL_LAYOUT_STATE_NAME]: panelLayoutReducer,
  [LASER_POINTER_STATE_NAME]: laserPointerReducer,
  [PROJECT_DOCUMENT_STATE_NAME]: projectDocumentReducer,
  [PROJECT_SELECTION_STATE_NAME]: projectSelectionReducer,
  [PROJECT_STATE_NAME]: projectReducer,
  [GRBL_CONSOLE_STATE_NAME]: grblConsoleReducer,
  [TOAST_STATE_NAME]: toastReducer,
  [MESSAGE_HISTORY_STATE_NAME]: messageHistoryReducer,
  [UI_OVERLAY_STATE_NAME]: uiOverlayReducer,
  [UI_WORKBENCH_STATE_NAME]: uiWorkbenchReducer,
  [BED_GESTURE_STATE_NAME]: bedGestureReducer,
  [BED_APPEARANCE_STATE_NAME]: bedAppearanceReducer,
  [APP_PREFERENCES_STATE_NAME]: appPreferencesReducer,
  [TOOLPATH_STATE_NAME]: toolpathReducer,
  [BURN_MODEL_STATE_NAME]: burnModelReducer,
  [BED_VIEW_STATE_NAME]: bedViewReducer,
  [SIMULATION_STATE_NAME]: simulationReducer,
  [JOB_RUN_STATE_NAME]: jobRunReducer,
  [JOB_RESUME_STATE_NAME]: jobResumeReducer,
  [JOB_SAFETY_CHECKLIST_STATE_NAME]: jobSafetyChecklistReducer,
});
