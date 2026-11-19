/**
 * The details of the laser pointer behind one icon button on the pointer row: the approximate watts of the power in
 * use, when the pointer switches off by itself, and air assist when the laser profile has it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CloudOutlined, ClockCircleOutlined, EllipsisOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Popover, Switch } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT,
  ANTD_POPOVER_TRIGGER_CLICK,
} from '../../../../../utils/antd.constants';
import { useOverlayRegistration } from '../../../../../utils/hooks/use.overlay.registration';
import { usePopoverFocusReturn } from '../../../../../utils/hooks/use.popover.focus.return';
import { DEFAULT } from '../../../../../utils/localization/default.locales';
import { getPointerApproximateWatts } from '../../../../../utils/machine/get.pointer.approximate.watts';
import { MAX_POINTER_HOLD_MS, MILLISECONDS_PER_SECOND } from '../../../../../utils/machine/machine.command.constants';
import { MACHINE_COMMAND } from '../../../../../utils/machine/machine.commands';
import type { MachineProfile } from '../../../../../utils/profiles/interfaces/MachineProfile';
import { selectIsConnected } from '../../../../../utils/states/grbl.connection.state';
import { selectIsJobRunActive } from '../../../../../utils/states/job.run.state';
import { selectActiveMachineProfile } from '../../../../../utils/states/machine.profile.state';
import {
  MachineAirAssistChanged,
  MachineLineRequested,
  selectIsAirAssistOn,
} from '../../../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../../../utils/states/new.store';
import { selectPointerPowerPercent } from '../../../../../utils/states/pointer.power.selector';
import styles from './styles.module.scss';

const POINTER_DETAILS_OVERLAY_ID = 'pointer-details';

export const PointerDetailsButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  usePopoverFocusReturn(isOpen);

  // Escape must only close this, not also stop the machine.
  useOverlayRegistration(POINTER_DETAILS_OVERLAY_ID, isOpen);

  const isConnected: boolean = useSelector(selectIsConnected);
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const powerPercent: number = useSelector(selectPointerPowerPercent);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const isAirAssistOn: boolean = useSelector(selectIsAirAssistOn);
  const maxHoldSeconds: number = MAX_POINTER_HOLD_MS / MILLISECONDS_PER_SECOND;

  const changeAirAssist = (isOn: boolean): void => {
    dispatch(new MachineAirAssistChanged({ isAirAssistOn: isOn }));
    dispatch(new MachineLineRequested({ line: isOn ? MACHINE_COMMAND.AIR_ON : MACHINE_COMMAND.AIR_OFF }));
  };

  const detailsComponent: ReactNode = (
    <div className={styles.details}>
      {activeProfile && (
        <p className={styles.detailLine}>
          <ThunderboltOutlined aria-hidden />
          {t(DEFAULT.MACHINE_LASER_POWER_WATTS, {
            watts: getPointerApproximateWatts(activeProfile.maxPowerWatts, powerPercent),
          })}
        </p>
      )}
      <p className={styles.detailLine}>
        <ClockCircleOutlined aria-hidden />
        {t(DEFAULT.MACHINE_LASER_FIRMWARE_NOTE, { seconds: maxHoldSeconds })}
      </p>
      {activeProfile?.hasAirAssist && (
        <label className={styles.switchField}>
          <CloudOutlined aria-hidden />
          {t(DEFAULT.MACHINE_LASER_AIR_ASSIST)}
          <Switch checked={isAirAssistOn} disabled={!isConnected || isJobRunActive} onChange={changeAirAssist} />
        </label>
      )}
    </div>
  );

  return (
    <Popover
      content={detailsComponent}
      trigger={ANTD_POPOVER_TRIGGER_CLICK}
      // Below the row, flipped by antd when there is no room, so it never covers the readiness stepper above.
      placement={ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT}
      autoAdjustOverflow
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Button
        type={ANTD_BUTTON_TYPE_TEXT}
        className={isAirAssistOn ? [styles.detailsButton, styles.airAssistOn].join(' ') : styles.detailsButton}
        icon={<EllipsisOutlined />}
        aria-label={t(DEFAULT.MACHINE_LASER_DETAILS)}
        aria-expanded={isOpen}
      />
    </Popover>
  );
};
