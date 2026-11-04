/**
 * Asks the browser to confirm leaving the page while the laser is moving. Renders nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BEFORE_UNLOAD_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { selectIsJobRunActive } from '../../utils/states/job.run.state';
import { selectIsMachineMoving } from '../../utils/states/machine.status.state';

const EMPTY_RETURN_VALUE = '';

// Browsers only show the leave-page prompt when the event is cancelled and, in older ones, returnValue is set.
const preventPageUnload = (event: BeforeUnloadEvent): void => {
  event.preventDefault();
  event.returnValue = EMPTY_RETURN_VALUE;
};

export const LeavePageGuard = (): ReactNode => {
  const isMachineMoving: boolean = useSelector(selectIsMachineMoving);
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const isLeavingUnsafe: boolean = isMachineMoving || isJobRunActive;

  useEffect(() => {
    if (!isLeavingUnsafe) {
      return undefined;
    }

    window.addEventListener(BEFORE_UNLOAD_EVENT_NAME, preventPageUnload);

    return () => window.removeEventListener(BEFORE_UNLOAD_EVENT_NAME, preventPageUnload);
  }, [isLeavingUnsafe]);

  return null;
};
