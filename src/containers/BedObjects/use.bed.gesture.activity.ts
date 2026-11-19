/**
 * Reports to the store whether a drag or handle gesture runs on the bed, from its start until it ends, is cancelled
 * or the bed goes away, so the undo and redo hotkeys can wait for it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BedGestureActivityChanged } from '../../utils/states/bed.gesture.state';
import type { AppDispatch } from '../../utils/states/new.store';

export const useBedGestureActivity = (isBedGestureActive: boolean): void => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!isBedGestureActive) {
      return undefined;
    }

    dispatch(new BedGestureActivityChanged({ isBedGestureActive: true }));

    return () => {
      dispatch(new BedGestureActivityChanged({ isBedGestureActive: false }));
    };
  }, [dispatch, isBedGestureActive]);
};
