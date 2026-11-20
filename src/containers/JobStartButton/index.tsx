/**
 * Start job, which opens the safety checklist, with its guards, shared by the Job card and the pinned bar of the
 * narrow layout. It is filled in
 * the accent colour only once it is the next thing to do.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PlayCircleFilled } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_DEFAULT, ANTD_BUTTON_TYPE_PRIMARY } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectFirstUnmetJobReadinessStep } from '../../utils/states/job.readiness.selector';
import { JobSafetyChecklistOpened } from '../../utils/states/job.safety.checklist.state';
import { selectJobStartBlockedReasonKey } from '../../utils/states/job.start.blocked.reason.selector';
import { JOB_START_REQUEST_KIND } from '../../utils/states/job.start.request.constants';
import type { AppDispatch } from '../../utils/states/new.store';
import { CaptionedActionButton } from '../../views/CaptionedActionButton';

export const JobStartButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const jobStartBlockedReasonKey: string | undefined = useSelector(selectJobStartBlockedReasonKey);
  const isReadinessComplete: boolean = !useSelector(selectFirstUnmetJobReadinessStep);
  const isStartTheNextAction: boolean = isReadinessComplete && !jobStartBlockedReasonKey;

  return (
    <CaptionedActionButton
      type={isStartTheNextAction ? ANTD_BUTTON_TYPE_PRIMARY : ANTD_BUTTON_TYPE_DEFAULT}
      labelText={t(DEFAULT.MACHINE_START_JOB)}
      captionText={t(DEFAULT.MACHINE_START_JOB_CAPTION)}
      iconComponent={<PlayCircleFilled />}
      isLabelTooltipShown={false}
      blockedReasonText={jobStartBlockedReasonKey && t(jobStartBlockedReasonKey)}
      onClick={() => dispatch(new JobSafetyChecklistOpened({ kind: JOB_START_REQUEST_KIND.FULL }))}
    />
  );
};
