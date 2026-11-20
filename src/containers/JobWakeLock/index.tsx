/**
 * Keeps the screen awake while a job runs: a sleeping display on a long job hides the laser's progress, and some
 * systems suspend the tab with it. The lock is asked for again when the tab turns visible, as the browser drops it
 * while the tab is hidden. Renders nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VISIBILITY_CHANGE_EVENT_NAME, HIDDEN_VISIBILITY_STATE } from '../../utils/browser/browser.events.constants';
import { screenWakeLock } from '../../utils/browser/screen.wake.lock';
import { selectIsJobRunActive } from '../../utils/states/job.run.state';

const reacquireScreenWakeLockWhenVisible = (): void => {
  if (document.visibilityState !== HIDDEN_VISIBILITY_STATE) {
    void screenWakeLock.acquire();
  }
};

export const JobWakeLock = (): ReactNode => {
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);

  useEffect(() => {
    if (!isJobRunActive) {
      return undefined;
    }

    void screenWakeLock.acquire();
    document.addEventListener(VISIBILITY_CHANGE_EVENT_NAME, reacquireScreenWakeLockWhenVisible);

    return () => {
      document.removeEventListener(VISIBILITY_CHANGE_EVENT_NAME, reacquireScreenWakeLockWhenVisible);
      void screenWakeLock.release();
    };
  }, [isJobRunActive]);

  return null;
};
