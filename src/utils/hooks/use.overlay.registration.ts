/**
 * Registers an overlay in the overlay registry while it is open, so the Escape-to-STOP hotkey knows the user is
 * not in the main view. Every registration gets its own id, so two overlays sharing a prefix never close each other;
 * the id is returned, so a surface can tell whether it is the top overlay.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useId } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../states/new.store';
import { OVERLAY_KIND } from '../states/overlay.kind.constants';
import type { OverlayKind } from '../states/overlay.kind.constants';
import { OverlayClosed, OverlayOpened } from '../states/ui.overlay.state';

const OVERLAY_ID_SEPARATOR = ':';

export const useOverlayRegistration = (
  overlayIdPrefix: string,
  isOpen: boolean,
  overlayKind: OverlayKind = OVERLAY_KIND.POPOVER,
): string => {
  const dispatch: AppDispatch = useDispatch<AppDispatch>();
  const uniqueSuffix: string = useId();
  const overlayId: string = [overlayIdPrefix, uniqueSuffix].join(OVERLAY_ID_SEPARATOR);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    dispatch(new OverlayOpened({ overlayId, overlayKind }));

    return () => {
      dispatch(new OverlayClosed({ overlayId }));
    };
  }, [dispatch, overlayId, isOpen, overlayKind]);

  return overlayId;
};
