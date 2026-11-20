/**
 * Offers to resume an interrupted job from about where it stopped, through the normal safety checklist. It asks to run
 * Frame job first and to leave the material alone, and warns on a laser without homing switches that the head must
 * be at exactly the same work zero, since nothing finds it again for it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { RedoOutlined, WarningOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import { getJobInterruptionSummary } from '../../../../utils/states/get.job.interruption.summary';
import type { JobResumeState } from '../../../../utils/states/interfaces/JobResumeState';
import { selectJobResumeBlockedReasonKey } from '../../../../utils/states/job.resume.blocked.reason.selector';
import { selectJobResume } from '../../../../utils/states/job.resume.state';
import { selectIsJobRunActive } from '../../../../utils/states/job.run.state';
import { JobSafetyChecklistOpened } from '../../../../utils/states/job.safety.checklist.state';
import { JOB_START_REQUEST_KIND } from '../../../../utils/states/job.start.request.constants';
import { selectActiveMachineProfile } from '../../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../../utils/states/new.store';
import { CaptionedActionButton } from '../../../../views/CaptionedActionButton';
import styles from './styles.module.scss';

const NO_PROGRESS_PERCENT = 0;
const NO_LAYER_NAMES: Record<string, string> = {};

export const JobResumeControls = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const resume: JobResumeState | undefined = useSelector(selectJobResume);
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const profile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const blockedReasonKey: string | undefined = useSelector(selectJobResumeBlockedReasonKey);

  const percent: number = useMemo(
    () => (resume && getJobInterruptionSummary(resume, NO_LAYER_NAMES)?.percent) ?? NO_PROGRESS_PERCENT,
    [resume],
  );

  if (!resume || isJobRunActive) {
    return null;
  }

  const hasHomingSwitches: boolean = Boolean(profile?.hasHomingSwitches);

  return (
    <section className={styles.resumeControls} aria-label={t(DEFAULT.JOB_RESUME_CAPTION)}>
      <CaptionedActionButton
        labelText={t(DEFAULT.JOB_RESUME_FROM, { percent })}
        captionText={t(DEFAULT.JOB_RESUME_CAPTION)}
        iconComponent={<RedoOutlined />}
        blockedReasonText={blockedReasonKey && t(blockedReasonKey)}
        onClick={() => dispatch(new JobSafetyChecklistOpened({ kind: JOB_START_REQUEST_KIND.RESUME }))}
      />
      <p className={styles.hint}>{t(DEFAULT.JOB_RESUME_FRAME_HINT)}</p>
      {!hasHomingSwitches && (
        <p className={styles.noHomingWarning} role="note">
          <WarningOutlined className={styles.warningIcon} aria-hidden />
          {t(DEFAULT.JOB_RESUME_NO_HOMING_WARNING)}
        </p>
      )}
    </section>
  );
};
