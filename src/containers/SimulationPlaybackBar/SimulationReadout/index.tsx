/**
 * The readout of the simulated head: its X and Y in bed millimetres to a tenth, and the laser power of the move it is
 * on. Dashes stand in while the toolpath may not play.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { SIMULATION_READOUT_MM_DECIMALS } from '../simulation.playback.constants';
import type { SimulationReadoutProps } from './interfaces/SimulationReadoutProps';
import styles from './styles.module.scss';

const getMillimetreText = (valueMm: number | undefined): string =>
  // eslint-disable-next-line no-restricted-syntax -- 0 mm is a real position, distinct from no head
  (valueMm === undefined ? MISSING_VALUE_TEXT : valueMm.toFixed(SIMULATION_READOUT_MM_DECIMALS));

export const SimulationReadout = ({ position }: SimulationReadoutProps): ReactNode => {
  const { t } = useTranslation();
  const powerText: string = position ? String(Math.round(position.powerPercent)) : MISSING_VALUE_TEXT;

  return (
    <div className={styles.readout}>
      <span>{t(DEFAULT.SIMULATION_READOUT_X, { x: getMillimetreText(position?.point.x) })}</span>
      <span>{t(DEFAULT.SIMULATION_READOUT_Y, { y: getMillimetreText(position?.point.y) })}</span>
      <span>{t(DEFAULT.SIMULATION_READOUT_POWER, { power: powerText })}</span>
    </div>
  );
};
