/**
 * The Status card of the machine panel. While no laser is connected it is one line, "Not connected", instead of empty
 * readouts and buttons that cannot act; once connected it shows the state, positions, feed and power with Reset and
 * Unlock.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
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

  return (
    <Panel title={t(DEFAULT.MACHINE_STATUS_TITLE)}>
      {isConnected ? (
        <>
          <MachineStateReadout />
          <MachineResetUnlock />
        </>
      ) : (
        <p className={styles.notConnected}>
          <span className={styles.notConnectedLabel}>{t(DEFAULT.MACHINE_STATUS_NOT_CONNECTED)}</span>
          <span className={styles.notConnectedHint}>{t(DEFAULT.MACHINE_STATUS_NOT_CONNECTED_HINT)}</span>
        </p>
      )}
    </Panel>
  );
};
