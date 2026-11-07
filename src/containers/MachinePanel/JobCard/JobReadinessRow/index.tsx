/**
 * The readiness stepper of the Job card: Profile, Design, Material and Connect joined by a line that leads to Start.
 * Each step goes to where it is set, a done step shows a large check, and the first required one still open is outlined
 * as next. An optional step (Material) that is still open shows a dashed marker: Start does not wait for it.
 * The steps are one tab stop: the arrow keys, Home and End move between them (a roving tab index).
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ApiOutlined, CheckOutlined, CloudUploadOutlined, ImportOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_PRIMARY, ANTD_BUTTON_TYPE_TEXT } from '../../../../utils/antd.constants';
import { BED_VIEW_MODE } from '../../../../utils/bed/bed.view.constants';
import {
  ARROW_DOWN_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  END_KEY,
  HOME_KEY,
} from '../../../../utils/browser/browser.events.constants';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { BedViewModeChanged } from '../../../../utils/states/bed.view.state';
import {
  isJobReadinessStepOptional,
  JOB_READINESS_STEP,
  selectFirstUnmetJobReadinessStep,
  selectIsJobReadinessStepMet,
} from '../../../../utils/states/job.readiness.selector';
import type { JobReadinessStep } from '../../../../utils/states/job.readiness.selector';
import type { AppDispatch } from '../../../../utils/states/new.store';
import { ConnectionPopoverOpenChanged } from '../../../../utils/states/ui.overlay.state';
import { MachineProfilesDialogOpenChanged, NarrowRegionChanged } from '../../../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../../../utils/states/workbench.region.constants';
import { KEYBOARD_FOCUSABLE_TAB_INDEX, SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../../../utils/tab.index.constants';
import { DismissibleTooltip } from '../../../../views/DismissibleTooltip';
import { LaserMachineIcon } from '../../../../views/LaserMachineIcon';
import { MaterialSheetIcon } from '../../../../views/MaterialSheetIcon';
import { PROJECT_MATERIAL_SELECT_ID } from '../../../ProjectMaterialSelect/project.material.select.constants';
import { useSvgFilePicker } from '../../../SvgImportButton/use.svg.file.picker';
import { POPOVER_KEEP_CLEAR_ATTRIBUTE } from '../../../../utils/layout.constants';
import styles from './styles.module.scss';

const ARIA_CURRENT_STEP = 'step';
const STEP_BUTTON_SELECTOR = 'button';
const PREVIOUS_STEP_KEYS: readonly string[] = [ARROW_LEFT_KEY, ARROW_UP_KEY];
const NEXT_STEP_KEYS: readonly string[] = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY];

/** The index of the step a roving key moves to, or undefined for a key that does not move. */
const getMovedStepIndex = (key: string, index: number, count: number): number | undefined => {
  if (PREVIOUS_STEP_KEYS.includes(key)) {
    return (index - 1 + count) % count;
  }

  if (NEXT_STEP_KEYS.includes(key)) {
    return (index + 1) % count;
  }

  if (key === HOME_KEY) {
    return 0;
  }

  return key === END_KEY ? count - 1 : undefined;
};

interface JobReadinessLook {
  step: JobReadinessStep;
  iconComponent: ReactNode;
  captionKey: string;
  hintKey: string;
  /** The tooltip while an optional step is open, which says Start does not need it. */
  optionalHintKey?: string;
  /** The tooltip once the step is done, where the hint would ask for what has been done already. */
  metHintKey?: string;
  /** The label of the one action button while this is the current step. */
  actionKey: string;
  /** The icon of the action button, when it differs from the step icon. */
  actionIconComponent?: ReactNode;
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
    actionIconComponent: <CloudUploadOutlined aria-hidden />,
  },
  {
    step: JOB_READINESS_STEP.MATERIAL,
    iconComponent: <MaterialSheetIcon aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_MATERIAL,
    hintKey: DEFAULT.JOB_READINESS_MATERIAL_HINT,
    optionalHintKey: DEFAULT.JOB_READINESS_MATERIAL_OPTIONAL_HINT,
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
  /** Whether this step holds the one tab stop of the row. */
  isTabStop: boolean;
  onGoToStep: (step: JobReadinessStep) => void;
  onFocusStep: (step: JobReadinessStep) => void;
}

const JobReadinessButton = (props: JobReadinessButtonProps): ReactNode => {
  const { step, iconComponent, captionKey, hintKey, optionalHintKey, metHintKey, isTabStop, onGoToStep, onFocusStep } =
    props;
  const { t } = useTranslation();
  const isMet: boolean = useSelector(selectIsJobReadinessStepMet(step));
  const isNextStep: boolean = useSelector(selectFirstUnmetJobReadinessStep) === step;
  const isOptionalOpen: boolean = !isMet && isJobReadinessStepOptional(step);
  const captionText: string = t(captionKey);
  const openHintKey: string = isOptionalOpen && optionalHintKey ? optionalHintKey : hintKey;
  const openLabelKey: string = isOptionalOpen ? DEFAULT.JOB_READINESS_STEP_OPTIONAL : DEFAULT.JOB_READINESS_STEP_OPEN;

  const cellClassName: string = [
    styles.stepCell,
    isMet ? styles.metStep : undefined,
    isNextStep ? styles.nextStep : undefined,
    isOptionalOpen ? styles.optionalStep : undefined,
  ].join(' ');

  return (
    <li className={cellClassName}>
      <DismissibleTooltip title={isNextStep ? undefined : t(isMet && metHintKey ? metHintKey : openHintKey)}>
        <Button
          className={styles.step}
          type={ANTD_BUTTON_TYPE_TEXT}
          aria-label={t(
            isMet ? DEFAULT.JOB_READINESS_STEP_MET : openLabelKey,
            { step: captionText },
          )}
          aria-current={isNextStep ? ARIA_CURRENT_STEP : undefined}
          tabIndex={isTabStop ? KEYBOARD_FOCUSABLE_TAB_INDEX : SCRIPT_FOCUS_ONLY_TAB_INDEX}
          onFocus={() => onFocusStep(step)}
          onClick={() => onGoToStep(step)}
        >
          <span className={styles.marker}>{isMet ? <CheckOutlined aria-hidden /> : iconComponent}</span>
          <span className={styles.caption}>{captionText}</span>
        </Button>
      </DismissibleTooltip>
    </li>
  );
};

// The steps and the next-step button stay in sight: the connection and frame popovers open clear of them.
const POPOVER_KEEP_CLEAR_PROPS: Record<string, string> = { [POPOVER_KEEP_CLEAR_ATTRIBUTE]: '' };

export const JobReadinessRow = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { openSvgFilePicker, fileInputComponent } = useSvgFilePicker();
  const nextStep: JobReadinessStep | undefined = useSelector(selectFirstUnmetJobReadinessStep);
  const nextLook: JobReadinessLook | undefined =
    JOB_READINESS_LOOKS.find((look: JobReadinessLook): boolean => look.step === nextStep);
  const listRef: RefObject<HTMLOListElement | null> = useRef<HTMLOListElement>(null);
  // The step last focused keeps the tab stop; until then it is the next step, or the first when all are done.
  const [focusedStep, setFocusedStep] = useState<JobReadinessStep | undefined>(undefined);
  const tabStopStep: JobReadinessStep | undefined = focusedStep ?? nextStep ?? JOB_READINESS_LOOKS[0]?.step;

  const handleRowKeyDown = (keyEvent: KeyboardEvent<HTMLOListElement>): void => {
    const stepButtons: HTMLButtonElement[] = [
      ...(listRef.current?.querySelectorAll<HTMLButtonElement>(STEP_BUTTON_SELECTOR) ?? []),
    ];
    const currentIndex: number = stepButtons.findIndex(
      (stepButton: HTMLButtonElement): boolean => stepButton === document.activeElement,
    );
    const movedIndex: number | undefined = currentIndex < 0
      ? undefined
      : getMovedStepIndex(keyEvent.key, currentIndex, stepButtons.length);

    // eslint-disable-next-line no-restricted-syntax -- index 0 (the first step) is a real move, distinct from none
    if (movedIndex !== undefined) {
      keyEvent.preventDefault();
      stepButtons[movedIndex]?.focus();
    }
  };

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
      // The same file picker as Import SVG in the top bar, so the next step adds artwork in one click.
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
      <ol
        ref={listRef}
        className={styles.jobReadinessRow}
        {...POPOVER_KEEP_CLEAR_PROPS}
        aria-label={t(DEFAULT.JOB_READINESS_LABEL)}
        onKeyDown={handleRowKeyDown}
      >
        {JOB_READINESS_LOOKS.map((look: JobReadinessLook) => (
          <JobReadinessButton
            key={look.step}
            {...look}
            isTabStop={look.step === tabStopStep}
            onGoToStep={goToStep}
            onFocusStep={setFocusedStep}
          />
        ))}
      </ol>
      {nextLook && (
        <Button
          type={ANTD_BUTTON_TYPE_PRIMARY}
          block
          {...POPOVER_KEEP_CLEAR_PROPS}
          icon={nextLook.actionIconComponent ?? nextLook.iconComponent}
          onClick={() => goToStep(nextLook.step)}
        >
          {t(nextLook.actionKey)}
        </Button>
      )}
      {fileInputComponent}
    </>
  );
};
