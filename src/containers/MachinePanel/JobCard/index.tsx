/**
 * The Job card: the layers that go to the laser, the time estimate and the job actions. Start job is the main
 * action, filled in the accent colour once it can run, and runs the job on the connected laser after a confirmation.
 * A readiness row says what is still open, and why Start job and Frame job are off sits in each button's lock dot and
 * description; the heading carries no unlabelled reason icon of its own. While Fix warnings shows, it sums up the
 * problems: its count and the Check step badge stand for them, so a lock dot whose reason is the warnings and the
 * frame overrun note step back (the note moves into the warnings list);
 * Export G-code is a quiet secondary action that gives its reason in a tooltip. Frame job, with its settings behind a
 * gear, traces the outline of the job. A chevron in the heading folds the card to one line, its facts and Start, so the
 * cards below come into view; the fold is remembered per viewer. The laser pointer row is the card's last row, folded
 * or not. After a job finished normally, the cut check hint shows under the facts until it is answered or closed.
 * After a job stopped early, a summary under the facts says where it stopped, with the offer to resume it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  BlockOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  DownloadOutlined,
  DownOutlined,
  ProfileOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';
import { useIsScreenKeptAwake } from '../../../utils/hooks/use.is.screen.kept.awake';
import { useGcodeExportAvailability } from '../../../utils/hooks/use.gcode.export.availability';
import { useJobStartBlockedReasonTexts } from '../../../utils/hooks/use.job.start.blocked.reason.texts';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { JOB_PAUSED_CONTROLS } from '../../../utils/states/job.pause.control.constants';
import type { JobPauseControl } from '../../../utils/states/job.pause.control.constants';
import { selectJobPauseControl } from '../../../utils/states/job.pause.control.selector';
import type { JobRunKind } from '../../../utils/states/job.run.kind.constants';
import {
  selectIsJobRunActive,
  selectJobRunKind,
  selectJobRunStatus,
} from '../../../utils/states/job.run.state';
import type { JobRunStatus } from '../../../utils/states/job.run.status.constants';
import { JobCardCollapsePreferenceChanged, selectIsJobCardCollapsed } from '../../../utils/states/app.preferences.state';
import { JOB_READINESS_STEP, selectFirstUnmetJobReadinessStep } from '../../../utils/states/job.readiness.selector';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectEnabledProjectLayers, selectProjectLayers } from '../../../utils/states/project.document.state';
import { GcodeExportRequested } from '../../../utils/states/toolpath.state';
import { selectReadyToolpathTotalTimeS } from '../../../utils/states/toolpath.timeline.selectors';
import { getJobEstimateText } from '../../../utils/toolpath/get.job.estimate.text';
import { ActionLockNote } from '../../../views/ActionLockNote';
import { CaptionedActionButton } from '../../../views/CaptionedActionButton';
import { IconActionButton } from '../../../views/IconActionButton';
import { Panel } from '../../../views/Panel';
import { TooltipNoteIcon } from '../../../views/TooltipNoteIcon';
import { JobCutCheckHint } from '../../JobCutCheckHint';
import { JobStartButton } from '../../JobStartButton';
import { FrameControls } from './FrameControls';
import { JobInterruptionSummary } from './JobInterruptionSummary';
import { JobPauseButton } from './JobPauseButton';
import { JobReadinessRow } from './JobReadinessRow';
import { JobResumeControls } from './JobResumeControls';
import { JobRunProgress } from './JobRunProgress';
import { LaserPointerRow } from './LaserPointerRow';
import { getJobLayerCountText } from './get.job.layer.count.text';
import { getJobRunStatusKey } from './get.job.run.status.key';
import { JOB_LOCK_NOTE_TEST_IDS } from './job.card.constants';
import { JOB_LOCK_ACTION } from './job.lock.action.constants';
import type { JobLockAction } from './job.lock.action.constants';
import styles from './styles.module.scss';
import { useJobLockNoteTexts } from './use.job.lock.note.texts';

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

  const lockNoteTexts: Partial<Record<JobLockAction, string>> = useJobLockNoteTexts();
  const getLockNoteText = (action: JobLockAction): string | undefined => lockNoteTexts[action];
  const startReasonTexts: string[] = useJobStartBlockedReasonTexts();
  const jobRunStatus: JobRunStatus = useSelector(selectJobRunStatus);
  const pauseControl: JobPauseControl = useSelector(selectJobPauseControl);
  const jobRunKind: JobRunKind = useSelector(selectJobRunKind);
  const jobRunStatusKey: string | undefined = getJobRunStatusKey(
    jobRunKind,
    jobRunStatus,
    JOB_PAUSED_CONTROLS.includes(pauseControl),
  );
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const isFixWarningsShown: boolean =
    useSelector(selectFirstUnmetJobReadinessStep) === JOB_READINESS_STEP.WARNINGS && !isJobRunActive;
  const isCollapsed: boolean = useSelector(selectIsJobCardCollapsed);
  const isScreenKeptAwake: boolean = useIsScreenKeptAwake();
  const bodyId: string = useId();

  const awakeNoteComponent: ReactNode = isJobRunActive && isScreenKeptAwake && (
    <p className={styles.awakeNote}>
      <DesktopOutlined aria-hidden />
      {t(DEFAULT.JOB_SCREEN_AWAKE_NOTE)}
    </p>
  );

  const factsComponent: ReactNode = (
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
      {/* A fixed-size slot that is always there, so a run starting or ending never reflows the facts or the
          buttons below: the status is a dot whose text opens on a hover, announced from a hidden live region. */}
      <div className={styles.fact}>
        <dt><span className={styles.factLabel}>{t(DEFAULT.JOB_RUN_STATUS_LABEL)}</span></dt>
        <dd className={styles.runStatus}>
          <span className={styles.factLabel} role="status">{jobRunStatusKey && t(jobRunStatusKey)}</span>
          {jobRunStatusKey && (
            <TooltipNoteIcon
              noteText={t(jobRunStatusKey)}
              iconComponent={<span className={styles.runStatusDot} />}
              isPointerOnly
            />
          )}
        </dd>
      </div>
    </dl>
  );

  return (
    <Panel
      iconComponent={<ProfileOutlined />}
      title={t(DEFAULT.MACHINE_START_JOB_TITLE)}
      headerActionComponent={(
        <span className={styles.headerActions}>
          <IconActionButton
            type={ANTD_BUTTON_TYPE_TEXT}
            size={ANTD_BUTTON_SIZE_SMALL}
            labelText={t(isCollapsed ? DEFAULT.MACHINE_JOB_EXPAND : DEFAULT.MACHINE_JOB_COLLAPSE)}
            iconComponent={isCollapsed ? <DownOutlined /> : <UpOutlined />}
            aria-expanded={!isCollapsed}
            aria-controls={bodyId}
            onClick={() => dispatch(new JobCardCollapsePreferenceChanged({ isJobCardCollapsed: !isCollapsed }))}
          />
        </span>
      )}
    >
      {isCollapsed ? (
        // Folded: the facts and Start on one line, with Pause and the progress while a job runs.
        <div id={bodyId} className={styles.jobCard}>
          <div className={styles.collapsedSummary}>
            {factsComponent}
            {isStartShown && (
              <span className={styles.collapsedStart}>
                <JobStartButton />
                <ActionLockNote
                  noteText={getLockNoteText(JOB_LOCK_ACTION.START)}
                  reasonTexts={startReasonTexts}
                  testId={JOB_LOCK_NOTE_TEST_IDS.START}
                />
              </span>
            )}
          </div>
          {isJobRunActive && <JobRunProgress />}
          {awakeNoteComponent}
          <JobInterruptionSummary />
          <JobResumeControls />
          <JobCutCheckHint />
          <JobPauseButton />
          <LaserPointerRow />
        </div>
      ) : (
        <div id={bodyId} className={styles.jobCard}>
          {factsComponent}
          {!isJobRunActive && <JobReadinessRow />}
          {isJobRunActive && <JobRunProgress />}
          {awakeNoteComponent}
          <JobInterruptionSummary />
          <JobResumeControls />
          <JobCutCheckHint />
          <JobPauseButton />
          <FrameControls
            startActionComponent={isStartShown ? <JobStartButton /> : undefined}
            startReasonTexts={startReasonTexts}
            isBedOverrunNoteShown={!isFixWarningsShown}
            lockNoteTexts={{
              [JOB_LOCK_ACTION.START]: getLockNoteText(JOB_LOCK_ACTION.START),
              [JOB_LOCK_ACTION.FRAME]: getLockNoteText(JOB_LOCK_ACTION.FRAME),
              [JOB_LOCK_ACTION.EXPORT]: getLockNoteText(JOB_LOCK_ACTION.EXPORT),
            }}
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
          <LaserPointerRow />
        </div>
      )}
    </Panel>
  );
};
