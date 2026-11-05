/**
 * The readiness row of the Job card: Profile, Design, Material and Connect as small icons with a live tick. Each one
 * goes to where it is set, and the first one still open is the one accent action on the screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ApiOutlined, BlockOutlined, CheckCircleFilled, ImportOutlined, ToolOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_PRIMARY, ANTD_BUTTON_TYPE_TEXT } from '../../../../utils/antd.constants';
import { BED_VIEW_MODE } from '../../../../utils/bed/bed.view.constants';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { BedViewModeChanged } from '../../../../utils/states/bed.view.state';
import {
  JOB_READINESS_STEP,
  selectFirstUnmetJobReadinessStep,
  selectIsJobReadinessStepMet,
} from '../../../../utils/states/job.readiness.selector';
import type { JobReadinessStep } from '../../../../utils/states/job.readiness.selector';
import type { AppDispatch } from '../../../../utils/states/new.store';
import { ConnectionPopoverOpenChanged } from '../../../../utils/states/ui.overlay.state';
import { MachineProfilesDialogOpenChanged, NarrowRegionChanged } from '../../../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../../../utils/states/workbench.region.constants';
import { DismissibleTooltip } from '../../../../views/DismissibleTooltip';
import { PROJECT_MATERIAL_SELECT_ID } from '../../../ProjectMaterialSelect/project.material.select.constants';
import { useSvgFilePicker } from '../../../SvgImportButton/use.svg.file.picker';
import styles from './styles.module.scss';

interface JobReadinessLook {
  step: JobReadinessStep;
  iconComponent: ReactNode;
  captionKey: string;
  hintKey: string;
}

const JOB_READINESS_LOOKS: readonly JobReadinessLook[] = [
  {
    step: JOB_READINESS_STEP.PROFILE,
    iconComponent: <ToolOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_PROFILE,
    hintKey: DEFAULT.JOB_READINESS_PROFILE_HINT,
  },
  {
    step: JOB_READINESS_STEP.DESIGN,
    iconComponent: <ImportOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_DESIGN,
    hintKey: DEFAULT.JOB_READINESS_DESIGN_HINT,
  },
  {
    step: JOB_READINESS_STEP.MATERIAL,
    iconComponent: <BlockOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_MATERIAL,
    hintKey: DEFAULT.JOB_READINESS_MATERIAL_HINT,
  },
  {
    step: JOB_READINESS_STEP.CONNECT,
    iconComponent: <ApiOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_CONNECT,
    hintKey: DEFAULT.JOB_READINESS_CONNECT_HINT,
  },
];

interface JobReadinessButtonProps extends JobReadinessLook {
  onGoToStep: (step: JobReadinessStep) => void;
}

const JobReadinessButton = (props: JobReadinessButtonProps): ReactNode => {
  const { step, iconComponent, captionKey, hintKey, onGoToStep } = props;
  const { t } = useTranslation();
  const isMet: boolean = useSelector(selectIsJobReadinessStepMet(step));
  const isNextStep: boolean = useSelector(selectFirstUnmetJobReadinessStep) === step;
  const captionText: string = t(captionKey);

  return (
    <DismissibleTooltip title={t(hintKey)}>
      <Button
        className={styles.step}
        type={isNextStep ? ANTD_BUTTON_TYPE_PRIMARY : ANTD_BUTTON_TYPE_TEXT}
        aria-label={t(isMet ? DEFAULT.JOB_READINESS_STEP_MET : DEFAULT.JOB_READINESS_STEP_OPEN, { step: captionText })}
        onClick={() => onGoToStep(step)}
      >
        <span className={styles.stepIcon}>
          {iconComponent}
          {isMet && <CheckCircleFilled className={styles.tick} aria-hidden />}
        </span>
        <span className={styles.caption}>{captionText}</span>
      </Button>
    </DismissibleTooltip>
  );
};

export const JobReadinessRow = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { openSvgFilePicker, fileInputComponent } = useSvgFilePicker();

  const goToMaterialSelect = (): void => {
    dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.DESIGN }));
    dispatch(new NarrowRegionChanged({ narrowRegion: WORKBENCH_REGION.DESIGN }));
    // The material card only renders in the Design view, so the select may appear with the next paint.
    requestAnimationFrame(() => {
      document.getElementById(PROJECT_MATERIAL_SELECT_ID)?.focus();
    });
  };

  const goToStep = (step: JobReadinessStep): void => {
    switch (step) {
    case JOB_READINESS_STEP.PROFILE:
      dispatch(new MachineProfilesDialogOpenChanged({ isMachineProfilesDialogOpen: true }));
      break;
    case JOB_READINESS_STEP.DESIGN:
      openSvgFilePicker();
      break;
    case JOB_READINESS_STEP.MATERIAL:
      goToMaterialSelect();
      break;
    default:
      dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }));
    }
  };

  return (
    <div className={styles.jobReadinessRow} role="group" aria-label={t(DEFAULT.JOB_READINESS_LABEL)}>
      {JOB_READINESS_LOOKS.map((look: JobReadinessLook) => (
        <JobReadinessButton key={look.step} {...look} onGoToStep={goToStep} />
      ))}
      {fileInputComponent}
    </div>
  );
};
