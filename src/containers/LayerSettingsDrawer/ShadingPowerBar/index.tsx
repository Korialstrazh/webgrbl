/**
 * The black to white power bar of a shaded layer, with the power at its dark end and at its light end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getLayerPowerText } from '../../../utils/layers/get.layer.power.text';
import { SHADING_BAR_DARK_COLOUR } from '../../../utils/layers/layer.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { LayerSwatch } from '../../../views/LayerSwatch';
import type { ShadingPowerBarProps } from '../interfaces/ShadingPowerBarProps';
import styles from './styles.module.scss';

export const ShadingPowerBar = ({
  maxPowerPercent,
  minPowerPercent,
  maxPowerWatts,
}: ShadingPowerBarProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <div className={styles.bar} role="group" aria-label={t(DEFAULT.LAYER_SETTINGS_BAR_LABEL)}>
      <div className={styles.gradient}>
        <LayerSwatch colour={SHADING_BAR_DARK_COLOUR} isShading />
      </div>
      <div className={styles.ends}>
        <span>
          {t(DEFAULT.LAYER_SETTINGS_BAR_BLACK, { power: getLayerPowerText(t, maxPowerPercent, maxPowerWatts) })}
        </span>
        <span>
          {t(DEFAULT.LAYER_SETTINGS_BAR_WHITE, { power: getLayerPowerText(t, minPowerPercent, maxPowerWatts) })}
        </span>
      </div>
    </div>
  );
};
