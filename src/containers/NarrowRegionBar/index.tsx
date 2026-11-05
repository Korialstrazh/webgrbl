/**
 * The bar of the narrow layout that shows one region at a time: Design, Bed or Job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DashboardOutlined, EditOutlined, ProfileOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppDispatch } from '../../utils/states/new.store';
import { NarrowRegionChanged, selectNarrowRegion } from '../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../utils/states/workbench.region.constants';
import type { WorkbenchRegion } from '../../utils/states/workbench.region.constants';
import styles from './styles.module.scss';

const NARROW_REGION_SWITCH_NAME = 'narrow-region';

export const NarrowRegionBar = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const narrowRegion: WorkbenchRegion = useSelector(selectNarrowRegion);

  return (
    <div className={styles.narrowRegionBar}>
      <Segmented<WorkbenchRegion>
        block
        name={NARROW_REGION_SWITCH_NAME}
        aria-label={t(DEFAULT.NARROW_REGION_BAR_LABEL)}
        value={narrowRegion}
        options={[
          { value: WORKBENCH_REGION.DESIGN, icon: <EditOutlined aria-hidden />, label: t(DEFAULT.NARROW_REGION_DESIGN) },
          { value: WORKBENCH_REGION.BED, icon: <DashboardOutlined aria-hidden />, label: t(DEFAULT.NARROW_REGION_BED) },
          { value: WORKBENCH_REGION.JOB, icon: <ProfileOutlined aria-hidden />, label: t(DEFAULT.NARROW_REGION_JOB) },
        ]}
        onChange={(region: WorkbenchRegion) => dispatch(new NarrowRegionChanged({ narrowRegion: region }))}
      />
    </div>
  );
};
