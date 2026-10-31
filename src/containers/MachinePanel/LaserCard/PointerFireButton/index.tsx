/**
 * The hold-to-fire button of the laser pointer. The pointer is on only while the button is held: any way of letting
 * go, including the pointer leaving the button, requests the release.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE } from '../../../../utils/antd.constants';
import { ENTER_KEY, SPACE_KEY } from '../../../../utils/browser/browser.events.constants';
import type { GrblResolvedStatus } from '../../../../utils/grbl/interfaces/GrblResolvedStatus';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { getCanFireLaserPointer } from '../../../../utils/machine/get.can.fire.laser.pointer';
import { selectIsConnected } from '../../../../utils/states/grbl.connection.state';
import {
  LaserPointerFireRequested,
  LaserPointerReleaseRequested,
  selectIsLaserPointerFiring,
} from '../../../../utils/states/laser.pointer.state';
import { selectMachineStatus } from '../../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../../utils/states/new.store';
import styles from './styles.module.scss';

const FIRE_KEYS: readonly string[] = [SPACE_KEY, ENTER_KEY];

export const PointerFireButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const machineStatus: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);
  const isFiring: boolean = useSelector(selectIsLaserPointerFiring);
  const canFire: boolean = getCanFireLaserPointer(isConnected, machineStatus?.machineState);

  const requestFire = (): void => {
    dispatch(new LaserPointerFireRequested());
  };

  const requestRelease = (): void => {
    dispatch(new LaserPointerReleaseRequested());
  };

  const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
    if (!FIRE_KEYS.includes(keyboardEvent.key)) {
      return;
    }

    // Space would otherwise click the button on key up and scroll the page.
    keyboardEvent.preventDefault();

    if (!keyboardEvent.repeat) {
      requestFire();
    }
  };

  const handleKeyUp = (keyboardEvent: KeyboardEvent): void => {
    if (FIRE_KEYS.includes(keyboardEvent.key)) {
      keyboardEvent.preventDefault();
      requestRelease();
    }
  };

  return (
    <Button
      className={isFiring ? styles.firing : undefined}
      size={ANTD_BUTTON_SIZE_LARGE}
      disabled={!canFire}
      onPointerDown={requestFire}
      onPointerUp={requestRelease}
      onPointerLeave={requestRelease}
      onPointerCancel={requestRelease}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {t(isFiring ? DEFAULT.MACHINE_LASER_ON : DEFAULT.MACHINE_LASER_FIRE)}
    </Button>
  );
};
