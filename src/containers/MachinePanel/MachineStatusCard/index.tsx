/**
 * The Status card of the machine panel. While no laser is connected it is one line, "Not connected" with a Connect
 * button that opens the same connection popover as the top-bar pill, instead of empty readouts and buttons that cannot
 * act; once connected it shows the state, positions, feed and power with Reset and Unlock.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ConnectionPopoverOpenChanged } from '../../../utils/states/ui.overlay.state';
import { Panel } from '../../../views/Panel';
import { MachineResetUnlock } from '../MachineResetUnlock';
import { MachineStateReadout } from '../MachineStateReadout';
import styles from './styles.module.scss';

export const MachineStatusCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);

  return (
    <Panel title={t(DEFAULT.MACHINE_STATUS_TITLE)}>
      {isConnected ? (
        <>
          <MachineStateReadout />
          <MachineResetUnlock />
        </>
      ) : (
        <div className={styles.notConnected}>
          <span className={styles.notConnectedLabel}>{t(DEFAULT.MACHINE_STATUS_NOT_CONNECTED)}</span>
          <Button
            type={ANTD_BUTTON_TYPE_PRIMARY}
            onClick={() => dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }))}
          >
            {t(DEFAULT.MACHINE_STATUS_CONNECT)}
          </Button>
        </div>
      )}
    </Panel>
  );
};
