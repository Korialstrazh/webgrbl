/**
 * Frame job: the grid and margin of the trace, how long it takes and at what power, and the button that starts it. A
 * frame that would leave the bed is off with the edge and distance, and an alarm during a frame is told here.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert, Button, Divider, Select, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_ALERT_TYPE_WARNING, ANTD_BUTTON_SIZE_LARGE } from '../../../../utils/antd.constants';
import {
  FRAME_DOT_WATTS,
  FRAME_EDGE,
  FRAME_GRID_CELL_NONE_MM,
  FRAME_GRID_CELL_OPTIONS_MM,
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
  selectFrameGridCellMm,
} from '../../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../../utils/states/new.store';
import { getJobEstimateText } from '../../../../utils/toolpath/get.job.estimate.text';
import { FrameMarginInput } from './FrameMarginInput';
import styles from './styles.module.scss';

const FRAME_GRID_SELECT_ID = 'frame-grid-select';

const FRAME_EDGE_TEXT_KEYS: Record<FrameEdge, string> = {
  [FRAME_EDGE.LEFT]: DEFAULT.FRAME_EDGE_LEFT,
  [FRAME_EDGE.RIGHT]: DEFAULT.FRAME_EDGE_RIGHT,
  [FRAME_EDGE.FRONT]: DEFAULT.FRAME_EDGE_FRONT,
  [FRAME_EDGE.BACK]: DEFAULT.FRAME_EDGE_BACK,
};

export const FrameControls = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const gridCellMm: number = useSelector(selectFrameGridCellMm);
  const rectangle: FrameRectangle | undefined = useSelector(selectFrameRectangle);
  const bedOverrun: FrameBedOverrun | undefined = useSelector(selectFrameBedOverrun);
  const blockedReasonKey: string | undefined = useSelector(selectFrameStartBlockedReasonKey);
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const latestRunKind: JobRunKind = useSelector(selectJobRunKind);
  const isFrameAlarmed: boolean = useSelector(selectIsFrameAlarmed);
  const isAlarmShown: boolean = isFrameAlarmed && latestRunKind === JOB_RUN_KIND.FRAME && !isJobRunActive;

  return (
    <div className={styles.frameControls}>
      <Divider className={styles.divider} />
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
              : t(DEFAULT.FRAME_GRID_CELL, { cellMm }),
          }))}
          onChange={(frameGridCellMm: number): void => {
            if (activeProfile) {
              dispatch(new MachineProfileSaved({ profile: { ...activeProfile, frameGridCellMm } }));
            }
          }}
        />
      </div>
      <FrameMarginInput isDisabled={isJobRunActive} />
      <dl className={styles.facts}>
        <dt>{t(DEFAULT.FRAME_TIME_LABEL)}</dt>
        <dd>
          {rectangle ? getJobEstimateText(t, getFrameDurationSeconds(rectangle, gridCellMm)) : MISSING_VALUE_TEXT}
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
      <Tooltip title={blockedReasonKey && t(blockedReasonKey)}>
        {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
        <span className={styles.fullWidthButtonWrapper}>
          <Button
            block
            size={ANTD_BUTTON_SIZE_LARGE}
            disabled={!!blockedReasonKey}
            onClick={() => dispatch(new FrameStartRequested())}
          >
            {t(DEFAULT.MACHINE_JOB_FRAME)}
          </Button>
        </span>
      </Tooltip>
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
