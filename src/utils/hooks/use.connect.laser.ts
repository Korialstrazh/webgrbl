/**
 * The one-click Connect of the Job card and the connection pill: with a port already chosen it sends the same connect
 * request as the popover's Connect button; with none it opens the connection popover to choose one. It never picks a
 * port by itself.
 *
 * @author michael.morosov
 *
 * @since 2026-11-08
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useDispatch, useSelector } from 'react-redux';
import { ConnectRequested, selectSelectedPortId } from '../states/grbl.connection.state';
import type { AppDispatch } from '../states/new.store';
import { ConnectionPopoverOpenChanged } from '../states/ui.overlay.state';

export const useConnectLaser = (): () => void => {
  const dispatch: AppDispatch = useDispatch();
  const selectedPortId: string = useSelector(selectSelectedPortId);

  return (): void => {
    if (selectedPortId) {
      dispatch(new ConnectRequested());

      return;
    }

    dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }));
  };
};
