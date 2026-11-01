/**
 * Reports to the store whether a drag or handle gesture runs on the bed, from its start until it ends, is cancelled
 * or the bed goes away, so the undo and redo hotkeys can wait for it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
