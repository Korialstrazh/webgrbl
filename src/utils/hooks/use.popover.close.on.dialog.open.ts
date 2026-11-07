/**
 * Closes a popover when a dialog or drawer opens, so no popover is left floating over or under the dialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useSelector } from 'react-redux';
import { selectDialogOpenCount } from '../states/ui.overlay.state';

export const usePopoverCloseOnDialogOpen = (isPopoverOpen: boolean, closePopover: () => void): void => {
  const dialogOpenCount: number = useSelector(selectDialogOpenCount);
  const seenDialogOpenCountRef: RefObject<number> = useRef<number>(dialogOpenCount);
  const closePopoverRef: RefObject<() => void> = useRef<() => void>(closePopover);

  closePopoverRef.current = closePopover;

  useEffect(() => {
    const isNewDialogOpen: boolean = dialogOpenCount !== seenDialogOpenCountRef.current;

    seenDialogOpenCountRef.current = dialogOpenCount;

    if (isNewDialogOpen && isPopoverOpen) {
      closePopoverRef.current();
    }
  }, [dialogOpenCount, isPopoverOpen]);
};
