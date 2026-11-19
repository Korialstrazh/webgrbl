/**
 * The read-only laser chip of the top bar: an icon and a colour for what the app knows about the laser, with a sentence
 * in its tooltip. It sends nothing to the machine.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  AimOutlined,
  DisconnectOutlined,
  FireFilled,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import {
  LASER_CHIP_STATE,
  selectLaserChipPowerPercent,
  selectLaserChipState,
} from '../../utils/states/laser.state.chip.selector';
import type { LaserChipState } from '../../utils/states/laser.state.chip.selector';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import { LaserMachineIcon } from '../../views/LaserMachineIcon';
import styles from './styles.module.scss';

interface LaserChipLook {
  iconComponent: ReactNode;
  labelKey: string;
  hintKey: string;
  className: string | undefined;
}

const LASER_CHIP_LOOK: Record<LaserChipState, LaserChipLook> = {
  [LASER_CHIP_STATE.NOT_CONNECTED]: {
    iconComponent: <DisconnectOutlined aria-hidden />,
    labelKey: DEFAULT.LASER_STATE_NOT_CONNECTED,
    hintKey: DEFAULT.LASER_STATE_NOT_CONNECTED_HINT,
    className: styles.neutral,
  },
  [LASER_CHIP_STATE.POINTER_ON]: {
    iconComponent: <AimOutlined aria-hidden />,
    labelKey: DEFAULT.LASER_STATE_POINTER_ON,
    hintKey: DEFAULT.LASER_STATE_POINTER_ON_HINT,
    className: styles.danger,
  },
  [LASER_CHIP_STATE.FIRING]: {
    iconComponent: <FireFilled aria-hidden />,
    labelKey: DEFAULT.LASER_STATE_FIRING,
    hintKey: DEFAULT.LASER_STATE_FIRING_HINT,
    className: styles.firing,
  },
  [LASER_CHIP_STATE.JOB_RUNNING]: {
    iconComponent: <PlayCircleOutlined aria-hidden />,
    labelKey: DEFAULT.LASER_STATE_JOB_RUNNING,
    hintKey: DEFAULT.LASER_STATE_JOB_RUNNING_HINT,
    className: styles.warning,
  },
  [LASER_CHIP_STATE.OFF]: {
    iconComponent: <LaserMachineIcon aria-hidden />,
    labelKey: DEFAULT.LASER_STATE_OFF,
    hintKey: DEFAULT.LASER_STATE_OFF_HINT,
    className: styles.calm,
  },
  [LASER_CHIP_STATE.POWER_UNKNOWN]: {
    iconComponent: <QuestionCircleOutlined aria-hidden />,
    labelKey: DEFAULT.LASER_STATE_POWER_UNKNOWN,
    hintKey: DEFAULT.LASER_STATE_POWER_UNKNOWN_HINT,
    className: styles.neutral,
  },
};

export const LaserStateChip = (): ReactNode => {
  const { t } = useTranslation();
  const laserChipState: LaserChipState = useSelector(selectLaserChipState);
  const powerPercent: number | undefined = useSelector(selectLaserChipPowerPercent);
  const { iconComponent, labelKey, hintKey, className }: LaserChipLook = LASER_CHIP_LOOK[laserChipState];

  // The connection pill beside it already says there is no link.
  if (laserChipState === LASER_CHIP_STATE.NOT_CONNECTED) {
    return null;
  }

  return (
    <Tooltip title={t(hintKey)} trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS}>
      {/* Focusable, so a keyboard user can read the sentence; it is a readout, not a control. */}
      <span className={[styles.chip, className].join(' ')} aria-live="polite" tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}>
        {iconComponent}
        <span className={styles.label}>{t(labelKey, { powerPercent })}</span>
      </span>
    </Tooltip>
  );
};
