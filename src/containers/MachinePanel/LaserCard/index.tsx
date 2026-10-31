/**
 * The laser pointer card: pointer power, hold to fire, frame the job and air assist. Frame job is shown but inert
 * for now.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Slider, Switch } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE } from '../../../utils/antd.constants';
import { doNothing } from '../../../utils/do.nothing';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getPointerApproximateWatts } from '../../../utils/machine/get.pointer.approximate.watts';
import {
  MAX_POINTER_HOLD_MS,
  MAX_POINTER_POWER_PERCENT,
  MILLISECONDS_PER_SECOND,
  MIN_POINTER_POWER_PERCENT,
  POINTER_POWER_STEP_PERCENT,
} from '../../../utils/machine/machine.command.constants';
import { MACHINE_COMMAND } from '../../../utils/machine/machine.commands';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { LaserPointerPowerChanged, selectLaserPointerPowerPercent } from '../../../utils/states/laser.pointer.state';
import { selectActiveMachineProfile } from '../../../utils/states/machine.profile.state';
import {
  MachineAirAssistChanged,
  MachineLineRequested,
  selectIsAirAssistOn,
} from '../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ComingSoon } from '../../../views/ComingSoon';
import { Panel } from '../../../views/Panel';
import { PointerFireButton } from './PointerFireButton';
import styles from './styles.module.scss';

export const LaserCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const powerLabelId: string = useId();
  const isConnected: boolean = useSelector(selectIsConnected);
  const powerPercent: number = useSelector(selectLaserPointerPowerPercent);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const isAirAssistOn: boolean = useSelector(selectIsAirAssistOn);
  const isDisconnected: boolean = !isConnected;

  const changeAirAssist = (isOn: boolean): void => {
    dispatch(new MachineAirAssistChanged({ isAirAssistOn: isOn }));
    dispatch(new MachineLineRequested({ line: isOn ? MACHINE_COMMAND.AIR_ON : MACHINE_COMMAND.AIR_OFF }));
  };

  return (
    <Panel title={t(DEFAULT.MACHINE_LASER_TITLE)}>
      <div className={styles.laserCard}>
        <div className={styles.powerField}>
          <span id={powerLabelId}>{t(DEFAULT.MACHINE_LASER_POWER)}</span>
          <Slider
            min={MIN_POINTER_POWER_PERCENT}
            max={MAX_POINTER_POWER_PERCENT}
            step={POINTER_POWER_STEP_PERCENT}
            value={powerPercent}
            onChange={(percent: number) => dispatch(new LaserPointerPowerChanged({ percent }))}
            ariaLabelledByForHandle={powerLabelId}
          />
          {activeProfile && (
            <span className={styles.powerWatts}>
              {t(DEFAULT.MACHINE_LASER_POWER_WATTS, {
                watts: getPointerApproximateWatts(activeProfile.maxPowerWatts, powerPercent),
              })}
            </span>
          )}
        </div>
        <PointerFireButton />
        <p className={styles.firmwareNote}>
          {t(DEFAULT.MACHINE_LASER_FIRMWARE_NOTE, { seconds: MAX_POINTER_HOLD_MS / MILLISECONDS_PER_SECOND })}
        </p>
        <ComingSoon description={t(DEFAULT.MACHINE_LASER_FRAME_DESCRIPTION)}>
          <Button size={ANTD_BUTTON_SIZE_LARGE} onClick={doNothing}>
            {t(DEFAULT.MACHINE_LASER_FRAME)}
          </Button>
        </ComingSoon>
        {activeProfile?.hasAirAssist && (
          <label className={styles.switchField}>
            <Switch checked={isAirAssistOn} disabled={isDisconnected} onChange={changeAirAssist} />
            {t(DEFAULT.MACHINE_LASER_AIR_ASSIST)}
          </label>
        )}
      </div>
    </Panel>
  );
};
