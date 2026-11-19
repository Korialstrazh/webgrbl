/**
 * Tells whether the screen is being kept awake right now, so the Job card can say so.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useSyncExternalStore } from 'react';
import { screenWakeLock } from '../browser/screen.wake.lock';

export const useIsScreenKeptAwake = (): boolean =>
  useSyncExternalStore(screenWakeLock.subscribe, screenWakeLock.isHeld);
