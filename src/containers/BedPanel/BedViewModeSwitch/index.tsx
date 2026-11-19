/**
 * The switch between the Design, Toolpath and 3D views: icons with a name on hover, shown below the toolbar and gone on
 * a click, so the name never covers what the click changed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Segmented } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { BedViewMode } from '../../../utils/bed/bed.view.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import {
  BED_VIEW_MODE_OPTION_KEYS,
  BED_VIEW_MODE_SWITCH_NAME,
  BED_VIEW_OPTION_ATTRIBUTE,
} from '../bed.toolbar.constants';
import type { BedViewModeControls } from '../interfaces/BedViewModeControls';
import type { BedViewModeOptionKey } from '../interfaces/BedViewModeOptionKey';
import styles from './styles.module.scss';
import { SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../../utils/tab.index.constants';

export const BedViewModeSwitch = ({ viewMode, changeBedViewMode }: BedViewModeControls): ReactNode => {
  const { t } = useTranslation();

  return (
    <Segmented<BedViewMode>
      // One tab stop: the checked option. antd also makes the group box focusable, a second stop with no use.
      tabIndex={SCRIPT_FOCUS_ONLY_TAB_INDEX}
      className={styles.viewSwitch}
      name={BED_VIEW_MODE_SWITCH_NAME}
      aria-label={t(DEFAULT.BED_VIEW_MODE_LABEL)}
      options={BED_VIEW_MODE_OPTION_KEYS.map(({ value, labelKey, IconComponent }: BedViewModeOptionKey) => ({
        value,
        label: (
          <span className={styles.viewOption} {...{ [BED_VIEW_OPTION_ATTRIBUTE]: value }}>
            <IconComponent aria-hidden />
            <span className={styles.caption}>{t(labelKey)}</span>
          </span>
        ),
      }))}
      value={viewMode}
      onChange={changeBedViewMode}
    />
  );
};
