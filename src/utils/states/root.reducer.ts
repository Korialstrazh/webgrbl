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

export const rootReducer = combineReducers({
  [BROWSER_ENVIRONMENT_STATE_NAME]: browserEnvironmentReducer,
});
