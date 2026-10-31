/**
 * Registers an overlay in the overlay registry while it is open, so the Escape-to-STOP hotkey knows the user is
 * not in the main view.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../states/new.store';
import { OverlayClosed, OverlayOpened } from '../states/ui.overlay.state';

export const useOverlayRegistration = (overlayId: string, isOpen: boolean): void => {
  const dispatch: AppDispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    dispatch(new OverlayOpened({ overlayId }));

    return () => {
      dispatch(new OverlayClosed({ overlayId }));
    };
  }, [dispatch, overlayId, isOpen]);
};
