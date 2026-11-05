/**
 * Frame job: the button that starts the trace and a gear that opens its settings: the grid, margin and speed, how long
 * it takes and at what power. The settings start closed, as they rarely change. A frame that would leave the bed is
 * off with the edge and distance, and an alarm during a frame is told here.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SettingOutlined } from '@ant-design/icons';
import { Alert, Select } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_ALERT_TYPE_WARNING } from '../../../../utils/antd.constants';
import {
  FRAME_DOT_WATTS,
  FRAME_EDGE,
  FRAME_GRID_CELL_NONE_MM,
  FRAME_GRID_CELL_OPTIONS_MM,
  FRAME_MM_PER_CM,
} from '../../../../utils/frame/frame.constants';
import type { FrameEdge } from '../../../../utils/frame/frame.constants';
import { getFrameDurationSeconds } from '../../../../utils/frame/get.frame.duration.seconds';
import type { FrameBedOverrun } from '../../../../utils/frame/interfaces/FrameBedOverrun';
import type { FrameRectangle } from '../../../../utils/frame/interfaces/FrameRectangle';
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
import { FrameTraceIcon } from '../../../../views/FrameTraceIcon';
import { IconActionButton } from '../../../../views/IconActionButton';
import { FrameNumberInput } from './FrameNumberInput';
import styles from './styles.module.scss';

const FRAME_GRID_SELECT_ID = 'frame-grid-select';
const FRAME_MARGIN_FIELD = 'frameMarginMm';
const FRAME_MARGIN_INPUT_ID = 'frame-margin-input';
const FRAME_SPEED_FIELD = 'frameFeedMmPerMin';
const FRAME_SPEED_INPUT_ID = 'frame-speed-input';

const FRAME_EDGE_TEXT_KEYS: Record<FrameEdge, string> = {
  [FRAME_EDGE.LEFT]: DEFAULT.FRAME_EDGE_LEFT,
  [FRAME_EDGE.RIGHT]: DEFAULT.FRAME_EDGE_RIGHT,
  [FRAME_EDGE.FRONT]: DEFAULT.FRAME_EDGE_FRONT,
  [FRAME_EDGE.BACK]: DEFAULT.FRAME_EDGE_BACK,
};

interface FrameControlsProps {
  /** Start job, first in the row of job actions; absent where it is pinned elsewhere. */
  startActionComponent?: ReactNode;
  /** Export G-code, last in the row of job actions. */
  exportActionComponent?: ReactNode;
}

export const FrameControls = ({ startActionComponent, exportActionComponent }: FrameControlsProps): ReactNode => {
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

  return (
    <div className={styles.frameControls}>
      <div className={styles.actions}>
        {startActionComponent && <div className={styles.startAction}>{startActionComponent}</div>}
        {/* The gear is joined to Frame: it holds the settings of the frame, not of the job. */}
        <div className={styles.frameSplit}>
          <CaptionedActionButton
            labelText={t(DEFAULT.MACHINE_JOB_FRAME)}
            captionText={t(DEFAULT.MACHINE_JOB_FRAME_CAPTION)}
            iconComponent={<FrameTraceIcon />}
            blockedReasonText={blockedReasonKey && t(blockedReasonKey)}
            onClick={() => dispatch(new FrameStartRequested())}
          />
          <IconActionButton
            className={styles.frameGear}
            labelText={t(isSettingsOpen ? DEFAULT.FRAME_SETTINGS_HIDE : DEFAULT.FRAME_SETTINGS_SHOW)}
            iconComponent={<SettingOutlined />}
            aria-expanded={isSettingsOpen}
            aria-controls={settingsId}
            onClick={() => dispatch(new FrameSettingsOpenChanged({ isFrameSettingsOpen: !isSettingsOpen }))}
          />
        </div>
        <div className={styles.exportAction}>{exportActionComponent}</div>
      </div>
      {isSettingsOpen && (
        <div id={settingsId} className={styles.settings}>
          <div className={styles.field}>
            <label htmlFor={FRAME_GRID_SELECT_ID}>{t(DEFAULT.FRAME_GRID_LABEL)}</label>
            <Select<number>
              id={FRAME_GRID_SELECT_ID}
              disabled={!activeProfile || isJobRunActive}
              value={gridCellMm}
              options={FRAME_GRID_CELL_OPTIONS_MM.map((cellMm: number) => ({
                value: cellMm,
                label: cellMm === FRAME_GRID_CELL_NONE_MM
                  ? t(DEFAULT.FRAME_GRID_NONE)
                  : t(DEFAULT.FRAME_GRID_CELL, { cellCm: cellMm / FRAME_MM_PER_CM }),
              }))}
              onChange={(frameGridCellMm: number): void => {
                if (activeProfile) {
                  dispatch(new MachineProfileSaved({ profile: { ...activeProfile, frameGridCellMm } }));
                }
              }}
            />
          </div>
          <FrameNumberInput
            key={`${FRAME_MARGIN_FIELD}-${activeProfile?.id}`}
            field={FRAME_MARGIN_FIELD}
            inputId={FRAME_MARGIN_INPUT_ID}
            labelKey={DEFAULT.FRAME_MARGIN_LABEL}
            savedValue={marginMm}
            isDisabled={isJobRunActive}
          />
          <FrameNumberInput
            key={`${FRAME_SPEED_FIELD}-${activeProfile?.id}`}
            field={FRAME_SPEED_FIELD}
            inputId={FRAME_SPEED_INPUT_ID}
            labelKey={DEFAULT.FRAME_SPEED_LABEL}
            savedValue={feedMmPerMin}
            isDisabled={isJobRunActive}
          />
          <dl className={styles.facts}>
            <dt>{t(DEFAULT.FRAME_TIME_LABEL)}</dt>
            <dd>
              {rectangle
                ? getJobEstimateText(t, getFrameDurationSeconds(rectangle, gridCellMm, feedMmPerMin))
                : MISSING_VALUE_TEXT}
            </dd>
            <dt>{t(DEFAULT.FRAME_POWER_LABEL)}</dt>
            <dd>
              {activeProfile
                ? t(DEFAULT.FRAME_POWER_VALUE, {
                  watts: FRAME_DOT_WATTS,
                  profileName: activeProfile.name,
                  maxPowerWatts: activeProfile.maxPowerWatts,
                })
                : MISSING_VALUE_TEXT}
            </dd>
          </dl>
        </div>
      )}
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
