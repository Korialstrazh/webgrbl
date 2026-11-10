/**
 * The bar pinned to the bottom of a narrow window so STOP stays within reach. Start here carries the same lock dot as
 * on the Job card, with its short reason behind it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectJobStartBlockedReasonKey } from '../../utils/states/job.start.blocked.reason.selector';
import { selectIsAnyDialogOpen } from '../../utils/states/ui.overlay.state';
import { useJobStartBlockedReasonTexts } from '../../utils/hooks/use.job.start.blocked.reason.texts';
import { ActionLockNote } from '../../views/ActionLockNote';
import { JobStartButton } from '../JobStartButton';
import { getJobLockShortReasonKeys } from '../MachinePanel/JobCard/get.job.lock.short.reason.keys';
import { JOB_LOCK_NOTE_TEST_IDS } from '../MachinePanel/JobCard/job.card.constants';
import { JOB_LOCK_ACTION } from '../MachinePanel/JobCard/job.lock.action.constants';
import { StopButton } from '../StopButton';
import { StopSettingsButton } from '../StopSettingsButton';
import styles from './styles.module.scss';

export const StickyStopBar = (): ReactNode => {
  // STOP sits above every dialog for safety; the other actions of the bar must not reach past an open dialog.
  const isAnyDialogOpen: boolean = useSelector(selectIsAnyDialogOpen);
  const { t } = useTranslation();
  const jobStartBlockedReasonKey: string | undefined = useSelector(selectJobStartBlockedReasonKey);
  const startShortReasonKey: string | undefined = getJobLockShortReasonKeys([
    { action: JOB_LOCK_ACTION.START, blockedReasonKey: jobStartBlockedReasonKey },
  ])[JOB_LOCK_ACTION.START];

  const startReasonTexts: string[] = useJobStartBlockedReasonTexts();

  return (
    <div className={styles.stickyStopBar}>
      <div className={styles.start} inert={isAnyDialogOpen}>
        <JobStartButton />
        <ActionLockNote
          noteText={startShortReasonKey && t(startShortReasonKey)}
          testId={JOB_LOCK_NOTE_TEST_IDS.START}
          reasonTexts={startReasonTexts}
        />
      </div>
      <StopButton />
      <div className={styles.settings} inert={isAnyDialogOpen}><StopSettingsButton /></div>
    </div>
  );
};
