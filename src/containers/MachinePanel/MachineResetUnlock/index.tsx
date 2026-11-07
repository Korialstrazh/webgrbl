/**
 * Reset and unlock buttons for the connected laser; unlock is only available during an alarm.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ReloadOutlined, UnlockOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_DEFAULT, ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import {
  MachineResetRequested,
  MachineUnlockRequested,
  selectIsMachineInAlarm,
} from '../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import styles from './styles.module.scss';

export const MachineResetUnlock = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const isInAlarm: boolean = useSelector(selectIsMachineInAlarm);
  const canUnlock: boolean = isConnected && isInAlarm;

  return (
    <div className={styles.machineResetUnlock}>
      <Button
        size={ANTD_BUTTON_SIZE_SMALL}
        icon={<ReloadOutlined />}
        aria-label={t(DEFAULT.MACHINE_CONTROL_RESET)}
        disabled={!isConnected}
        onClick={() => dispatch(new MachineResetRequested())}
      >
        {t(DEFAULT.MACHINE_CONTROL_RESET)}
      </Button>
      <Button
        size={ANTD_BUTTON_SIZE_SMALL}
        // Only in alarm can Unlock be pressed, and then it is the way out, so it stands out as the primary action.
        type={canUnlock ? ANTD_BUTTON_TYPE_PRIMARY : ANTD_BUTTON_TYPE_DEFAULT}
        icon={<UnlockOutlined />}
        aria-label={t(DEFAULT.MACHINE_CONTROL_UNLOCK)}
        disabled={!canUnlock}
        onClick={() => dispatch(new MachineUnlockRequested())}
      >
        {t(DEFAULT.MACHINE_CONTROL_UNLOCK)}
      </Button>
    </div>
  );
};
