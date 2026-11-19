/**
 * Start job with its confirmation and guards, shared by the Job card and the pinned bar of the narrow layout. It is
 * filled in the accent colour only once it is the next thing to do.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PlayCircleFilled } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_DEFAULT, ANTD_BUTTON_TYPE_PRIMARY } from '../../utils/antd.constants';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectFirstUnmetJobReadinessStep } from '../../utils/states/job.readiness.selector';
import { JobStartRequested } from '../../utils/states/job.run.state';
import { selectJobStartBlockedReasonKey } from '../../utils/states/job.start.blocked.reason.selector';
import type { AppDispatch } from '../../utils/states/new.store';
import { CaptionedActionButton } from '../../views/CaptionedActionButton';

const JOB_START_CONFIRM_OVERLAY_ID = 'job-start-confirm';

export const JobStartButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const jobStartBlockedReasonKey: string | undefined = useSelector(selectJobStartBlockedReasonKey);
  const isReadinessComplete: boolean = !useSelector(selectFirstUnmetJobReadinessStep);
  const isStartTheNextAction: boolean = isReadinessComplete && !jobStartBlockedReasonKey;
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
      {/* The wrapper takes the trigger: the button inside it keeps its own tooltip. */}
      <span>
        <CaptionedActionButton
          type={isStartTheNextAction ? ANTD_BUTTON_TYPE_PRIMARY : ANTD_BUTTON_TYPE_DEFAULT}
          labelText={t(DEFAULT.MACHINE_START_JOB)}
          captionText={t(DEFAULT.MACHINE_START_JOB_CAPTION)}
          iconComponent={<PlayCircleFilled />}
          isLabelTooltipShown={false}
          blockedReasonText={jobStartBlockedReasonKey && t(jobStartBlockedReasonKey)}
        />
      </span>
    </Popconfirm>
  );
};
