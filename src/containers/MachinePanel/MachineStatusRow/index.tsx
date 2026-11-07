/**
 * The one line of the Status card: feed and power, each an icon over a short caption beside its value, then Reset and
 * Unlock. The state itself sits in the card header.
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
import { selectMachineStatus } from '../../../utils/states/machine.status.state';
import { MachineResetUnlock } from '../MachineResetUnlock';
import styles from './styles.module.scss';

const getNumberText = (value: number | undefined): string =>
  value?.toString() ?? MISSING_VALUE_TEXT;

export const MachineStatusRow = (): ReactNode => {
  const { t } = useTranslation();
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);

  return (
    <div className={styles.machineStatusRow}>
      <dl className={styles.values}>
        <dt>
          <DashboardOutlined aria-hidden />
          <span className={styles.valueName}>{t(DEFAULT.MACHINE_STATUS_FEED)}</span>
        </dt>
        <dd>{getNumberText(status?.feedRate)}</dd>
        <dt>
          <ThunderboltOutlined aria-hidden />
          <span className={styles.valueName}>{t(DEFAULT.MACHINE_STATUS_POWER)}</span>
        </dt>
        <dd>{getNumberText(status?.spindleSpeed)}</dd>
      </dl>
      <MachineResetUnlock />
    </div>
  );
};
