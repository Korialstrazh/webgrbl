/**
 * The Status card of the machine panel. While no laser is connected it is its heading line only, with
 * "Not connected"; the top-bar pill is the one place to connect. Once connected it shows the state, positions, feed
 * and power with Reset and Unlock.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DashboardOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { Panel } from '../../../views/Panel';
import { MachineResetUnlock } from '../MachineResetUnlock';
import { MachineStateReadout } from '../MachineStateReadout';
import styles from './styles.module.scss';

export const MachineStatusCard = (): ReactNode => {
  const { t } = useTranslation();
  const isConnected: boolean = useSelector(selectIsConnected);

  const notConnectedComponent: ReactNode = isConnected ? undefined : (
    <span className={styles.notConnected}>
      <span className={styles.notConnectedLabel}>{t(DEFAULT.MACHINE_STATUS_NOT_CONNECTED)}</span>
    </span>
  );

  return (
    <Panel
      iconComponent={<DashboardOutlined />}
      title={t(DEFAULT.MACHINE_STATUS_TITLE)}
      headerActionComponent={notConnectedComponent}
    >
      {isConnected ? (
        <>
          <MachineStateReadout />
          <MachineResetUnlock />
        </>
      ) : undefined}
    </Panel>
  );
};
