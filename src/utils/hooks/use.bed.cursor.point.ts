/**
 * Reads the bed point under the pointer, in machine millimetres, for a readout. It changes at most once per animation
 * frame; undefined while the pointer is not over the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useSyncExternalStore } from 'react';
import { BED_CURSOR_STORE } from '../bed/bed.cursor.store';
import type { BedCursorPoint } from '../bed/interfaces/BedCursorPoint';

export const useBedCursorPoint = (): BedCursorPoint | undefined =>
  useSyncExternalStore(BED_CURSOR_STORE.subscribeToBedCursor, BED_CURSOR_STORE.getBedCursorPoint);
