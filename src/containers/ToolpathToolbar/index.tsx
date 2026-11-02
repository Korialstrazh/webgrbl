/**
 * The Toolpath view group of the bed header: the colour switch (Power shading or By layer) and the travel moves switch.
 * The job size and time of the ready toolpath sit in the playback bar.
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
import { DEFAULT } from '../../utils/localization/default.locales';
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
        <Switch checked={isTravelShown} onChange={onTravelShownChange} />
        {t(DEFAULT.TOOLPATH_SHOW_TRAVEL)}
      </label>
    </div>
  );
};
