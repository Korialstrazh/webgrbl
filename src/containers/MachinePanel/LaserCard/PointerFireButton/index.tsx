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
import { useEffect } from 'react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE } from '../../../../utils/antd.constants';
import { ENTER_KEY, PRIMARY_POINTER_BUTTON, SPACE_KEY } from '../../../../utils/browser/browser.events.constants';
import type { GrblResolvedStatus } from '../../../../utils/grbl/interfaces/GrblResolvedStatus';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { getCanFireLaserPointer } from '../../../../utils/machine/get.can.fire.laser.pointer';
import { selectIsConnected } from '../../../../utils/states/grbl.connection.state';
import { selectIsJobRunActive } from '../../../../utils/states/job.run.state';
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
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const canFire: boolean = getCanFireLaserPointer(isConnected, machineStatus?.machineState, isJobRunActive);
  // A disabled button may never get the pointer up or leave, so a held pointer keeps the button usable to let go.
  const isButtonUsable: boolean = canFire || isFiring;

  const requestFire = (): void => {
    dispatch(new LaserPointerFireRequested());
  };

  const requestRelease = (): void => {
    dispatch(new LaserPointerReleaseRequested());
  };

  const handlePointerDown = (pointerEvent: PointerEvent): void => {
    if (pointerEvent.button === PRIMARY_POINTER_BUTTON) {
      requestFire();
    }
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

  // A release while not firing is harmless, so unmounting always asks for one.
  useEffect(() => () => {
    dispatch(new LaserPointerReleaseRequested());
  }, [dispatch]);

  return (
    <Button
      className={isFiring ? styles.firing : undefined}
      size={ANTD_BUTTON_SIZE_LARGE}
      disabled={!isButtonUsable}
      onPointerDown={handlePointerDown}
      onPointerUp={requestRelease}
      onPointerLeave={requestRelease}
      onPointerCancel={requestRelease}
      onBlur={requestRelease}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {t(isFiring ? DEFAULT.MACHINE_LASER_ON : DEFAULT.MACHINE_LASER_FIRE)}
    </Button>
  );
};
