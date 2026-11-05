/**
 * The readiness stepper of the Job card: Profile, Design, Material and Connect joined by a line that leads to Start.
 * Each step goes to where it is set, a done step shows a large check, and the first one still open is outlined as next.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ApiOutlined, CheckOutlined, ImportOutlined } from '@ant-design/icons';
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
import { LaserMachineIcon } from '../../../../views/LaserMachineIcon';
import { MaterialSheetIcon } from '../../../../views/MaterialSheetIcon';
import { PROJECT_MATERIAL_SELECT_ID } from '../../../ProjectMaterialSelect/project.material.select.constants';
import { useSvgFilePicker } from '../../../SvgImportButton/use.svg.file.picker';
import styles from './styles.module.scss';

const ARIA_CURRENT_STEP = 'step';

interface JobReadinessLook {
  step: JobReadinessStep;
  iconComponent: ReactNode;
  captionKey: string;
  hintKey: string;
  /** The tooltip once the step is done, where the hint would ask for what has been done already. */
  metHintKey?: string;
  /** The label of the one action button while this is the current step. */
  actionKey: string;
}

const JOB_READINESS_LOOKS: readonly JobReadinessLook[] = [
  {
    step: JOB_READINESS_STEP.PROFILE,
    iconComponent: <LaserMachineIcon aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_PROFILE,
    hintKey: DEFAULT.JOB_READINESS_PROFILE_HINT,
    actionKey: DEFAULT.JOB_READINESS_PROFILE_ACTION,
  },
  {
    step: JOB_READINESS_STEP.DESIGN,
    iconComponent: <ImportOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_DESIGN,
    hintKey: DEFAULT.JOB_READINESS_DESIGN_HINT,
    metHintKey: DEFAULT.JOB_READINESS_DESIGN_MET_HINT,
    actionKey: DEFAULT.JOB_READINESS_DESIGN_ACTION,
  },
  {
    step: JOB_READINESS_STEP.MATERIAL,
    iconComponent: <MaterialSheetIcon aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_MATERIAL,
    hintKey: DEFAULT.JOB_READINESS_MATERIAL_HINT,
    actionKey: DEFAULT.JOB_READINESS_MATERIAL_ACTION,
  },
  {
    step: JOB_READINESS_STEP.CONNECT,
    iconComponent: <ApiOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_CONNECT,
    hintKey: DEFAULT.JOB_READINESS_CONNECT_HINT,
    actionKey: DEFAULT.JOB_READINESS_CONNECT_ACTION,
  },
];

interface JobReadinessButtonProps extends JobReadinessLook {
  onGoToStep: (step: JobReadinessStep) => void;
}

const JobReadinessButton = (props: JobReadinessButtonProps): ReactNode => {
  const { step, iconComponent, captionKey, hintKey, metHintKey, onGoToStep } = props;
  const { t } = useTranslation();
  const isMet: boolean = useSelector(selectIsJobReadinessStepMet(step));
  const isNextStep: boolean = useSelector(selectFirstUnmetJobReadinessStep) === step;
  const captionText: string = t(captionKey);

  const cellClassName: string = [
    styles.stepCell,
    isMet ? styles.metStep : undefined,
    isNextStep ? styles.nextStep : undefined,
  ].join(' ');

  return (
    <li className={cellClassName}>
      <DismissibleTooltip title={isNextStep ? undefined : t(isMet && metHintKey ? metHintKey : hintKey)}>
        <Button
          className={styles.step}
          type={ANTD_BUTTON_TYPE_TEXT}
          aria-label={t(
            isMet ? DEFAULT.JOB_READINESS_STEP_MET : DEFAULT.JOB_READINESS_STEP_OPEN,
            { step: captionText },
          )}
          aria-current={isNextStep ? ARIA_CURRENT_STEP : undefined}
          onClick={() => onGoToStep(step)}
        >
          <span className={styles.marker}>{isMet ? <CheckOutlined aria-hidden /> : iconComponent}</span>
          <span className={styles.caption}>{captionText}</span>
        </Button>
      </DismissibleTooltip>
    </li>
  );
};

export const JobReadinessRow = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { openSvgFilePicker, fileInputComponent } = useSvgFilePicker();
  const nextStep: JobReadinessStep | undefined = useSelector(selectFirstUnmetJobReadinessStep);
  const nextLook: JobReadinessLook | undefined =
    JOB_READINESS_LOOKS.find((look: JobReadinessLook): boolean => look.step === nextStep);

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
    <>
      <ol className={styles.jobReadinessRow} aria-label={t(DEFAULT.JOB_READINESS_LABEL)}>
        {JOB_READINESS_LOOKS.map((look: JobReadinessLook) => (
          <JobReadinessButton key={look.step} {...look} onGoToStep={goToStep} />
        ))}
      </ol>
      {nextLook && (
        <Button
          type={ANTD_BUTTON_TYPE_PRIMARY}
          block
          icon={nextLook.iconComponent}
          onClick={() => goToStep(nextLook.step)}
        >
          {t(nextLook.actionKey)}
        </Button>
      )}
      {fileInputComponent}
    </>
  );
};
