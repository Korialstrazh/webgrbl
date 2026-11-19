/**
 * The small view cluster in the bottom-right corner of the bed: an optional leading control (the bed colour), zoom
 * out, the zoom as a percentage of the fitted bed (with a fit note only while the view is fitted), zoom in, Fit and
 * Show all, which also brings objects lying off the bed into view.
 * Each button names its keyboard shortcut in its tooltip, and the cluster tells how to pan.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ExpandOutlined, FullscreenOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { BedZoomControlsProps } from './interfaces/BedZoomControlsProps';
import { DismissibleTooltip } from '../DismissibleTooltip';
import styles from './styles.module.scss';

export const BedZoomControls = (props: BedZoomControlsProps): ReactNode => {
  const { leadingControlComponent, zoomPercent, isFitted, canZoomIn, canZoomOut } = props;
  const { onZoomIn, onZoomOut, onFit, onShowAll } = props;
  const { t } = useTranslation();

  return (
    <Space.Compact className={styles.bedZoomControls} role="group" aria-label={t(DEFAULT.BED_ZOOM_CONTROLS_LABEL)}>
      {leadingControlComponent}
      <DismissibleTooltip title={t(DEFAULT.BED_ZOOM_OUT_HINT)}>
        <Button
          className={styles.zoomButton}
          aria-label={t(DEFAULT.BED_ZOOM_OUT_HINT)}
          disabled={!canZoomOut}
          onClick={onZoomOut}
          icon={<MinusOutlined />}
        />
      </DismissibleTooltip>
      <Tooltip title={t(DEFAULT.BED_ZOOM_PAN_HINT)}>
        {/* A plain readout: it shows the zoom and carries the pan hint, it is not a control. */}
        <span className={styles.zoomPercent} aria-live="polite">
          {t(DEFAULT.BED_ZOOM_PERCENT, { percent: zoomPercent })}
        </span>
      </Tooltip>
      <DismissibleTooltip title={t(DEFAULT.BED_ZOOM_IN_HINT)}>
        <Button
          className={styles.zoomButton}
          aria-label={t(DEFAULT.BED_ZOOM_IN_HINT)}
          disabled={!canZoomIn}
          onClick={onZoomIn}
          icon={<PlusOutlined />}
        />
      </DismissibleTooltip>
      <DismissibleTooltip title={t(DEFAULT.BED_ZOOM_FIT_HINT)}>
        <Button
          className={styles.zoomButton}
          aria-label={t(DEFAULT.BED_ZOOM_FIT_HINT)}
          aria-pressed={isFitted}
          onClick={onFit}
          icon={<ExpandOutlined />}
        />
      </DismissibleTooltip>
      <DismissibleTooltip title={t(DEFAULT.BED_ZOOM_SHOW_ALL_HINT)}>
        <Button
          className={styles.zoomButton}
          aria-label={t(DEFAULT.BED_ZOOM_SHOW_ALL_HINT)}
          onClick={onShowAll}
          icon={<FullscreenOutlined />}
        />
      </DismissibleTooltip>
    </Space.Compact>
  );
};
