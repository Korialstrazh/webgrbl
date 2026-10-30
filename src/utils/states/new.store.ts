/**
 * Builds the Redux store: the root reducer of all states and the saga middleware running the root saga.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import type { SagaMiddleware } from 'redux-saga';
import { classActionToPlainObjectMiddleware } from './class.action.to.plain.object.middleware';
import { rootReducer } from './root.reducer';
import { rootSaga } from './root.saga';

const SAGA_CRASHED_LOG_MESSAGE = 'A saga crashed and every saga has stopped';

// An error that escapes a saga ends the root saga and with it every other saga, so the app stays on screen but
// stops reacting. This log says what the crash means instead of only printing the stack.
const logSagaCrash = (error: Error): void => {
  // eslint-disable-next-line no-console -- a crash that stopped every saga must show up in the log
  console.error(SAGA_CRASHED_LOG_MESSAGE, error);
};

// The return type is left to inference on purpose: AppStore is derived from it.
const configureAppStore = (sagaMiddleware: SagaMiddleware) => configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .prepend(classActionToPlainObjectMiddleware)
    .concat(sagaMiddleware),
});

export type AppStore = ReturnType<typeof configureAppStore>;

export type AppDispatch = AppStore['dispatch'];

export type AppRootState = ReturnType<AppStore['getState']>;

export const newStore = (): AppStore => {
  const sagaMiddleware: SagaMiddleware = createSagaMiddleware({ onError: logSagaCrash });
  const store: AppStore = configureAppStore(sagaMiddleware);

  sagaMiddleware.run(rootSaga);

  return store;
};
