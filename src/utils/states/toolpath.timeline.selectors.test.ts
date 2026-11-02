import { afterEach, describe, expect, it, vi } from 'vitest';
import { GRBL_SETTING_X_ACCELERATION } from '../grbl/grbl.constants';
import * as motionTimelineModule from '../toolpath/get.motion.timeline';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { GRBL_CONNECTION_STATE_NAME } from './grbl.connection.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from './toolpath.state';
import { selectToolpathMotionTimeline } from './toolpath.timeline.selectors';

type AppState = ReturnType<AppStore['getState']>;

const STEP_IDLE_DELAY_SETTING = 1;
const CHANGED_ACCELERATION = '500';

const getStateWithSettings = (state: AppState, grblSettings: Record<number, string>): AppState => ({
  ...state,
  [GRBL_CONNECTION_STATE_NAME]: { ...state[GRBL_CONNECTION_STATE_NAME], grblSettings },
});

const getReadyState = (): AppState => {
  const store: AppStore = newStore();

  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({ moves: [newToolpathMove({ to: { x: 100, y: 0 } })] }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store.getState();
};

describe('selectToolpathMotionTimeline', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('plans the timeline once while settings change without changing a motion limit', () => {
    const readyState: AppState = getReadyState();
    const planSpy = vi.spyOn(motionTimelineModule, 'getMotionTimeline');

    selectToolpathMotionTimeline(getStateWithSettings(readyState, { [STEP_IDLE_DELAY_SETTING]: '25' }));
    selectToolpathMotionTimeline(getStateWithSettings(readyState, { [STEP_IDLE_DELAY_SETTING]: '50' }));

    expect(planSpy).toHaveBeenCalledTimes(1);
  });

  it('plans the timeline again when a motion limit changes', () => {
    const readyState: AppState = getReadyState();
    const planSpy = vi.spyOn(motionTimelineModule, 'getMotionTimeline');

    selectToolpathMotionTimeline(getStateWithSettings(readyState, {}));
    selectToolpathMotionTimeline(
      getStateWithSettings(readyState, { [GRBL_SETTING_X_ACCELERATION]: CHANGED_ACCELERATION }),
    );

    expect(planSpy).toHaveBeenCalledTimes(2);
  });
});
