/**
 * Builds the Redux store: the root reducer of all states and the saga middleware running the root saga.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import type { SagaMiddleware } from 'redux-saga';
import { BrowserBurnModelWorkerClient } from '../burn.model/browser.burn.model.worker.client';
import type { BurnModelWorkerClient } from '../burn.model/interfaces/BurnModelWorkerClient';
import { BrowserToolpathWorkerClient } from '../toolpath/browser.toolpath.worker.client';
import type { ToolpathWorkerClient } from '../toolpath/interfaces/ToolpathWorkerClient';
import { newBrowserGrblControllerSagaDependencies } from './browser.grbl.controller.saga.dependencies';
import { BURN_MODEL_STATE_NAME } from './burn.model.state';
import { classActionToPlainObjectMiddleware } from './class.action.to.plain.object.middleware';
import type { GrblControllerSagaDependencies } from './interfaces/GrblControllerSagaDependencies';
import { LIVE_STORE_TASK_REGISTRY } from './live.store.tasks';
import { rootReducer } from './root.reducer';
import { rootSaga } from './root.saga';
import { TOOLPATH_STATE_NAME } from './toolpath.state';

const SAGA_CRASHED_LOG_MESSAGE = 'A saga crashed and every saga has stopped';
// A toolpath can hold millions of moves. The development checks walk the whole state on every action, which would
// freeze the app, so they skip it; it is plain data written only by its reducer.
const TOOLPATH_STATE_PATH = `${TOOLPATH_STATE_NAME}.toolpath`;
const TOOLPATH_ACTION_PATH = 'payload.toolpath';
// A burn model holds typed arrays of millions of values, which the checks would walk and call not serializable.
const BURN_MODEL_STATE_PATH = `${BURN_MODEL_STATE_NAME}.model`;
const BURN_MODEL_ACTION_PATH = 'payload.model';

// An error that escapes a saga ends the root saga and with it every other saga, so the app stays on screen but
// stops reacting. This log says what the crash means instead of only printing the stack.
const logSagaCrash = (error: Error): void => {
  // eslint-disable-next-line no-console -- a crash that stopped every saga must show up in the log
  console.error(SAGA_CRASHED_LOG_MESSAGE, error);
};

// The return type is left to inference on purpose: AppStore is derived from it.
const configureAppStore = (sagaMiddleware: SagaMiddleware) => configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    immutableCheck: { ignoredPaths: [TOOLPATH_STATE_PATH, BURN_MODEL_STATE_PATH] },
    serializableCheck: {
      ignoredPaths: [TOOLPATH_STATE_PATH, BURN_MODEL_STATE_PATH],
      ignoredActionPaths: [TOOLPATH_ACTION_PATH, BURN_MODEL_ACTION_PATH],
    },
  })
    .prepend(classActionToPlainObjectMiddleware)
    .concat(sagaMiddleware),
});

export type AppStore = ReturnType<typeof configureAppStore>;

export type AppDispatch = AppStore['dispatch'];

export type AppRootState = ReturnType<AppStore['getState']>;

/**
 * Tests pass their own dependencies, such as a simulated laser and in-memory storage, instead of the browser's, and a
 * toolpath and burn model worker clients that build at once instead of in a Web Worker.
 */
export const newStore = (
  grblControllerSagaDependencies: GrblControllerSagaDependencies = newBrowserGrblControllerSagaDependencies(),
  toolpathWorkerClient: ToolpathWorkerClient = new BrowserToolpathWorkerClient(),
  burnModelWorkerClient: BurnModelWorkerClient = new BrowserBurnModelWorkerClient(),
): AppStore => {
  const sagaMiddleware: SagaMiddleware = createSagaMiddleware({ onError: logSagaCrash });
  const store: AppStore = configureAppStore(sagaMiddleware);

  LIVE_STORE_TASK_REGISTRY.registerStoreTask(
    sagaMiddleware.run(rootSaga, grblControllerSagaDependencies, toolpathWorkerClient, burnModelWorkerClient),
  );

  return store;
};
