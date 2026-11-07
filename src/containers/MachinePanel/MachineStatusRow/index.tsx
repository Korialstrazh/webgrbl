/**
 * The read-out in the Status card header: feed and power, each an icon and a short caption beside its value, then the
 * state badge, so the card body holds only Reset and Unlock.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
      <dl className={styles.values}>
        <dt>
          <DashboardOutlined aria-hidden />
          <span className={styles.valueName}>{t(DEFAULT.MACHINE_STATUS_FEED)}</span>
        </dt>
        <dd>
          {getNumberText(status?.feedRate)}
          <span className={styles.unit}>{t(DEFAULT.FIELD_UNIT_MM_PER_MIN)}</span>
        </dd>
        <dt>
          <ThunderboltOutlined aria-hidden />
          <span className={styles.valueName}>{t(DEFAULT.MACHINE_STATUS_POWER)}</span>
        </dt>
        <dd>
          {getNumberText(powerPercent)}
          <span className={styles.unit}>{t(DEFAULT.FIELD_UNIT_PERCENT)}</span>
        </dd>
      </dl>
      <MachineStateReadout />
    </div>
  );
};
