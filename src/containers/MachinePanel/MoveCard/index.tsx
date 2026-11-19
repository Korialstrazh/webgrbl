/**
 * The move card. While a laser is connected it shows the move controls. While none is connected none of them can act,
 * so the card is one line, a plug badge with the reason in its tooltip, with a chevron that opens the controls anyway,
 * disabled, for a user
 * who wants to see them first.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DragOutlined } from '@ant-design/icons';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ConnectionPopoverOpenChanged } from '../../../utils/states/ui.overlay.state';
import { CollapsedCardToggle } from '../../../views/CollapsedCardToggle';
import { Panel } from '../../../views/Panel';
import { MoveControls } from './MoveControls';

export const MoveCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const [isShownWhileDisconnected, setIsShownWhileDisconnected] = useState<boolean>(false);
  const controlsId: string = useId();
  const isCollapsed: boolean = !isConnected && !isShownWhileDisconnected;
  const toggleLabelKey: string = isCollapsed
    ? DEFAULT.MACHINE_MOVE_SHOW_CONTROLS_LABEL
    : DEFAULT.MACHINE_MOVE_HIDE_CONTROLS_LABEL;
  const collapseToggleComponent: ReactNode = isConnected ? undefined : (
    <CollapsedCardToggle
      isCollapsed={isCollapsed}
      hintText={t(DEFAULT.MACHINE_MOVE_COLLAPSED_HINT)}
      controlsId={controlsId}
      toggleLabel={t(toggleLabelKey)}
      onToggle={() => setIsShownWhileDisconnected(isCollapsed)}
      onPlugClick={() => dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }))}
    />
  );

  return (
    <Panel
      iconComponent={<DragOutlined />}
      title={t(DEFAULT.MACHINE_MOVE_TITLE)}
      headerActionComponent={collapseToggleComponent}
      isCompact
    >
      {isCollapsed ? undefined : <MoveControls id={controlsId} />}
    </Panel>
  );
};
