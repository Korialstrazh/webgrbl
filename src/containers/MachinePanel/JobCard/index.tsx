/**
 * The Job card: the layers that go to the laser, the time estimate and the job actions. Start job is the main
 * action, filled in the accent colour once it can run, and runs the job on the connected laser after a confirmation.
 * A readiness row says what is still open, and why Start job and Frame job are off sits behind a warning icon in the
 * heading;
 * Export G-code is a quiet secondary action that gives its reason in a tooltip. Frame job, with its settings behind a
 * gear, traces the outline of the job.
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
  LockFilled,
  PlayCircleFilled,
  ProfileOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';
import { useGcodeExportAvailability } from '../../../utils/hooks/use.gcode.export.availability';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { JOB_PAUSED_CONTROLS } from '../../../utils/states/job.pause.control.constants';
import type { JobPauseControl } from '../../../utils/states/job.pause.control.constants';
import { selectJobPauseControl } from '../../../utils/states/job.pause.control.selector';
import { selectFirstUnmetJobReadinessStep } from '../../../utils/states/job.readiness.selector';
import type { JobReadinessStep } from '../../../utils/states/job.readiness.selector';
import type { JobRunKind } from '../../../utils/states/job.run.kind.constants';
import {
  selectIsJobRunActive,
  selectJobRunKind,
  selectJobRunStatus,
} from '../../../utils/states/job.run.state';
import type { JobRunStatus } from '../../../utils/states/job.run.status.constants';
import { selectFrameStartBlockedReasonKey } from '../../../utils/states/frame.start.blocked.reason.selector';
import { selectJobStartBlockedReasonKey } from '../../../utils/states/job.start.blocked.reason.selector';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectEnabledProjectLayers, selectProjectLayers } from '../../../utils/states/project.document.state';
import { GcodeExportRequested } from '../../../utils/states/toolpath.state';
import { selectReadyToolpathTotalTimeS } from '../../../utils/states/toolpath.timeline.selectors';
import { getJobEstimateText } from '../../../utils/toolpath/get.job.estimate.text';
import { CaptionedActionButton } from '../../../views/CaptionedActionButton';
import { FrameTraceIcon } from '../../../views/FrameTraceIcon';
import { Panel } from '../../../views/Panel';
import { TooltipNoteIcon } from '../../../views/TooltipNoteIcon';
import { JobStartButton } from '../../JobStartButton';
import { FrameControls } from './FrameControls';
import { JobPauseButton } from './JobPauseButton';
import { JobReadinessRow } from './JobReadinessRow';
import { JobRunProgress } from './JobRunProgress';
import { getJobActionBlockedReasonKeys } from './get.job.action.blocked.reason.keys';
import { getJobLayerCountText } from './get.job.layer.count.text';
import { getJobLockReasonGroups } from './get.job.lock.reason.groups';
import { getJobRunStatusKey } from './get.job.run.status.key';
import { isJobLockReasonOnNextStep } from './is.job.lock.reason.on.next.step';
import type { JobLockReasonGroup } from './interfaces/JobLockReasonGroup';
import { JOB_LOCK_REASON_TEST_ID } from './job.card.constants';
import { JOB_LOCK_ACTION } from './job.lock.action.constants';
import type { JobLockAction } from './job.lock.action.constants';
import styles from './styles.module.scss';

const REASON_SEPARATOR = ' ';

const JOB_LOCK_ACTION_ICONS: Readonly<Record<JobLockAction, ReactNode>> = {
  [JOB_LOCK_ACTION.START]: <PlayCircleFilled />,
  [JOB_LOCK_ACTION.FRAME]: <FrameTraceIcon />,
  [JOB_LOCK_ACTION.EXPORT]: <DownloadOutlined />,
};

const JOB_LOCK_ACTION_LABEL_KEYS: Readonly<Record<JobLockAction, string>> = {
  [JOB_LOCK_ACTION.START]: DEFAULT.MACHINE_START_JOB,
  [JOB_LOCK_ACTION.FRAME]: DEFAULT.MACHINE_JOB_FRAME,
  [JOB_LOCK_ACTION.EXPORT]: DEFAULT.MACHINE_JOB_EXPORT_GCODE,
};

interface JobCardProps {
  /** False where Start job is pinned elsewhere, as in the narrow layout. */
  isStartShown?: boolean;
}

export const JobCard = ({ isStartShown = true }: JobCardProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const enabledLayers: ProjectLayer[] = useSelector(selectEnabledProjectLayers);
  const { isGcodeExportEnabled, gcodeExportBlockedReasonKey }: GcodeExportAvailability = useGcodeExportAvailability();
  const totalTimeS: number | undefined = useSelector(selectReadyToolpathTotalTimeS);

  const jobStartBlockedReasonKey: string | undefined = useSelector(selectJobStartBlockedReasonKey);
  const frameStartBlockedReasonKey: string | undefined = useSelector(selectFrameStartBlockedReasonKey);
  const actionBlockedReasonKeys: string[] = getJobActionBlockedReasonKeys(
    jobStartBlockedReasonKey,
    frameStartBlockedReasonKey,
  );
  const actionBlockedReasonText: string = actionBlockedReasonKeys
    .map((reasonKey: string): string => t(reasonKey))
    .join(REASON_SEPARATOR);
  const nextReadinessStep: JobReadinessStep | undefined = useSelector(selectFirstUnmetJobReadinessStep);
  // Each locked action names its own reason; one the next-step button already asks for is said there only.
  const lockReasonGroups: JobLockReasonGroup[] = getJobLockReasonGroups([
    { action: JOB_LOCK_ACTION.START, blockedReasonKey: isStartShown ? jobStartBlockedReasonKey : undefined },
    { action: JOB_LOCK_ACTION.FRAME, blockedReasonKey: frameStartBlockedReasonKey },
    { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: gcodeExportBlockedReasonKey },
  ]).filter(
    (group: JobLockReasonGroup): boolean => !isJobLockReasonOnNextStep(group.shortReasonKey, nextReadinessStep),
  );
  const jobRunStatus: JobRunStatus = useSelector(selectJobRunStatus);
  const pauseControl: JobPauseControl = useSelector(selectJobPauseControl);
  const jobRunKind: JobRunKind = useSelector(selectJobRunKind);
  const jobRunStatusKey: string | undefined = getJobRunStatusKey(
    jobRunKind,
    jobRunStatus,
    JOB_PAUSED_CONTROLS.includes(pauseControl),
  );
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);

  return (
    <Panel
      iconComponent={<ProfileOutlined />}
      title={t(DEFAULT.MACHINE_START_JOB_TITLE)}
      headerActionComponent={actionBlockedReasonText && (
        // Disabled buttons take no focus, so their reasons sit behind one icon that keyboard, pointer and screen
        // reader all reach, instead of a standing sentence.
        <TooltipNoteIcon noteText={actionBlockedReasonText} isWarning />
      )}
    >
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
        {!isJobRunActive && <JobReadinessRow />}
        {isJobRunActive && <JobRunProgress />}
        <JobPauseButton />
        <FrameControls
          startActionComponent={isStartShown ? <JobStartButton /> : undefined}
          exportActionComponent={(
            <CaptionedActionButton
              labelText={t(DEFAULT.MACHINE_JOB_EXPORT_GCODE)}
              captionText={t(DEFAULT.MACHINE_JOB_EXPORT_CAPTION)}
              iconComponent={<DownloadOutlined />}
              blockedReasonText={gcodeExportBlockedReasonKey && t(gcodeExportBlockedReasonKey)}
              isQuiet
              isDisabled={!isGcodeExportEnabled}
              onClick={() => dispatch(new GcodeExportRequested({ isWarningConfirmed: false }))}
            />
          )}
        />
        {!!lockReasonGroups.length && (
          // Always on screen, so a touch screen without hover still shows why the buttons above are locked.
          <ul className={styles.lockReasons} data-testid={JOB_LOCK_REASON_TEST_ID}>
            {lockReasonGroups.map(({ shortReasonKey, actions }: JobLockReasonGroup): ReactNode => (
              <li key={shortReasonKey} className={styles.lockReason}>
                {actions.map((action: JobLockAction): ReactNode => (
                  <span key={action} className={styles.lockAction}>
                    <span aria-hidden>{JOB_LOCK_ACTION_ICONS[action]}</span>
                    <span className={styles.lockActionLabel}>{t(JOB_LOCK_ACTION_LABEL_KEYS[action])}</span>
                  </span>
                ))}
                <LockFilled className={styles.lockIcon} aria-hidden />
                <span>{t(shortReasonKey)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
};
