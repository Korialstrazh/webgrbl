/**
 * The move card. While a laser is connected it shows the move controls. While none is connected none of them can act,
 * so the card is one line, "Connect to move", with a Show button that opens the controls anyway, disabled, for a user
 * who wants to see them first.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { Panel } from '../../../views/Panel';
import { MoveControls } from './MoveControls';
import styles from './styles.module.scss';

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
    <span className={styles.collapsedSummary}>
      {isCollapsed && <span className={styles.collapsedHint}>{t(DEFAULT.MACHINE_MOVE_COLLAPSED_HINT)}</span>}
      <Button
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        aria-expanded={!isCollapsed}
        aria-controls={controlsId}
        aria-label={t(toggleLabelKey)}
        onClick={() => setIsShownWhileDisconnected(isCollapsed)}
      >
        {t(isCollapsed ? DEFAULT.MACHINE_MOVE_SHOW_CONTROLS : DEFAULT.MACHINE_MOVE_HIDE_CONTROLS)}
      </Button>
    </span>
  );

  return (
    <Panel title={t(DEFAULT.MACHINE_MOVE_TITLE)} headerActionComponent={collapseToggleComponent}>
      {isCollapsed ? undefined : <MoveControls id={controlsId} />}
    </Panel>
  );
};
