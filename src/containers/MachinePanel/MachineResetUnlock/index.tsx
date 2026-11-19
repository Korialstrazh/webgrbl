/**
 * The controller actions of the Status card. Unlock ($X, alarm unlock) shows only while GRBL is in Alarm and locked,
 * as the primary button with the word and a note that says what the alarm means. Restart controller (a GRBL soft
 * reset, Ctrl-X) is a quiet icon button whose tooltip says that it stops all motion and resets the controller, so it
 * is never mistaken for pause or resume. The line keeps its height in every state.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ReloadOutlined, UnlockOutlined, WarningOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_PRIMARY, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import {
  MachineResetRequested,
  MachineUnlockRequested,
  selectIsMachineInAlarm,
} from '../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { DismissibleTooltip } from '../../../views/DismissibleTooltip';
import { TooltipNoteIcon } from '../../../views/TooltipNoteIcon';
import styles from './styles.module.scss';

export const MachineResetUnlock = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const isInAlarm: boolean = useSelector(selectIsMachineInAlarm);
  const canUnlock: boolean = isConnected && isInAlarm;

  return (
    <div className={styles.machineResetUnlock}>
      {canUnlock && (
        <>
          <TooltipNoteIcon
            noteText={t(DEFAULT.MACHINE_CONTROL_ALARM_NOTE)}
            iconComponent={<WarningOutlined />}
            isWarning
            isPointerOnly
          />
          <Button
            size={ANTD_BUTTON_SIZE_SMALL}
            type={ANTD_BUTTON_TYPE_PRIMARY}
            icon={<UnlockOutlined />}
            aria-label={t(DEFAULT.MACHINE_CONTROL_UNLOCK)}
            aria-description={t(DEFAULT.MACHINE_CONTROL_ALARM_NOTE)}
            onClick={() => dispatch(new MachineUnlockRequested())}
          >
            {t(DEFAULT.MACHINE_CONTROL_UNLOCK)}
          </Button>
        </>
      )}
      {/* The tooltip names the action and says what it does, so the icon alone is enough on screen. */}
      <DismissibleTooltip title={t(DEFAULT.MACHINE_CONTROL_RESTART_TOOLTIP)}>
        <Button
          size={ANTD_BUTTON_SIZE_SMALL}
          type={ANTD_BUTTON_TYPE_TEXT}
          className={styles.restartButton}
          icon={<ReloadOutlined />}
          aria-label={t(DEFAULT.MACHINE_CONTROL_RESTART)}
          aria-description={t(DEFAULT.MACHINE_CONTROL_RESTART_NOTE)}
          disabled={!isConnected}
          onClick={() => dispatch(new MachineResetRequested())}
        />
      </DismissibleTooltip>
    </div>
  );
};
