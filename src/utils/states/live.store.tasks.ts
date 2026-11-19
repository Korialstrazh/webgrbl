/**
 * Keeps the root saga task of every store that is still running, so tests can stop all of them between tests. A
 * store's sagas listen on window and document and keep timers, so a store left running would otherwise go on
 * reacting, and writing to storage, during the next test.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Task } from 'redux-saga';

const LIVE_STORE_TASKS: Set<Task> = new Set<Task>();

export const LIVE_STORE_TASK_REGISTRY = {
  registerStoreTask(storeTask: Task): void {
    LIVE_STORE_TASKS.add(storeTask);
  },

  /** Cancelling runs every saga's finally block, which closes its event channels and removes its listeners. */
  cancelLiveStoreTasks(): void {
    for (const storeTask of LIVE_STORE_TASKS) {
      storeTask.cancel();
    }

    LIVE_STORE_TASKS.clear();
  },
};
