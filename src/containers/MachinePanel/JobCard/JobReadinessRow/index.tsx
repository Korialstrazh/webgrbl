/**
 * The readiness stepper of the Job card: Profile, Design, Material, Check and Connect joined by a line that leads to
 * Start. Check stays open while toolpath warnings lock Start job: its marker carries the warning count and its
 * next-step button opens the Toolpath view's warnings chip, so a connected card never reads ready while Start is off.
 * Once the laser is connected the steps shrink to small markers on one line beside the next-step button (their names
 * stay in the tooltips and labels), so the status and Move cards keep their room above Stop.
 * Each step goes to where it is set, a done step shows a large check, and the first required one still open is outlined
 * as next. An optional step (Material) that is still open shows a dashed marker and a small "optional"
 * caption under its name: Start does not wait for it.
 * The steps are one tab stop: the arrow keys, Home and End move between them (a roving tab index).
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
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
import { useConnectLaser } from '../../../../utils/hooks/use.connect.laser';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { BedViewModeChanged } from '../../../../utils/states/bed.view.state';
import {
  isJobReadinessStepOptional,
  JOB_READINESS_STEP,
  selectFirstUnmetJobReadinessStep,
  selectIsJobReadinessStepMet,
  selectJobReadinessWarningCount,
} from '../../../../utils/states/job.readiness.selector';
import type { JobReadinessStep } from '../../../../utils/states/job.readiness.selector';
import type { AppDispatch } from '../../../../utils/states/new.store';
import { MachineProfilesDialogOpenChanged, NarrowRegionChanged } from '../../../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../../../utils/states/workbench.region.constants';
import { KEYBOARD_FOCUSABLE_TAB_INDEX, SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../../../utils/tab.index.constants';
import { DismissibleTooltip } from '../../../../views/DismissibleTooltip';
import { BED_OBJECTS_LAYER_ID } from '../../../BedObjects/bed.objects.constants';
import { PROJECT_MATERIAL_SELECT_ID } from '../../../ProjectMaterialSelect/project.material.select.constants';
import { useSvgFilePicker } from '../../../SvgImportButton/use.svg.file.picker';
import { TOOLPATH_WARNINGS_CHIP_ID } from '../../../ToolpathWarningsPanel/toolpath.warnings.panel.constants';
import { POPOVER_KEEP_CLEAR_ATTRIBUTE } from '../../../../utils/layout.constants';
import type { JobReadinessLook } from './interfaces/JobReadinessLook';
import { JOB_READINESS_LOOKS } from './job.readiness.looks';
import { JOB_NEXT_STEP_BUTTON_ID } from './job.readiness.row.constants';
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
  const warningCount: number = useSelector(selectJobReadinessWarningCount);
  // Only the Check step counts something: its open marker carries the number of warnings left to fix.
  const openCount: number = !isMet && step === JOB_READINESS_STEP.WARNINGS ? warningCount : 0;
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
      <DismissibleTooltip
        title={isNextStep ? undefined : t(isMet && metHintKey ? metHintKey : openHintKey, { count: warningCount })}
      >
        <Button
          className={styles.step}
          type={ANTD_BUTTON_TYPE_TEXT}
          aria-label={t(
            isMet ? DEFAULT.JOB_READINESS_STEP_MET : openLabelKey,
            { step: captionText, count: openCount },
          )}
          aria-current={isNextStep ? ARIA_CURRENT_STEP : undefined}
          tabIndex={isTabStop ? KEYBOARD_FOCUSABLE_TAB_INDEX : SCRIPT_FOCUS_ONLY_TAB_INDEX}
          onFocus={() => onFocusStep(step)}
          onClick={() => onGoToStep(step)}
        >
          <span className={styles.marker}>
            {isMet ? <CheckOutlined aria-hidden /> : iconComponent}
            {!!openCount && <span className={styles.countBadge} aria-hidden>{openCount}</span>}
          </span>
          <span className={styles.caption}>{captionText}</span>
          {/* Said on screen, not only to a screen reader, so the open step never reads as a blocker. */}
          {isOptionalOpen && (
            <span className={styles.optionalCaption} aria-hidden>{t(DEFAULT.JOB_READINESS_STEP_OPTIONAL_CAPTION)}</span>
          )}
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
  const connectLaser: () => void = useConnectLaser();
  const nextStep: JobReadinessStep | undefined = useSelector(selectFirstUnmetJobReadinessStep);
  const warningCount: number = useSelector(selectJobReadinessWarningCount);
  // Every open step gets its accent next-step button, Import SVG on an empty project included.
  const nextLook: JobReadinessLook | undefined =
    JOB_READINESS_LOOKS.find((look: JobReadinessLook): boolean => look.step === nextStep);
  const listRef: RefObject<HTMLOListElement | null> = useRef<HTMLOListElement>(null);
  // The step last focused keeps the tab stop; until then it is the next step, or the first when all are done.
  const [focusedStep, setFocusedStep] = useState<JobReadinessStep | undefined>(undefined);
  const tabStopStep: JobReadinessStep | undefined = focusedStep ?? nextStep ?? JOB_READINESS_LOOKS[0]?.step;

  const previousNextStepRef: RefObject<JobReadinessStep | undefined> = useRef<JobReadinessStep | undefined>(nextStep);

  // After an import from the next-step button the button turns into the following step; focus moves on to the new
  // artwork on the bed, so the button does not hold the focus as if it were already chosen. A hidden bed (a narrow
  // layout showing the Job region) takes no focus, and the focus then stays where it was.
  useEffect(() => {
    const hasArtworkJustArrived: boolean =
      previousNextStepRef.current === JOB_READINESS_STEP.DESIGN && nextStep !== JOB_READINESS_STEP.DESIGN;

    previousNextStepRef.current = nextStep;

    if (hasArtworkJustArrived && document.activeElement?.id === JOB_NEXT_STEP_BUTTON_ID) {
      document.getElementById(BED_OBJECTS_LAYER_ID)?.focus({ preventScroll: true });
    }
  }, [nextStep]);

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

  const goToWarnings = (): void => {
    dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.TOOLPATH }));
    dispatch(new NarrowRegionChanged({ narrowRegion: WORKBENCH_REGION.BED }));
    // The chip only renders in the Toolpath view, so it may appear with the next paint; a click opens its list.
    requestAnimationFrame(() => {
      const warningsChip: HTMLElement | null = document.getElementById(TOOLPATH_WARNINGS_CHIP_ID);

      warningsChip?.focus();
      warningsChip?.click();
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
    case JOB_READINESS_STEP.WARNINGS:
      goToWarnings();
      break;
    default:
      // With a port already chosen this connects at once; with none it opens the connection popover.
      connectLaser();
    }
  };

  return (
    <div className={styles.readiness}>
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
          id={JOB_NEXT_STEP_BUTTON_ID}
          {...POPOVER_KEEP_CLEAR_PROPS}
          icon={nextLook.actionIconComponent ?? nextLook.iconComponent}
          onClick={() => goToStep(nextLook.step)}
        >
          {t(nextLook.actionKey, { count: warningCount })}
        </Button>
      )}
      {fileInputComponent}
    </div>
  );
};
