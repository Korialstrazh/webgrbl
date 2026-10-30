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
import { watchOnlineStatus } from './browser.environment.state';

export function* rootSaga(): Generator {
  yield all([fork(watchOnlineStatus)]);
}
