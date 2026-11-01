/**
 * Times the autosave. Every document change marks the project unsaved; the save is due 1000 ms after the last
 * change, or at the latest 3000 ms after the first unsaved one, and at once when the tab is hidden or the page is
 * left. This saga only times: it sends ProjectAutosaveDue into the project command queue, which writes, so an
 * autosave never runs at the same time as New, Open, Delete or an import. Changes that arrive while a save is queued
 * or written start the next wait, so none is missed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { eventChannel } from 'redux-saga';
import type { EventChannel } from 'redux-saga';
import { call, delay, put, race, select, take } from 'redux-saga/effects';
import {
  HIDDEN_VISIBILITY_STATE,
  PAGE_HIDE_EVENT_NAME,
  VISIBILITY_CHANGE_EVENT_NAME,
} from '../browser/browser.events.constants';
import { AUTOSAVE_DEBOUNCE_MS, AUTOSAVE_MAX_WAIT_MS } from '../project/project.constants';
import type { ProjectAutosaveWaitResult } from './interfaces/ProjectAutosaveWaitResult';
import {
  ProjectObjectsAdded,
  ProjectObjectsDeleted,
  ProjectObjectsTransformed,
  ProjectRedoRequested,
  ProjectUndoRequested,
} from './project.document.state';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import type { ProjectSaveStatus } from './project.save.status.constants';
import { ProjectAutosaveDue, ProjectSaveStatusChanged, selectProjectSaveStatus } from './project.state';

/** Actions that can change the document. One that changes nothing, such as undo with no history, costs one save. */
const PROJECT_DOCUMENT_CHANGE_ACTION_TYPES: string[] = [
  ProjectObjectsAdded.type,
  ProjectObjectsTransformed.type,
  ProjectObjectsDeleted.type,
  ProjectUndoRequested.type,
  ProjectRedoRequested.type,
];

/** Emits the name of the browser event after which the page may be gone before the next autosave. */
const newProjectFlushChannel = (): EventChannel<string> => eventChannel((emit: (eventName: string) => void) => {
  const emitPageHide = (): void => emit(PAGE_HIDE_EVENT_NAME);
  const emitHiddenTab = (): void => {
    if (document.visibilityState === HIDDEN_VISIBILITY_STATE) {
      emit(VISIBILITY_CHANGE_EVENT_NAME);
    }
  };

  window.addEventListener(PAGE_HIDE_EVENT_NAME, emitPageHide);
  document.addEventListener(VISIBILITY_CHANGE_EVENT_NAME, emitHiddenTab);

  return (): void => {
    window.removeEventListener(PAGE_HIDE_EVENT_NAME, emitPageHide);
    document.removeEventListener(VISIBILITY_CHANGE_EVENT_NAME, emitHiddenTab);
  };
});

/** A save that is running or just finished may have reported saved, so every change checks the status again. */
function* markProjectUnsaved(): Generator {
  const saveStatus: ProjectSaveStatus = (yield select(selectProjectSaveStatus)) as ProjectSaveStatus;

  if (saveStatus !== PROJECT_SAVE_STATUS.UNSAVED) {
    yield put(new ProjectSaveStatusChanged({ saveStatus: PROJECT_SAVE_STATUS.UNSAVED }));
  }
}

/** Returns when the save is due: after the quiet time, at the maximum wait, or on a flush event. */
function* waitForAutosaveTime(flushChannel: EventChannel<string>): Generator {
  const maximumWaitEndMs: number = Date.now() + AUTOSAVE_MAX_WAIT_MS;

  while (true) {
    const remainingWaitMs: number = maximumWaitEndMs - Date.now();
    const waitResult: ProjectAutosaveWaitResult = (yield race({
      change: take(PROJECT_DOCUMENT_CHANGE_ACTION_TYPES),
      quiet: delay(Math.min(AUTOSAVE_DEBOUNCE_MS, remainingWaitMs), true),
      flush: take(flushChannel),
    })) as ProjectAutosaveWaitResult;

    if (!waitResult.change) {
      return;
    }

    yield call(markProjectUnsaved);
  }
}

/**
 * A flush with no change pending still asks for a save: the queue skips it when everything is saved, and it retries
 * a save that failed before.
 */
export function* watchProjectAutosave(): Generator {
  const flushChannel: EventChannel<string> = (yield call(newProjectFlushChannel)) as EventChannel<string>;

  try {
    while (true) {
      const waitResult: ProjectAutosaveWaitResult = (yield race({
        change: take(PROJECT_DOCUMENT_CHANGE_ACTION_TYPES),
        flush: take(flushChannel),
      })) as ProjectAutosaveWaitResult;

      if (waitResult.change) {
        yield call(markProjectUnsaved);
        yield call(waitForAutosaveTime, flushChannel);
      }

      yield put(new ProjectAutosaveDue());
    }
  } finally {
    flushChannel.close();
  }
}
