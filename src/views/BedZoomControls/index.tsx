/**
 * The small zoom cluster in the bottom-right corner of the bed: zoom out, the zoom as a percentage of the fitted bed,
 * zoom in and Fit. Each button names its keyboard shortcut in its tooltip, and the cluster tells how to pan.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Space, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL } from '../../utils/antd.constants';
import { MINUS_SIGN, PLUS_SIGN } from '../../utils/characters.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { BedZoomControlsProps } from './interfaces/BedZoomControlsProps';
import styles from './styles.module.scss';

export const BedZoomControls = (props: BedZoomControlsProps): ReactNode => {
  const { zoomPercent, canZoomIn, canZoomOut, onZoomIn, onZoomOut, onFit } = props;
  const { t } = useTranslation();

  return (
    <Space.Compact className={styles.bedZoomControls} role="group" aria-label={t(DEFAULT.BED_ZOOM_CONTROLS_LABEL)}>
      <Tooltip title={t(DEFAULT.BED_ZOOM_OUT_HINT)}>
        <Button
          size={ANTD_BUTTON_SIZE_SMALL}
          aria-label={t(DEFAULT.BED_ZOOM_OUT_HINT)}
          disabled={!canZoomOut}
          onClick={onZoomOut}
        >
          {MINUS_SIGN}
        </Button>
      </Tooltip>
      <Tooltip title={t(DEFAULT.BED_ZOOM_PAN_HINT)}>
        {/* A plain readout: it shows the zoom and carries the pan hint, it is not a control. */}
        <span className={styles.zoomPercent} aria-live="polite">
          {t(DEFAULT.BED_ZOOM_PERCENT, { percent: zoomPercent })}
        </span>
      </Tooltip>
      <Tooltip title={t(DEFAULT.BED_ZOOM_IN_HINT)}>
        <Button
          size={ANTD_BUTTON_SIZE_SMALL}
          aria-label={t(DEFAULT.BED_ZOOM_IN_HINT)}
          disabled={!canZoomIn}
          onClick={onZoomIn}
        >
          {PLUS_SIGN}
        </Button>
      </Tooltip>
      <Tooltip title={t(DEFAULT.BED_ZOOM_FIT_HINT)}>
        <Button size={ANTD_BUTTON_SIZE_SMALL} aria-label={t(DEFAULT.BED_ZOOM_FIT_HINT)} onClick={onFit}>
          {t(DEFAULT.BED_ZOOM_FIT)}
        </Button>
      </Tooltip>
    </Space.Compact>
  );
};
