/**
 * The Toolpath view group of the bed header: the colour switch (Power shading or By layer) and the travel moves switch,
 * each as an icon over a one-word caption like the view switch, so it reads without a hover; the full names stay in
 * the tooltips and the accessible names.
 * The job size and time of the ready toolpath sit in the playback bar.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { NodeIndexOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Segmented, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { TOOLPATH_DISPLAY_MODE } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayMode } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayModeOption } from './interfaces/ToolpathDisplayModeOption';
import type { ToolpathToolbarProps } from './interfaces/ToolpathToolbarProps';
import styles from './styles.module.scss';
import { TOOLPATH_DISPLAY_MODE_OPTIONS } from './toolpath.toolbar.constants';
import { SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../utils/tab.index.constants';

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
        // One tab stop: the checked option. antd also makes the group box focusable, a second stop with no use.
        tabIndex={SCRIPT_FOCUS_ONLY_TAB_INDEX}
        aria-label={t(DEFAULT.TOOLPATH_DISPLAY_LABEL)}
        className={styles.modeSwitch}
        options={TOOLPATH_DISPLAY_MODE_OPTIONS.map(
          ({ value, labelKey, captionKey, IconComponent }: ToolpathDisplayModeOption) => ({
            value,
            label: (
              <Tooltip title={t(labelKey)}>
                <span className={styles.modeOption}>
                  <IconComponent aria-hidden />
                  <span className={styles.caption} aria-hidden>{t(captionKey)}</span>
                  <span className={styles.modeName}>{t(labelKey)}</span>
                </span>
              </Tooltip>
            ),
          }),
        )}
        value={displayMode}
        onChange={onDisplayModeChange}
      />
      {displayMode === TOOLPATH_DISPLAY_MODE.POWER_SHADING && (
        // The ramp the burn paths are drawn in, so the shades on the bed read as power without a hover.
        // A lightning glyph before the ramp says power without words; the full key is in the tooltip.
        <Tooltip title={t(DEFAULT.TOOLPATH_POWER_LEGEND)}>
          <span className={styles.powerLegend} role="img" aria-label={t(DEFAULT.TOOLPATH_POWER_LEGEND)}>
            <ThunderboltOutlined className={styles.powerIcon} aria-hidden />
            <span className={styles.powerRamp} aria-hidden />
          </span>
        </Tooltip>
      )}
      {/* A toggle button shaped like a segment: icon over its word, the accent tint while travel moves are shown. */}
      <Tooltip title={t(DEFAULT.TOOLPATH_SHOW_TRAVEL)}>
        <Button
          className={[styles.travelToggle, isTravelShown ? styles.travelToggleOn : undefined].join(' ')}
          type={ANTD_BUTTON_TYPE_TEXT}
          aria-pressed={isTravelShown}
          aria-label={t(DEFAULT.TOOLPATH_SHOW_TRAVEL)}
          onClick={() => onTravelShownChange(!isTravelShown)}
        >
          <span className={styles.travelCaption} aria-hidden>
            <NodeIndexOutlined className={styles.travelIcon} />
            <span className={styles.caption}>{t(DEFAULT.TOOLPATH_SHOW_TRAVEL_CAPTION)}</span>
          </span>
        </Button>
      </Tooltip>
    </div>
  );
};
