/**
 * Closes a popover when a dialog or drawer opens, or when the narrow layout switches region, so no popover is left
 * floating over a dialog or over another region's content.
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
import type { WorkbenchRegion } from '../states/workbench.region.constants';
import { selectDialogOpenCount } from '../states/ui.overlay.state';
import { selectNarrowRegion } from '../states/ui.workbench.state';

export const usePopoverAutoClose = (isPopoverOpen: boolean, closePopover: () => void): void => {
  const dialogOpenCount: number = useSelector(selectDialogOpenCount);
  const narrowRegion: WorkbenchRegion = useSelector(selectNarrowRegion);
  const seenDialogOpenCountRef: RefObject<number> = useRef<number>(dialogOpenCount);
  const seenNarrowRegionRef: RefObject<WorkbenchRegion> = useRef<WorkbenchRegion>(narrowRegion);
  const closePopoverRef: RefObject<() => void> = useRef<() => void>(closePopover);

  closePopoverRef.current = closePopover;

  useEffect(() => {
    const isNewDialogOpen: boolean = dialogOpenCount !== seenDialogOpenCountRef.current;
    const isRegionSwitched: boolean = narrowRegion !== seenNarrowRegionRef.current;

    seenDialogOpenCountRef.current = dialogOpenCount;
    seenNarrowRegionRef.current = narrowRegion;

    if ((isNewDialogOpen || isRegionSwitched) && isPopoverOpen) {
      closePopoverRef.current();
    }
  }, [dialogOpenCount, narrowRegion, isPopoverOpen]);
};
