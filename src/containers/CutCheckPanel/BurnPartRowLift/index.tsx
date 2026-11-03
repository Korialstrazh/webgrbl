/**
 * The small mark in a part row of the Cut check that says the part stands lifted, and how high.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ArrowUpOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { BURN_PART_LIFT_DISPLAY_DECIMALS } from '../../../utils/burn.model/burn.model.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectBurnPartEffectiveLiftMm } from '../../../utils/states/burn.model.state';
import type { BurnPartRowLiftProps } from './interfaces/BurnPartRowLiftProps';
import styles from './styles.module.scss';

export const BurnPartRowLift = ({ partId }: BurnPartRowLiftProps): ReactNode => {
  const { t } = useTranslation();
  const heightMm: number = useSelector(selectBurnPartEffectiveLiftMm(partId));

  if (heightMm <= 0) {
    return null;
  }

  const height: string = heightMm.toFixed(BURN_PART_LIFT_DISPLAY_DECIMALS);

  return (
    <span className={styles.burnPartRowLift} aria-label={t(DEFAULT.CUT_CHECK_PART_LIFTED_LABEL, { height })}>
      <ArrowUpOutlined aria-hidden="true" />
      {t(DEFAULT.CUT_CHECK_PART_LIFTED, { height })}
    </span>
  );
};
