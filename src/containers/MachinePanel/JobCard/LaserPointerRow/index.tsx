/**
 * The laser pointer row, the last row of the Job card: hold to fire, the pointer power of the active laser profile and
 * its figure, and a details button whose popover holds the watts, the switch-off note and air assist. It is one compact
 * row in every state, so a connect never shifts the cards; while no laser is connected the row is muted and compact:
 * the fire button shrinks to its icon and the controls are off.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Slider } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import {
  MAX_POINTER_POWER_PERCENT,
  MIN_POINTER_POWER_PERCENT,
  POINTER_POWER_STEP_PERCENT,
} from '../../../../utils/machine/machine.command.constants';
import { selectIsConnected } from '../../../../utils/states/grbl.connection.state';
import { LaserPointerPowerChanged } from '../../../../utils/states/laser.pointer.state';
import type { AppDispatch } from '../../../../utils/states/new.store';
import { selectPointerPowerPercent } from '../../../../utils/states/pointer.power.selector';
import { PointerDetailsButton } from './PointerDetailsButton';
import { PointerFireButton } from './PointerFireButton';
import styles from './styles.module.scss';

export const LaserPointerRow = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const powerPercent: number = useSelector(selectPointerPowerPercent);
  const isConnected: boolean = useSelector(selectIsConnected);
  const rowClassName: string | undefined = isConnected
    ? styles.laserPointerRow
    : [styles.laserPointerRow, styles.offline].join(' ');

  return (
    <div className={rowClassName} role="group" aria-label={t(DEFAULT.MACHINE_LASER_TITLE)}>
      <PointerFireButton />
      <Slider
        className={styles.powerSlider}
        min={MIN_POINTER_POWER_PERCENT}
        max={MAX_POINTER_POWER_PERCENT}
        step={POINTER_POWER_STEP_PERCENT}
        value={powerPercent}
        disabled={!isConnected}
        tooltip={{ open: false }}
        onChange={(percent: number) => dispatch(new LaserPointerPowerChanged({ percent }))}
        ariaLabelForHandle={t(DEFAULT.MACHINE_LASER_POWER)}
      />
      {/* The track runs up to the pointer's low maximum, not 100 %, so the figure names that maximum too and the
          thumb's place on the track matches what it reads. */}
      <output className={styles.powerValue} aria-hidden>
        {t(DEFAULT.MACHINE_LASER_POWER_PERCENT_OF_MAX, { percent: powerPercent, max: MAX_POINTER_POWER_PERCENT })}
      </output>
      <PointerDetailsButton />
    </div>
  );
};
