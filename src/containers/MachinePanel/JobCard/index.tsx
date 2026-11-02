/**
 * The Job card: the layers that go to the laser, the time estimate and the G-code export. Start job stays coming
 * soon, disabled and unfilled, until the job runs from the app.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE } from '../../../utils/antd.constants';
import { EM_DASH } from '../../../utils/characters.constants';
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';
import { useGcodeExportAvailability } from '../../../utils/hooks/use.gcode.export.availability';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectEnabledProjectLayers, selectProjectLayers } from '../../../utils/states/project.document.state';
import { GcodeExportRequested } from '../../../utils/states/toolpath.state';
import { selectReadyToolpathTotalTimeS } from '../../../utils/states/toolpath.timeline.selectors';
import { getJobEstimateText } from '../../../utils/toolpath/get.job.estimate.text';
import { ComingSoon } from '../../../views/ComingSoon';
import { Panel } from '../../../views/Panel';
import { getJobLayerCountText } from './get.job.layer.count.text';
import styles from './styles.module.scss';

export const JobCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const enabledLayers: ProjectLayer[] = useSelector(selectEnabledProjectLayers);
  const { isGcodeExportEnabled, gcodeExportBlockedReasonKey }: GcodeExportAvailability = useGcodeExportAvailability();
  const totalTimeS: number | undefined = useSelector(selectReadyToolpathTotalTimeS);

  return (
    <Panel title={t(DEFAULT.MACHINE_START_JOB_TITLE)}>
      <div className={styles.jobCard}>
        <dl className={styles.facts}>
          <dt>{t(DEFAULT.MACHINE_JOB_LAYERS_LABEL)}</dt>
          <dd>{getJobLayerCountText(t, enabledLayers.length, layers.length - enabledLayers.length)}</dd>
          <dt>{t(DEFAULT.MACHINE_JOB_ESTIMATE_LABEL)}</dt>
          {/* eslint-disable-next-line no-restricted-syntax -- 0 s is a real estimate, distinct from no toolpath */}
          <dd>{totalTimeS === undefined ? EM_DASH : getJobEstimateText(t, totalTimeS)}</dd>
        </dl>
        <Tooltip title={gcodeExportBlockedReasonKey && t(gcodeExportBlockedReasonKey)}>
          {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
          <span className={styles.exportButtonWrapper}>
            <Button
              block
              disabled={!isGcodeExportEnabled}
              onClick={() => dispatch(new GcodeExportRequested({ isWarningConfirmed: false }))}
            >
              {t(DEFAULT.MACHINE_JOB_EXPORT_GCODE)}
            </Button>
          </span>
        </Tooltip>
        <ComingSoon description={t(DEFAULT.MACHINE_START_JOB_DESCRIPTION)}>
          {/* Unfilled until streaming exists: a control that is not built yet never looks like the main action. */}
          <Button size={ANTD_BUTTON_SIZE_LARGE} disabled>
            {t(DEFAULT.MACHINE_START_JOB)}
          </Button>
        </ComingSoon>
      </div>
    </Panel>
  );
};
