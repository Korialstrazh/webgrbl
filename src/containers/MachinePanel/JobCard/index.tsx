/**
 * The Job card: the layers that go to the laser, the time estimate and the job actions. Start job is the main
 * action, filled in the accent colour once it can run, and runs the job on the connected laser after a confirmation.
 * What keeps Start job and Export G-code off is written below them. Frame job, with its settings behind a gear, traces
 * the outline of the job.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BlockOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  PlayCircleFilled,
  ProfileOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_DEFAULT, ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';
import { useGcodeExportAvailability } from '../../../utils/hooks/use.gcode.export.availability';
import { useOverlayRegistration } from '../../../utils/hooks/use.overlay.registration';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { JOB_PAUSED_CONTROLS } from '../../../utils/states/job.pause.control.constants';
import type { JobPauseControl } from '../../../utils/states/job.pause.control.constants';
import { selectJobPauseControl } from '../../../utils/states/job.pause.control.selector';
import type { JobRunKind } from '../../../utils/states/job.run.kind.constants';
import {
  JobStartRequested,
  selectIsJobRunActive,
  selectJobRunKind,
  selectJobRunStatus,
} from '../../../utils/states/job.run.state';
import type { JobRunStatus } from '../../../utils/states/job.run.status.constants';
import { selectJobStartBlockedReasonKey } from '../../../utils/states/job.start.blocked.reason.selector';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectEnabledProjectLayers, selectProjectLayers } from '../../../utils/states/project.document.state';
import { GcodeExportRequested } from '../../../utils/states/toolpath.state';
import { selectReadyToolpathTotalTimeS } from '../../../utils/states/toolpath.timeline.selectors';
import { getJobEstimateText } from '../../../utils/toolpath/get.job.estimate.text';
import { IconActionButton } from '../../../views/IconActionButton';
import { Panel } from '../../../views/Panel';
import { FrameControls } from './FrameControls';
import { JobPauseButton } from './JobPauseButton';
import { JobRunProgress } from './JobRunProgress';
import { getJobLayerCountText } from './get.job.layer.count.text';
import { getJobRunStatusKey } from './get.job.run.status.key';
import styles from './styles.module.scss';

const JOB_START_CONFIRM_OVERLAY_ID = 'job-start-confirm';

export const JobCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const enabledLayers: ProjectLayer[] = useSelector(selectEnabledProjectLayers);
  const { isGcodeExportEnabled, gcodeExportBlockedReasonKey }: GcodeExportAvailability = useGcodeExportAvailability();
  const totalTimeS: number | undefined = useSelector(selectReadyToolpathTotalTimeS);

  const jobStartBlockedReasonKey: string | undefined = useSelector(selectJobStartBlockedReasonKey);
  const jobRunStatus: JobRunStatus = useSelector(selectJobRunStatus);
  const pauseControl: JobPauseControl = useSelector(selectJobPauseControl);
  const jobRunKind: JobRunKind = useSelector(selectJobRunKind);
  const jobRunStatusKey: string | undefined = getJobRunStatusKey(
    jobRunKind,
    jobRunStatus,
    JOB_PAUSED_CONTROLS.includes(pauseControl),
  );
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
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
    <Panel iconComponent={<ProfileOutlined />} title={t(DEFAULT.MACHINE_START_JOB_TITLE)}>
      <div className={styles.jobCard}>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>
              <BlockOutlined aria-hidden />
              <span className={styles.factLabel}>{t(DEFAULT.MACHINE_JOB_LAYERS_LABEL)}</span>
            </dt>
            <dd>{getJobLayerCountText(t, enabledLayers.length, layers.length - enabledLayers.length)}</dd>
          </div>
          <div className={styles.fact}>
            <dt>
              <ClockCircleOutlined aria-hidden />
              <span className={styles.factLabel}>{t(DEFAULT.MACHINE_JOB_ESTIMATE_LABEL)}</span>
            </dt>
            {/* eslint-disable-next-line no-restricted-syntax -- 0 s is a real estimate, distinct from no toolpath */}
            <dd>{totalTimeS === undefined ? MISSING_VALUE_TEXT : getJobEstimateText(t, totalTimeS)}</dd>
          </div>
          {jobRunStatusKey && (
            <div className={styles.fact}>
              <dt><span className={styles.factLabel}>{t(DEFAULT.JOB_RUN_STATUS_LABEL)}</span></dt>
              <dd role="status">{t(jobRunStatusKey)}</dd>
            </div>
          )}
        </dl>
        {isJobRunActive && <JobRunProgress />}
        <JobPauseButton />
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
          <Button
            block
            type={jobStartBlockedReasonKey ? ANTD_BUTTON_TYPE_DEFAULT : ANTD_BUTTON_TYPE_PRIMARY}
            size={ANTD_BUTTON_SIZE_LARGE}
            icon={<PlayCircleFilled aria-hidden />}
            disabled={!!jobStartBlockedReasonKey}
          >
            {t(DEFAULT.MACHINE_START_JOB)}
          </Button>
        </Popconfirm>
        {jobStartBlockedReasonKey && (
          <p className={styles.blockedReason}>
            <InfoCircleOutlined aria-hidden />
            {t(jobStartBlockedReasonKey)}
          </p>
        )}
        <FrameControls
          leadingActionComponent={(
            <IconActionButton
              size={ANTD_BUTTON_SIZE_LARGE}
              labelText={t(DEFAULT.MACHINE_JOB_EXPORT_GCODE)}
              iconComponent={<DownloadOutlined />}
              blockedReasonText={gcodeExportBlockedReasonKey && t(gcodeExportBlockedReasonKey)}
              isDisabled={!isGcodeExportEnabled}
              onClick={() => dispatch(new GcodeExportRequested({ isWarningConfirmed: false }))}
            />
          )}
        />
        {gcodeExportBlockedReasonKey && (
          <p className={styles.blockedReason}>
            <DownloadOutlined aria-hidden />
            {t(gcodeExportBlockedReasonKey)}
          </p>
        )}
      </div>
    </Panel>
  );
};
