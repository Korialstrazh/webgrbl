/**
 * Pause or Resume for the running job, off with the reason when the machine cannot do it now.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE } from '../../../../utils/antd.constants';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { JOB_PAUSED_CONTROLS, JOB_PAUSE_CONTROL } from '../../../../utils/states/job.pause.control.constants';
import type { JobPauseControl } from '../../../../utils/states/job.pause.control.constants';
import { selectJobPauseControl } from '../../../../utils/states/job.pause.control.selector';
import { JobPauseRequested, JobResumeRequested } from '../../../../utils/states/job.run.state';
import type { AppDispatch } from '../../../../utils/states/new.store';
import styles from './styles.module.scss';

const BLOCKED_REASON_KEYS: Partial<Record<JobPauseControl, string>> = {
  [JOB_PAUSE_CONTROL.PAUSE_BLOCKED]: DEFAULT.JOB_PAUSE_BLOCKED_LASER_MODE,
  [JOB_PAUSE_CONTROL.RESUME_WAITING]: DEFAULT.JOB_RESUME_WAITING,
};

export const JobPauseButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const pauseControl: JobPauseControl = useSelector(selectJobPauseControl);
  const blockedReasonKey: string | undefined = BLOCKED_REASON_KEYS[pauseControl];
  const isResumeShown: boolean = JOB_PAUSED_CONTROLS.includes(pauseControl);

  if (pauseControl === JOB_PAUSE_CONTROL.HIDDEN) {
    return null;
  }

  return (
    <Tooltip title={blockedReasonKey && t(blockedReasonKey)}>
      {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
      <span className={styles.wrapper}>
        <Button
          block
          size={ANTD_BUTTON_SIZE_LARGE}
          disabled={!!blockedReasonKey}
          onClick={() => dispatch(isResumeShown ? new JobResumeRequested() : new JobPauseRequested())}
        >
          {t(isResumeShown ? DEFAULT.JOB_RESUME : DEFAULT.JOB_PAUSE)}
        </Button>
      </span>
    </Tooltip>
  );
};
