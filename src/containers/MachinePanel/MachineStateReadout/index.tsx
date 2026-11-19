/**
 * The state of the laser as a coloured dot and word, shown in the Status card header.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { GRBL_MACHINE_STATE } from '../../../utils/grbl/grbl.constants';
import type { GrblMachineState } from '../../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { selectMachineStatus } from '../../../utils/states/machine.status.state';
import styles from './styles.module.scss';

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

export const MachineStateReadout = (): ReactNode => {
  const { t } = useTranslation();
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);

  return <span className={getStateClassName(status)}>{getStateText(status, t)}</span>;
};
