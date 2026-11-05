/**
 * The move card. While a laser is connected it shows the move controls. While none is connected none of them can act,
 * so the card is one line, "Connect to move", with a chevron that opens the controls anyway, disabled, for a user
 * who wants to see them first.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DragOutlined } from '@ant-design/icons';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { CollapsedCardToggle } from '../../../views/CollapsedCardToggle';
import { Panel } from '../../../views/Panel';
import { MoveControls } from './MoveControls';

export const MoveCard = (): ReactNode => {
  const { t } = useTranslation();
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
    />
  );

  return (
    <Panel
      iconComponent={<DragOutlined />}
      title={t(DEFAULT.MACHINE_MOVE_TITLE)}
      headerActionComponent={collapseToggleComponent}
    >
      {isCollapsed ? undefined : <MoveControls id={controlsId} />}
    </Panel>
  );
};
