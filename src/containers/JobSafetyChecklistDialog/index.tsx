/**
 * The safety checklist every job start goes through: four reminders with looping pictures, the job it is about, and
 * one checkbox that unlocks Start. It replaces the plain confirmation. It is mounted once and opens when a start is
 * requested, so every Start button shares it; Start hands the same request on to the run, Cancel and Escape start
 * nothing. The app only reminds: it trusts the user's tick.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { WarningFilled } from '@ant-design/icons';
import { Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsOnBattery } from '../../utils/browser/get.is.on.battery';
import { MIDDLE_DOT } from '../../utils/characters.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import type { JobStartRequest } from '../../utils/states/interfaces/JobStartRequest';
import { selectJobStartBlockedReasonKey } from '../../utils/states/job.start.blocked.reason.selector';
import { JobStartRequested } from '../../utils/states/job.run.state';
import {
  JobSafetyChecklistClosed,
  selectJobSafetyChecklistRequest,
} from '../../utils/states/job.safety.checklist.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectEnabledProjectLayers, selectProjectLayers } from '../../utils/states/project.document.state';
import { selectProjectName } from '../../utils/states/project.state';
import { selectReadyToolpathTotalTimeS } from '../../utils/states/toolpath.timeline.selectors';
import { selectToolpath } from '../../utils/states/toolpath.state';
import { getJobEstimateText } from '../../utils/toolpath/get.job.estimate.text';
import { getJobSizeMm } from '../../utils/toolpath/get.job.size.mm';
import type { JobSizeMm } from '../../utils/toolpath/interfaces/JobSizeMm';
import { JobSizeText } from '../../views/JobSizeText';
import { SafetyReminderAnimation } from '../../views/SafetyReminderAnimation';
import type { SafetyReminder } from '../../views/SafetyReminderAnimation/interfaces/SafetyReminder';
import { SAFETY_REMINDERS } from '../../views/SafetyReminderAnimation/safety.reminder.constants';
import { AppModal } from '../AppModal';
import { getJobLayerCountText } from '../MachinePanel/JobCard/get.job.layer.count.text';
import { JOB_SAFETY_CHECKLIST_OVERLAY_ID, JOB_SAFETY_CHECKLIST_WIDTH } from './job.safety.checklist.dialog.constants';
import styles from './styles.module.scss';

const SUMMARY_SEPARATOR = ` ${MIDDLE_DOT} `;

export const JobSafetyChecklistDialog = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const request: JobStartRequest | undefined = useSelector(selectJobSafetyChecklistRequest);
  const jobStartBlockedReasonKey: string | undefined = useSelector(selectJobStartBlockedReasonKey);
  const projectName: string = useSelector(selectProjectName);
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const enabledLayers: ProjectLayer[] = useSelector(selectEnabledProjectLayers);
  const totalTimeS: number | undefined = useSelector(selectReadyToolpathTotalTimeS);
  const jobSize: JobSizeMm | undefined = getJobSizeMm(useSelector(selectToolpath)?.bounds);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isOnBattery, setIsOnBattery] = useState<boolean>(false);
  const isOpen: boolean = Boolean(request);

  // Every opening asks again: a tick from an earlier start must not unlock this one.
  useEffect(() => {
    if (!isOpen) {
      setIsConfirmed(false);
    }
  }, [isOpen]);

  // Checked once per opening: a long job on a dying battery is worth a word, an unknown battery is not.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let isCurrent = true;

    const checkBattery = async (): Promise<void> => {
      const isOnBatteryNow: boolean | undefined = await getIsOnBattery();

      if (isCurrent) {
        setIsOnBattery(isOnBatteryNow === true);
      }
    };

    void checkBattery();

    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

  // A checklist left open after the start got blocked would offer a button that does nothing.
  useEffect(() => {
    if (isOpen && jobStartBlockedReasonKey) {
      dispatch(new JobSafetyChecklistClosed());
    }
  }, [dispatch, isOpen, jobStartBlockedReasonKey]);

  const startJob = (): void => {
    if (!request) {
      return;
    }

    dispatch(new JobStartRequested(request));
    dispatch(new JobSafetyChecklistClosed());
  };

  const summaryParts: string[] = [
    t(DEFAULT.SAFETY_CHECKLIST_JOB, { name: projectName }),
    getJobLayerCountText(t, enabledLayers.length, layers.length - enabledLayers.length),
  ];

  // eslint-disable-next-line no-restricted-syntax -- 0 s is a real estimate, distinct from no toolpath
  if (totalTimeS !== undefined) {
    summaryParts.push(getJobEstimateText(t, totalTimeS));
  }

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={JOB_SAFETY_CHECKLIST_OVERLAY_ID}
      title={(
        <span className={styles.heading}>
          <span className={styles.warningIcon}><WarningFilled aria-hidden /></span>
          {t(DEFAULT.SAFETY_CHECKLIST_TITLE)}
        </span>
      )}
      okText={t(DEFAULT.SAFETY_CHECKLIST_START)}
      cancelText={t(DEFAULT.SAFETY_CHECKLIST_CANCEL)}
      okButtonProps={{
        danger: true,
        disabled: !isConfirmed,
        className: isConfirmed ? styles.startButtonReady : undefined,
      }}
      maxWidth={JOB_SAFETY_CHECKLIST_WIDTH}
      destroyOnHidden
      onOk={startJob}
      onClose={() => dispatch(new JobSafetyChecklistClosed())}
    >
      <div className={styles.hazardStripe} aria-hidden />
      <p className={styles.summary}>{summaryParts.join(SUMMARY_SEPARATOR)}</p>
      <JobSizeText size={jobSize} />
      {isOnBattery && <p className={styles.batteryHint} role="note">{t(DEFAULT.JOB_CHECKLIST_BATTERY_HINT)}</p>}
      <p className={styles.intro}>{t(DEFAULT.SAFETY_CHECKLIST_INTRO)}</p>
      <ul className={styles.reminderList} aria-label={t(DEFAULT.SAFETY_CHECKLIST_LIST_LABEL)}>
        {SAFETY_REMINDERS.map(({ kind, titleKey, hintKey }: SafetyReminder) => (
          <li key={kind} className={styles.reminder}>
            <SafetyReminderAnimation kind={kind} />
            <span className={styles.reminderText}>
              <span className={styles.reminderTitle}>{t(titleKey)}</span>
              <span className={styles.reminderHint}>{t(hintKey)}</span>
            </span>
          </li>
        ))}
      </ul>
      <Checkbox className={styles.confirmBox} checked={isConfirmed} onChange={() => setIsConfirmed(!isConfirmed)}>
        {t(DEFAULT.SAFETY_CHECKLIST_CONFIRM)}
      </Checkbox>
    </AppModal>
  );
};
