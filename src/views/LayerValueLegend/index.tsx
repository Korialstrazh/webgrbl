/**
 * A one-line key above a list of layers: the power, speed and passes icons, each with its name and the speed unit, so
 * the row values can be read without a hover. Hidden from screen readers, which read each row's full summary.
 *
 * @author michael.morosov
 *
 * @since 2026-11-06
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DashboardOutlined, SyncOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import styles from './styles.module.scss';

interface LayerValueLegendProps {
  className?: string;
}

export const LayerValueLegend = ({ className }: LayerValueLegendProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <p className={[className, styles.legend].join(' ')} aria-hidden>
      <span className={[styles.entry, styles.power].join(' ')}>
        <ThunderboltOutlined />
        {t(DEFAULT.LAYERS_LEGEND_POWER)}
      </span>
      <span className={[styles.entry, styles.speed].join(' ')}>
        <DashboardOutlined />
        {t(DEFAULT.LAYERS_LEGEND_SPEED)}
      </span>
      <span className={[styles.entry, styles.passes].join(' ')}>
        <SyncOutlined />
        {t(DEFAULT.LAYERS_LEGEND_PASSES)}
      </span>
    </p>
  );
};
