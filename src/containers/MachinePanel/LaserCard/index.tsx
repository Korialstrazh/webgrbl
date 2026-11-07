/**
 * The laser pointer card: pointer power, hold to fire and air assist. While no laser is connected none of them can
 * act, so the card is one line, a plug badge with the reason in its tooltip, with a chevron that opens the controls
 * anyway, disabled.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { AimOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Slider, Switch } from 'antd';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
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
import { selectIsJobRunActive } from '../../../utils/states/job.run.state';
import { LaserPointerPowerChanged, selectLaserPointerPowerPercent } from '../../../utils/states/laser.pointer.state';
import { selectActiveMachineProfile } from '../../../utils/states/machine.profile.state';
import {
  MachineAirAssistChanged,
  MachineLineRequested,
  selectIsAirAssistOn,
} from '../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ConnectionPopoverOpenChanged } from '../../../utils/states/ui.overlay.state';
import { CollapsedCardToggle } from '../../../views/CollapsedCardToggle';
import { IconFieldLabel } from '../../../views/IconFieldLabel';
import { Panel } from '../../../views/Panel';
import { TooltipNoteIcon } from '../../../views/TooltipNoteIcon';
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
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const [isShownWhileDisconnected, setIsShownWhileDisconnected] = useState<boolean>(false);
  const controlsId: string = useId();
  const maxHoldSeconds: number = MAX_POINTER_HOLD_MS / MILLISECONDS_PER_SECOND;
  const isCollapsed: boolean = isDisconnected && !isShownWhileDisconnected;
  const toggleLabelKey: string = isCollapsed
    ? DEFAULT.MACHINE_LASER_SHOW_CONTROLS_LABEL
    : DEFAULT.MACHINE_LASER_HIDE_CONTROLS_LABEL;
  const collapseToggleComponent: ReactNode = isConnected ? undefined : (
    <CollapsedCardToggle
      isCollapsed={isCollapsed}
      hintText={t(DEFAULT.MACHINE_LASER_COLLAPSED_HINT)}
      controlsId={controlsId}
      toggleLabel={t(toggleLabelKey)}
      onToggle={() => setIsShownWhileDisconnected(isCollapsed)}
      onPlugClick={() => dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }))}
    />
  );

  const changeAirAssist = (isOn: boolean): void => {
    dispatch(new MachineAirAssistChanged({ isAirAssistOn: isOn }));
    dispatch(new MachineLineRequested({ line: isOn ? MACHINE_COMMAND.AIR_ON : MACHINE_COMMAND.AIR_OFF }));
  };

  return (
    <Panel
      iconComponent={<AimOutlined />}
      title={t(DEFAULT.MACHINE_LASER_TITLE)}
      headerActionComponent={collapseToggleComponent}
    >
      {isCollapsed ? undefined : (
        <div id={controlsId} className={styles.laserCard}>
          <div className={styles.powerField}>
            <span id={powerLabelId}>
              <IconFieldLabel iconComponent={<ThunderboltOutlined />} labelText={t(DEFAULT.MACHINE_LASER_POWER)} />
            </span>
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
          {/* A few words on screen; the full note opens from the icon on hover, tap or keyboard focus. */}
          <p className={styles.firmwareNote}>
            {t(DEFAULT.MACHINE_LASER_FIRMWARE_SHORT, { seconds: maxHoldSeconds })}
            <TooltipNoteIcon noteText={t(DEFAULT.MACHINE_LASER_FIRMWARE_NOTE, { seconds: maxHoldSeconds })} />
          </p>
          {activeProfile?.hasAirAssist && (
            <label className={styles.switchField}>
              <Switch checked={isAirAssistOn} disabled={isDisconnected || isJobRunActive} onChange={changeAirAssist} />
              {t(DEFAULT.MACHINE_LASER_AIR_ASSIST)}
            </label>
          )}
        </div>
      )}
    </Panel>
  );
};
