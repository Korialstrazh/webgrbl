/**
 * The read-out in the one-line Status card: the state badge, then feed and power, each an icon beside its value and
 * unit. Their names are read by screen readers and shown as tooltips, so the line stays short.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DashboardOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { selectLaserChipPowerPercent } from '../../../utils/states/laser.state.chip.selector';
import { selectMachineStatus } from '../../../utils/states/machine.status.state';
import { MachineStateReadout } from '../MachineStateReadout';
import styles from './styles.module.scss';

const getNumberText = (value: number | undefined): string =>
  value?.toString() ?? MISSING_VALUE_TEXT;

export const MachineStatusRow = (): ReactNode => {
  const { t } = useTranslation();
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);
  // Power reads as a percent of S max, the same figure as the laser chip, so the two never disagree.
  const powerPercent: number | undefined = useSelector(selectLaserChipPowerPercent);

  return (
    <div className={styles.machineStatusRow}>
      <MachineStateReadout />
      <dl className={styles.values}>
        <dt title={t(DEFAULT.MACHINE_STATUS_FEED)}>
          <DashboardOutlined aria-hidden />
          <span className={styles.valueName}>{t(DEFAULT.MACHINE_STATUS_FEED)}</span>
        </dt>
        <dd>
          {getNumberText(status?.feedRate)}
          <span className={styles.unit}>{t(DEFAULT.FIELD_UNIT_MM_PER_MIN)}</span>
        </dd>
        <dt title={t(DEFAULT.MACHINE_STATUS_POWER)}>
          <ThunderboltOutlined aria-hidden />
          <span className={styles.valueName}>{t(DEFAULT.MACHINE_STATUS_POWER)}</span>
        </dt>
        <dd>
          {getNumberText(powerPercent)}
          <span className={styles.unit}>{t(DEFAULT.FIELD_UNIT_PERCENT)}</span>
        </dd>
      </dl>
    </div>
  );
};
