/**
 * The Toolpath view part of the bed toolbar: the colour switch (Power shading or By layer), the travel moves switch,
 * and on the right the job size and estimate of the ready toolpath.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Segmented, Switch } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_SWITCH_SIZE_SMALL } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectReadyToolpathTotalTimeS } from '../../utils/states/toolpath.timeline.selectors';
import { selectToolpath } from '../../utils/states/toolpath.state';
import { getJobSummaryText } from '../../utils/toolpath/get.job.summary.text';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import type { ToolpathDisplayMode } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayModeOption } from './interfaces/ToolpathDisplayModeOption';
import type { ToolpathToolbarProps } from './interfaces/ToolpathToolbarProps';
import styles from './styles.module.scss';
import { TOOLPATH_DISPLAY_MODE_OPTIONS } from './toolpath.toolbar.constants';

export const ToolpathToolbar = ({
  displayMode,
  onDisplayModeChange,
  isTravelShown,
  onTravelShownChange,
}: ToolpathToolbarProps): ReactNode => {
  const { t } = useTranslation();
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const totalTimeS: number | undefined = useSelector(selectReadyToolpathTotalTimeS);

  return (
    <div className={styles.toolpathToolbar}>
      <Segmented<ToolpathDisplayMode>
        aria-label={t(DEFAULT.TOOLPATH_DISPLAY_LABEL)}
        options={TOOLPATH_DISPLAY_MODE_OPTIONS.map((option: ToolpathDisplayModeOption) => ({
          value: option.value,
          label: t(option.labelKey),
        }))}
        value={displayMode}
        onChange={onDisplayModeChange}
      />
      <label className={styles.travelSwitch}>
        <Switch size={ANTD_SWITCH_SIZE_SMALL} checked={isTravelShown} onChange={onTravelShownChange} />
        {t(DEFAULT.TOOLPATH_SHOW_TRAVEL)}
      </label>
      {/* eslint-disable-next-line no-restricted-syntax -- 0 s is a real estimate, distinct from no toolpath */}
      {totalTimeS !== undefined && (
        <span className={styles.jobSummary}>{getJobSummaryText(t, toolpath?.bounds, totalTimeS)}</span>
      )}
    </div>
  );
};
