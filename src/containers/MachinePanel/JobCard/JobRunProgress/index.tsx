/**
 * The progress of the running job: a bar over the answered lines, and the time since it started.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Progress } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_PROGRESS_STATUS_NORMAL } from '../../../../utils/antd.constants';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { MILLISECONDS_PER_SECOND } from '../../../../utils/machine/machine.command.constants';
import { PERCENT_DIVISOR } from '../../../../utils/percent.constants';
import {
  selectJobRunAnsweredLineCount,
  selectJobRunStartedAtMs,
  selectJobRunTotalLineCount,
} from '../../../../utils/states/job.run.state';
import { getJobEstimateText } from '../../../../utils/toolpath/get.job.estimate.text';
import styles from './styles.module.scss';

const ELAPSED_REFRESH_MS = 1000;

export const JobRunProgress = (): ReactNode => {
  const { t } = useTranslation();
  const answeredLineCount: number = useSelector(selectJobRunAnsweredLineCount);
  const totalLineCount: number = useSelector(selectJobRunTotalLineCount);
  const startedAtMs: number = useSelector(selectJobRunStartedAtMs);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const percent: number = totalLineCount ? Math.floor((answeredLineCount / totalLineCount) * PERCENT_DIVISOR) : 0;

  useEffect(() => {
    const timerId: ReturnType<typeof setInterval> = setInterval(() => setNowMs(Date.now()), ELAPSED_REFRESH_MS);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className={styles.jobRunProgress}>
      {/* All lines answered only means buffered, so a full bar shows no success mark while the laser burns. */}
      <Progress percent={percent} status={ANTD_PROGRESS_STATUS_NORMAL} aria-label={t(DEFAULT.JOB_RUN_PROGRESS_LABEL)} />
      <p className={styles.detail}>
        {t(DEFAULT.JOB_RUN_PROGRESS_DETAIL, {
          answered: answeredLineCount,
          total: totalLineCount,
          elapsed: getJobEstimateText(t, Math.max(nowMs - startedAtMs, 0) / MILLISECONDS_PER_SECOND),
        })}
      </p>
    </div>
  );
};
