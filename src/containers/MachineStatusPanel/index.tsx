/**
 * The latest status of the laser: its state, where it is, how fast it moves and how hard the laser fires.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblMachineState } from '../../utils/grbl/grbl.constants';
import type { GrblAxisPosition } from '../../utils/grbl/interfaces/GrblAxisPosition';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectMachineStatus } from '../../utils/states/machine.status.state';
import styles from './styles.module.scss';

const MISSING_VALUE_TEXT = '-';
const POSITION_DECIMALS = 3;
const POSITION_SEPARATOR = ' / ';
const STATE_SUBSTATE_SEPARATOR = ' ';

const MACHINE_STATE_LABEL_KEY: Readonly<Record<GrblMachineState, string>> = {
  [GRBL_MACHINE_STATE.IDLE]: DEFAULT.MACHINE_STATE_IDLE,
  [GRBL_MACHINE_STATE.RUN]: DEFAULT.MACHINE_STATE_RUN,
  [GRBL_MACHINE_STATE.HOLD]: DEFAULT.MACHINE_STATE_HOLD,
  [GRBL_MACHINE_STATE.JOG]: DEFAULT.MACHINE_STATE_JOG,
  [GRBL_MACHINE_STATE.ALARM]: DEFAULT.MACHINE_STATE_ALARM,
  [GRBL_MACHINE_STATE.DOOR]: DEFAULT.MACHINE_STATE_DOOR,
  [GRBL_MACHINE_STATE.CHECK]: DEFAULT.MACHINE_STATE_CHECK,
  [GRBL_MACHINE_STATE.HOME]: DEFAULT.MACHINE_STATE_HOME,
  [GRBL_MACHINE_STATE.SLEEP]: DEFAULT.MACHINE_STATE_SLEEP,
};

const getPositionText = (position: GrblAxisPosition | undefined): string =>
  position
    ? [position.x, position.y, position.z]
      .map((axisValue: number) => axisValue.toFixed(POSITION_DECIMALS))
      .join(POSITION_SEPARATOR)
    : MISSING_VALUE_TEXT;

const getNumberText = (value: number | undefined): string =>
  value?.toString() ?? MISSING_VALUE_TEXT;

const getStateText = (status: GrblResolvedStatus | undefined, t: TFunction): string => {
  if (!status) {
    return MISSING_VALUE_TEXT;
  }

  const label: string = t(MACHINE_STATE_LABEL_KEY[status.machineState]);

  // Substate 0 is a real value (Hold:0), so it is kept.
  return [label, status.machineSubstate?.toString()].filter(Boolean).join(STATE_SUBSTATE_SEPARATOR);
};

const getStateClassName = (status: GrblResolvedStatus | undefined): string =>
  [styles.state, status ? styles[status.machineState] : styles.unknown].join(' ');

export const MachineStatusPanel = (): ReactNode => {
  const { t } = useTranslation();
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);

  return (
    <section className={styles.machineStatusPanel}>
      <div className={getStateClassName(status)}>{getStateText(status, t)}</div>
      <dl className={styles.values}>
        <dt>{t(DEFAULT.MACHINE_STATUS_WORK_POSITION)}</dt>
        <dd>{getPositionText(status?.workPosition)}</dd>
        <dt>{t(DEFAULT.MACHINE_STATUS_MACHINE_POSITION)}</dt>
        <dd>{getPositionText(status?.machinePosition)}</dd>
        <dt>{t(DEFAULT.MACHINE_STATUS_FEED)}</dt>
        <dd>{getNumberText(status?.feedRate)}</dd>
        <dt>{t(DEFAULT.MACHINE_STATUS_POWER)}</dt>
        <dd>{getNumberText(status?.spindleSpeed)}</dd>
      </dl>
    </section>
  );
};
