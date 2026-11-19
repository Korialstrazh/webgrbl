/**
 * The bar of the narrow layout that shows one region at a time: Design, Bed or Job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BlockOutlined, BorderOuterOutlined, ProfileOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppDispatch } from '../../utils/states/new.store';
import { ConsoleOpenChanged, selectIsConsoleOpen } from '../../utils/states/panel.layout.state';
import { NarrowRegionChanged, selectNarrowRegion } from '../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../utils/states/workbench.region.constants';
import type { WorkbenchRegion } from '../../utils/states/workbench.region.constants';
import styles from './styles.module.scss';
import { SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../utils/tab.index.constants';

const NARROW_REGION_SWITCH_NAME = 'narrow-region';

export const NarrowRegionBar = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const narrowRegion: WorkbenchRegion = useSelector(selectNarrowRegion);
  const isConsoleOpen: boolean = useSelector(selectIsConsoleOpen);

  // The console is a sheet over the region on screen, so a switch to another region puts it away instead of leaving
  // it over the new one.
  const changeRegion = (region: WorkbenchRegion): void => {
    dispatch(new NarrowRegionChanged({ narrowRegion: region }));

    if (isConsoleOpen) {
      dispatch(new ConsoleOpenChanged({ isConsoleOpen: false }));
    }
  };

  return (
    <div className={styles.narrowRegionBar}>
      <Segmented<WorkbenchRegion>
        // One tab stop: the checked option. antd also makes the group box focusable, a second stop with no use.
        tabIndex={SCRIPT_FOCUS_ONLY_TAB_INDEX}
        block
        name={NARROW_REGION_SWITCH_NAME}
        aria-label={t(DEFAULT.NARROW_REGION_BAR_LABEL)}
        value={narrowRegion}
        options={[
          {
            value: WORKBENCH_REGION.DESIGN,
            icon: <BlockOutlined aria-hidden />,
            label: t(DEFAULT.NARROW_REGION_DESIGN),
          },
          {
            value: WORKBENCH_REGION.BED,
            icon: <BorderOuterOutlined aria-hidden />,
            label: t(DEFAULT.NARROW_REGION_BED),
          },
          { value: WORKBENCH_REGION.JOB, icon: <ProfileOutlined aria-hidden />, label: t(DEFAULT.NARROW_REGION_JOB) },
        ]}
        onChange={changeRegion}
      />
    </div>
  );
};
