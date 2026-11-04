/**
 * The Job card: the layers that go to the laser, the time estimate and the job actions. Export G-code is the main
 * action, filled and full width, since it is the one that works today; Start job runs it on the connected laser after a
 * confirmation, with the reason shown when it cannot start; Frame job stays coming soon.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Popconfirm, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';
import { useGcodeExportAvailability } from '../../../utils/hooks/use.gcode.export.availability';
import { useOverlayRegistration } from '../../../utils/hooks/use.overlay.registration';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { JobStartRequested, selectJobRunStatus } from '../../../utils/states/job.run.state';
import { JOB_RUN_STATUS } from '../../../utils/states/job.run.status.constants';
import type { JobRunStatus } from '../../../utils/states/job.run.status.constants';
import { selectJobStartBlockedReasonKey } from '../../../utils/states/job.start.blocked.reason.selector';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectEnabledProjectLayers, selectProjectLayers } from '../../../utils/states/project.document.state';
import { GcodeExportRequested } from '../../../utils/states/toolpath.state';
import { selectReadyToolpathTotalTimeS } from '../../../utils/states/toolpath.timeline.selectors';
import { getJobEstimateText } from '../../../utils/toolpath/get.job.estimate.text';
import { ComingSoon } from '../../../views/ComingSoon';
import { Panel } from '../../../views/Panel';
import { getJobLayerCountText } from './get.job.layer.count.text';
import styles from './styles.module.scss';

const JOB_START_CONFIRM_OVERLAY_ID = 'job-start-confirm';

const JOB_RUN_STATUS_TEXT_KEYS: Partial<Record<JobRunStatus, string>> = {
  [JOB_RUN_STATUS.SENDING]: DEFAULT.JOB_RUN_STATUS_SENDING,
  [JOB_RUN_STATUS.FINISHING]: DEFAULT.JOB_RUN_STATUS_FINISHING,
  [JOB_RUN_STATUS.COMPLETED]: DEFAULT.JOB_RUN_STATUS_COMPLETED,
  [JOB_RUN_STATUS.INTERRUPTED]: DEFAULT.JOB_RUN_STATUS_INTERRUPTED,
};

export const JobCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const enabledLayers: ProjectLayer[] = useSelector(selectEnabledProjectLayers);
  const { isGcodeExportEnabled, gcodeExportBlockedReasonKey }: GcodeExportAvailability = useGcodeExportAvailability();
  const totalTimeS: number | undefined = useSelector(selectReadyToolpathTotalTimeS);

  const jobStartBlockedReasonKey: string | undefined = useSelector(selectJobStartBlockedReasonKey);
  const jobRunStatusKey: string | undefined = JOB_RUN_STATUS_TEXT_KEYS[useSelector(selectJobRunStatus)];
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState<boolean>(false);

  // Escape must only close the confirmation here, not also stop the machine.
  useOverlayRegistration(JOB_START_CONFIRM_OVERLAY_ID, isStartConfirmOpen);

  // A confirmation left open after the start got blocked would offer a button that does nothing.
  useEffect(() => {
    if (jobStartBlockedReasonKey) {
      setIsStartConfirmOpen(false);
    }
  }, [jobStartBlockedReasonKey]);

  return (
    <Panel title={t(DEFAULT.MACHINE_START_JOB_TITLE)}>
      <div className={styles.jobCard}>
        <dl className={styles.facts}>
          <dt>{t(DEFAULT.MACHINE_JOB_LAYERS_LABEL)}</dt>
          <dd>{getJobLayerCountText(t, enabledLayers.length, layers.length - enabledLayers.length)}</dd>
          <dt>{t(DEFAULT.MACHINE_JOB_ESTIMATE_LABEL)}</dt>
          {/* eslint-disable-next-line no-restricted-syntax -- 0 s is a real estimate, distinct from no toolpath */}
          <dd>{totalTimeS === undefined ? MISSING_VALUE_TEXT : getJobEstimateText(t, totalTimeS)}</dd>
          {jobRunStatusKey && (
            <>
              <dt>{t(DEFAULT.JOB_RUN_STATUS_LABEL)}</dt>
              <dd role="status">{t(jobRunStatusKey)}</dd>
            </>
          )}
        </dl>
        <Tooltip title={gcodeExportBlockedReasonKey && t(gcodeExportBlockedReasonKey)}>
          {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
          <span className={styles.fullWidthButtonWrapper}>
            <Button
              block
              type={ANTD_BUTTON_TYPE_PRIMARY}
              size={ANTD_BUTTON_SIZE_LARGE}
              disabled={!isGcodeExportEnabled}
              onClick={() => dispatch(new GcodeExportRequested({ isWarningConfirmed: false }))}
            >
              {t(DEFAULT.MACHINE_JOB_EXPORT_GCODE)}
            </Button>
          </span>
        </Tooltip>
        <Popconfirm
          title={t(DEFAULT.JOB_START_CONFIRM_TITLE)}
          description={t(DEFAULT.JOB_START_CONFIRM_DESCRIPTION)}
          okText={t(DEFAULT.JOB_START_CONFIRM_OK)}
          cancelText={t(DEFAULT.JOB_START_CONFIRM_CANCEL)}
          okButtonProps={{ danger: true }}
          disabled={!!jobStartBlockedReasonKey}
          open={isStartConfirmOpen}
          onOpenChange={setIsStartConfirmOpen}
          onConfirm={() => dispatch(new JobStartRequested())}
        >
          <Tooltip title={jobStartBlockedReasonKey && t(jobStartBlockedReasonKey)}>
            {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
            <span className={styles.fullWidthButtonWrapper}>
              <Button block size={ANTD_BUTTON_SIZE_LARGE} disabled={!!jobStartBlockedReasonKey}>
                {t(DEFAULT.MACHINE_START_JOB)}
              </Button>
            </span>
          </Tooltip>
        </Popconfirm>
        <ComingSoon description={t(DEFAULT.MACHINE_JOB_FRAME_DESCRIPTION)} isFullWidth>
          <Button disabled>{t(DEFAULT.MACHINE_JOB_FRAME)}</Button>
        </ComingSoon>
      </div>
    </Panel>
  );
};
