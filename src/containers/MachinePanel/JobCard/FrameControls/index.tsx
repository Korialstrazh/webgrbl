/**
 * Frame job: the button that starts the trace and a gear that opens its settings in a popover: the grid, margin and
 * speed, how long it takes and at what power. Changing them only edits the active profile and sends nothing to the
 * laser, so they work while disconnected; the popover says why they are off without a profile or during a run. A frame
 * that would leave the bed is off with the edge and distance, and an alarm during a frame is told here.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BorderlessTableOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  RadiusSettingOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Alert, Popover, Select, Tooltip } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_ALERT_TYPE_WARNING,
  ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT,
  ANTD_POPOVER_TRIGGER_CLICK,
} from '../../../../utils/antd.constants';
import {
  FRAME_DOT_WATTS,
  FRAME_GRID_CELL_NONE_MM,
  FRAME_GRID_CELL_OPTIONS_MM,
  FRAME_MM_PER_CM,
} from '../../../../utils/frame/frame.constants';
import { getFrameDurationSeconds } from '../../../../utils/frame/get.frame.duration.seconds';
import type { FrameBedOverrun } from '../../../../utils/frame/interfaces/FrameBedOverrun';
import type { FrameRectangle } from '../../../../utils/frame/interfaces/FrameRectangle';
import { useOverlayRegistration } from '../../../../utils/hooks/use.overlay.registration';
import { usePopoverCloseOnDialogOpen } from '../../../../utils/hooks/use.popover.close.on.dialog.open';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../../utils/missing.value.constants';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import {
  selectFrameBedOverrun,
  selectFrameRectangle,
  selectFrameStartBlockedReasonKey,
} from '../../../../utils/states/frame.start.blocked.reason.selector';
import { JOB_RUN_KIND } from '../../../../utils/states/job.run.kind.constants';
import type { JobRunKind } from '../../../../utils/states/job.run.kind.constants';
import {
  FrameStartRequested,
  selectIsFrameAlarmed,
  selectIsJobRunActive,
  selectJobRunKind,
} from '../../../../utils/states/job.run.state';
import {
  MachineProfileSaved,
  selectActiveMachineProfile,
  selectFrameFeedMmPerMin,
  selectFrameGridCellMm,
  selectFrameMarginMm,
} from '../../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../../utils/states/new.store';
import { FrameSettingsOpenChanged, selectIsFrameSettingsOpen } from '../../../../utils/states/ui.workbench.state';
import { getJobEstimateText } from '../../../../utils/toolpath/get.job.estimate.text';
import { CaptionedActionButton } from '../../../../views/CaptionedActionButton';
import { ActionLockNote } from '../../../../views/ActionLockNote';
import { FrameTraceIcon } from '../../../../views/FrameTraceIcon';
import { IconActionButton } from '../../../../views/IconActionButton';
import { JOB_LOCK_NOTE_TEST_IDS } from '../job.card.constants';
import { JOB_LOCK_ACTION } from '../job.lock.action.constants';
import type { JobLockAction } from '../job.lock.action.constants';
import { FRAME_EDGE_TEXT_KEYS } from './frame.controls.constants';
import { FrameNumberInput } from './FrameNumberInput';
import { getFrameSettingsOffReasonKey } from './get.frame.settings.off.reason.key';
import styles from './styles.module.scss';

const FRAME_SETTINGS_OVERLAY_ID = 'frame-settings';
const FRAME_GRID_SELECT_ID = 'frame-grid-select';
const FRAME_MARGIN_FIELD = 'frameMarginMm';
const FRAME_MARGIN_INPUT_ID = 'frame-margin-input';
const FRAME_SPEED_FIELD = 'frameFeedMmPerMin';
const FRAME_SPEED_INPUT_ID = 'frame-speed-input';

interface FrameControlsProps {
  /** Start job, first in the row of job actions; absent where it is pinned elsewhere. */
  startActionComponent?: ReactNode;
  /** Export G-code, last in the row of job actions. */
  exportActionComponent?: ReactNode;
  /** A few words under each locked action on why it is off. */
  lockNoteTexts?: Partial<Record<JobLockAction, string>>;
}

export const FrameControls = (props: FrameControlsProps): ReactNode => {
  const { startActionComponent, exportActionComponent, lockNoteTexts = {} }: FrameControlsProps = props;
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const gridCellMm: number = useSelector(selectFrameGridCellMm);
  const marginMm: number = useSelector(selectFrameMarginMm);
  const feedMmPerMin: number = useSelector(selectFrameFeedMmPerMin);
  const rectangle: FrameRectangle | undefined = useSelector(selectFrameRectangle);
  const bedOverrun: FrameBedOverrun | undefined = useSelector(selectFrameBedOverrun);
  const blockedReasonKey: string | undefined = useSelector(selectFrameStartBlockedReasonKey);
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const latestRunKind: JobRunKind = useSelector(selectJobRunKind);
  const isFrameAlarmed: boolean = useSelector(selectIsFrameAlarmed);
  const isSettingsOpen: boolean = useSelector(selectIsFrameSettingsOpen);
  const settingsId: string = useId();
  const isAlarmShown: boolean = isFrameAlarmed && latestRunKind === JOB_RUN_KIND.FRAME && !isJobRunActive;
  const settingsOffReasonKey: string | undefined = getFrameSettingsOffReasonKey(Boolean(activeProfile), isJobRunActive);

  // Escape must only close the settings here, not also stop the machine.
  useOverlayRegistration(FRAME_SETTINGS_OVERLAY_ID, isSettingsOpen);

  const changeSettingsOpen = (isFrameSettingsOpen: boolean): void => {
    dispatch(new FrameSettingsOpenChanged({ isFrameSettingsOpen }));
  };

  usePopoverCloseOnDialogOpen(isSettingsOpen, () => changeSettingsOpen(false));

  const settingsComponent: ReactNode = (
    <div id={settingsId} className={styles.settings}>
      {settingsOffReasonKey && (
        <p className={styles.offReason}>
          <InfoCircleOutlined aria-hidden />
          {t(settingsOffReasonKey)}
        </p>
      )}
      {activeProfile && (
        <>
          <div className={styles.field}>
            <label className={styles.hiddenLabel} htmlFor={FRAME_GRID_SELECT_ID}>{t(DEFAULT.FRAME_GRID_LABEL)}</label>
            <Tooltip title={t(DEFAULT.FRAME_GRID_LABEL)}>
              <Select<number>
                id={FRAME_GRID_SELECT_ID}
                prefix={<BorderlessTableOutlined aria-hidden />}
                disabled={!activeProfile || isJobRunActive}
                value={gridCellMm}
                options={FRAME_GRID_CELL_OPTIONS_MM.map((cellMm: number) => ({
                  value: cellMm,
                  label: cellMm === FRAME_GRID_CELL_NONE_MM
                    ? t(DEFAULT.FRAME_GRID_NONE)
                    : t(DEFAULT.FRAME_GRID_CELL, { cellCm: cellMm / FRAME_MM_PER_CM }),
                }))}
                // Above the popover, which the default container would draw it under when both are in the body.
                getPopupContainer={(triggerNode: HTMLElement): HTMLElement => triggerNode.parentElement ?? triggerNode}
                onChange={(frameGridCellMm: number): void => {
                  if (activeProfile) {
                    dispatch(new MachineProfileSaved({ profile: { ...activeProfile, frameGridCellMm } }));
                  }
                }}
              />
            </Tooltip>
          </div>
          <FrameNumberInput
            key={`${FRAME_MARGIN_FIELD}-${activeProfile?.id}`}
            field={FRAME_MARGIN_FIELD}
            inputId={FRAME_MARGIN_INPUT_ID}
            labelKey={DEFAULT.FRAME_MARGIN_LABEL}
            iconComponent={<RadiusSettingOutlined />}
            captionKey={DEFAULT.FRAME_MARGIN_CAPTION}
            unitKey={DEFAULT.FIELD_UNIT_MM}
            savedValue={marginMm}
            isDisabled={isJobRunActive}
          />
          <FrameNumberInput
            key={`${FRAME_SPEED_FIELD}-${activeProfile?.id}`}
            field={FRAME_SPEED_FIELD}
            inputId={FRAME_SPEED_INPUT_ID}
            labelKey={DEFAULT.FRAME_SPEED_LABEL}
            iconComponent={<DashboardOutlined />}
            captionKey={DEFAULT.FRAME_SPEED_CAPTION}
            unitKey={DEFAULT.FIELD_UNIT_MM_PER_MIN}
            savedValue={feedMmPerMin}
            isDisabled={isJobRunActive}
          />
          <dl className={styles.facts}>
            <dt><ClockCircleOutlined aria-hidden /> {t(DEFAULT.FRAME_TIME_LABEL)}</dt>
            <dd>
              {rectangle
                ? getJobEstimateText(t, getFrameDurationSeconds(rectangle, gridCellMm, feedMmPerMin))
                : MISSING_VALUE_TEXT}
            </dd>
            <dt><ThunderboltOutlined aria-hidden /> {t(DEFAULT.FRAME_POWER_LABEL)}</dt>
            <dd>
              {activeProfile ? (
                <Tooltip
                  title={t(DEFAULT.FRAME_POWER_DETAIL, {
                    profileName: activeProfile.name,
                    maxPowerWatts: activeProfile.maxPowerWatts,
                  })}
                >
                  <span className={styles.powerValue} tabIndex={0}>
                    {t(DEFAULT.FRAME_POWER_VALUE, { watts: FRAME_DOT_WATTS })}
                    <InfoCircleOutlined aria-hidden />
                  </span>
                </Tooltip>
              ) : MISSING_VALUE_TEXT}
            </dd>
          </dl>
        </>
      )}
    </div>
  );

  return (
    <div className={styles.frameControls}>
      <div className={styles.actions}>
        {startActionComponent && (
          <div className={styles.startAction}>
            {startActionComponent}
            <ActionLockNote noteText={lockNoteTexts[JOB_LOCK_ACTION.START]} testId={JOB_LOCK_NOTE_TEST_IDS.START} />
          </div>
        )}
        <div className={styles.frameColumn}>
          {/* The gear is joined to Frame: it holds the settings of the frame, not of the job. */}
          <div className={styles.frameSplit}>
            <CaptionedActionButton
              labelText={t(DEFAULT.MACHINE_JOB_FRAME)}
              captionText={t(DEFAULT.MACHINE_JOB_FRAME_CAPTION)}
              iconComponent={<FrameTraceIcon />}
              blockedReasonText={blockedReasonKey && t(
                blockedReasonKey === DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED
                  ? DEFAULT.FRAME_START_BLOCKED_NOT_CONNECTED
                  : blockedReasonKey,
              )}
              onClick={() => dispatch(new FrameStartRequested())}
            />
            <Popover
              open={isSettingsOpen}
              trigger={ANTD_POPOVER_TRIGGER_CLICK}
              // Below the gear, right-aligned to it: clear of the Job steps and the next-step button above it.
              placement={ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT}
              arrow={{ pointAtCenter: true }}
              rootClassName={styles.frameSettingsRoot}
              title={t(DEFAULT.FRAME_SETTINGS_TITLE)}
              content={settingsComponent}
              onOpenChange={changeSettingsOpen}
            >
              <span>
                <IconActionButton
                  className={styles.frameGear}
                  labelText={t(isSettingsOpen ? DEFAULT.FRAME_SETTINGS_HIDE : DEFAULT.FRAME_SETTINGS_SHOW)}
                  iconComponent={<SettingOutlined />}
                  aria-expanded={isSettingsOpen}
                  aria-controls={isSettingsOpen ? settingsId : undefined}
                />
              </span>
            </Popover>
          </div>
          <ActionLockNote noteText={lockNoteTexts[JOB_LOCK_ACTION.FRAME]} testId={JOB_LOCK_NOTE_TEST_IDS.FRAME} />
        </div>
        <div className={styles.exportAction}>
          {exportActionComponent}
          <ActionLockNote noteText={lockNoteTexts[JOB_LOCK_ACTION.EXPORT]} testId={JOB_LOCK_NOTE_TEST_IDS.EXPORT} />
        </div>
      </div>
      {bedOverrun && (
        <Alert
          type={ANTD_ALERT_TYPE_WARNING}
          title={t(DEFAULT.FRAME_BED_OVERRUN, {
            distanceMm: Math.ceil(bedOverrun.distanceMm),
            edge: t(FRAME_EDGE_TEXT_KEYS[bedOverrun.edge]),
          })}
        />
      )}
      {isAlarmShown && <Alert type={ANTD_ALERT_TYPE_WARNING} title={t(DEFAULT.FRAME_ALARMED)} />}
    </div>
  );
};
