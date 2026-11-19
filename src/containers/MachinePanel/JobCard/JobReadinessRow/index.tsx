/**
 * The readiness stepper of the Job card, an antd Steps row: Profile, Design, Material, Check and Connect joined by its
 * rail, with each name under its marker. A click on a name does what its marker does. Check stays open while toolpath
 * warnings lock Start job: its marker carries the warning count as an antd Badge and its next-step button opens the
 * Toolpath view's warnings chip, so a connected card never reads ready while Start is off. The names stay visible once
 * the laser is connected; the row is kept short so Move fits above Stop. Each step goes to where it is set, a done step
 * shows a large check, and the first required one still open is outlined as next. An optional step (Material) that is
 * still open shows a dashed marker and a small hollow ring after its name, on the same line: Start does not wait for
 * it. Every step with something to do is its own tab stop: Profile, Design and Material always open where they are set,
 * Check and Connect only while open. A done Check or Connect has nothing to open, so it leaves the tab order and states
 * that it is done through its label and aria-disabled. The arrow keys, Home and End also move between the steps.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Button, Steps } from 'antd';
import type { StepsProps } from 'antd';
import { useEffect, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_SEGMENTED_ITEM_SELECTOR,
  ANTD_STEPS_SIZE_SMALL,
  ANTD_STEPS_STATUS,
  ANTD_STEPS_TITLE_PLACEMENT_VERTICAL,
} from '../../../../utils/antd.constants';
import { BED_VIEW_MODE } from '../../../../utils/bed/bed.view.constants';
import {
  ARROW_DOWN_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  END_KEY,
  HOME_KEY,
} from '../../../../utils/browser/browser.events.constants';
import { flashAttentionHighlight } from '../../../../utils/browser/flash.attention.highlight';
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
import type { AppDispatch, AppRootState } from '../../../../utils/states/new.store';
import { MachineProfilesDialogOpenChanged, NarrowRegionChanged } from '../../../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../../../utils/states/workbench.region.constants';
import { BED_OBJECTS_LAYER_ID } from '../../../BedObjects/bed.objects.constants';
import { BED_VIEW_OPTION_ATTRIBUTE } from '../../../BedPanel/bed.toolbar.constants';
import { PROJECT_MATERIAL_SELECT_ID } from '../../../ProjectMaterialSelect/project.material.select.constants';
import { useSvgFilePicker } from '../../../SvgImportButton/use.svg.file.picker';
import { TOOLPATH_WARNINGS_CHIP_ID } from '../../../ToolpathWarningsPanel/toolpath.warnings.panel.constants';
import { POPOVER_KEEP_CLEAR_ATTRIBUTE } from '../../../../utils/layout.constants';
import type { JobReadinessLook } from './interfaces/JobReadinessLook';
import { JOB_READINESS_LOOKS } from './job.readiness.looks';
import { JOB_NEXT_STEP_BUTTON_ID } from './job.readiness.row.constants';
import { JobReadinessStepButton } from './job.readiness.step.button';
import styles from './styles.module.scss';

const STEP_BUTTON_SELECTOR = 'button';
const STEP_ITEM_SELECTOR = '.ant-steps-item';
const TOOLPATH_VIEW_OPTION_SELECTOR = `[${BED_VIEW_OPTION_ATTRIBUTE}="${BED_VIEW_MODE.TOOLPATH}"]`;
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

// The steps and the next-step button stay in sight: the connection and frame popovers open clear of them.
const POPOVER_KEEP_CLEAR_PROPS: Record<string, string> = { [POPOVER_KEEP_CLEAR_ATTRIBUTE]: '' };
// antd Steps draws plain blocks, so the row and its steps name themselves a list and its items.
const STEPS_LIST_PROPS: Record<string, string> = { ...POPOVER_KEEP_CLEAR_PROPS, role: 'list' };
const STEP_ITEM_PROPS: Record<string, string> = { role: 'listitem' };

type JobReadinessStepItem = NonNullable<StepsProps['items']>[number];

/** Whether each step is met, in the row's order. */
const selectMetJobReadinessSteps = (state: AppRootState): boolean[] =>
  JOB_READINESS_LOOKS.map((look: JobReadinessLook): boolean => selectIsJobReadinessStepMet(look.step)(state));

/** A click on a step's name does what a click on its marker does; the keyboard reaches the marker itself. */
const clickStepMarker = (clickEvent: MouseEvent<HTMLElement>): void => {
  clickEvent.currentTarget.closest(STEP_ITEM_SELECTOR)?.querySelector<HTMLButtonElement>(STEP_BUTTON_SELECTOR)?.click();
};

/** The antd Steps status of a step: done, the next one to do, or waiting. */
const getStepStatus = (isMet: boolean, isNextStep: boolean): JobReadinessStepItem['status'] => {
  if (isMet) {
    return ANTD_STEPS_STATUS.FINISH;
  }

  return isNextStep ? ANTD_STEPS_STATUS.PROCESS : ANTD_STEPS_STATUS.WAIT;
};

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
  const metSteps: boolean[] = useSelector(selectMetJobReadinessSteps, shallowEqual);
  const listRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

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

  const handleRowKeyDown = (keyEvent: KeyboardEvent<HTMLDivElement>): void => {
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
      // The view changed on its own: a brief glow on the Toolpath tab and the chip shows where the list came from.
      flashAttentionHighlight([
        document.querySelector(TOOLPATH_VIEW_OPTION_SELECTOR)?.closest(ANTD_SEGMENTED_ITEM_SELECTOR),
        warningsChip,
      ]);
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

  const stepItems: JobReadinessStepItem[] = JOB_READINESS_LOOKS.map(
    (look: JobReadinessLook, index: number): JobReadinessStepItem => {
      const isMet: boolean = Boolean(metSteps[index]);
      const isNextStep: boolean = look.step === nextStep;

      return {
        ...STEP_ITEM_PROPS,
        key: look.step,
        className: [
          styles.stepCell,
          isMet ? styles.metStep : undefined,
          isNextStep ? styles.nextStep : undefined,
          !isMet && isJobReadinessStepOptional(look.step) ? styles.optionalStep : undefined,
        ].join(' '),
        status: getStepStatus(isMet, isNextStep),
        icon: <JobReadinessStepButton {...look} onGoToStep={goToStep} />,
        // The marker carries the name as its label, so the visible name is hidden from screen readers.
        title: <span className={styles.caption} aria-hidden onClick={clickStepMarker}>{t(look.captionKey)}</span>,
      };
    },
  );

  return (
    <div className={styles.readiness}>
      {/* The roving arrow keys move between the step markers inside the antd Steps row. */}
      <div ref={listRef} className={styles.stepsFrame} onKeyDown={handleRowKeyDown}>
        <Steps
          {...STEPS_LIST_PROPS}
          className={styles.jobReadinessRow}
          aria-label={t(DEFAULT.JOB_READINESS_LABEL)}
          size={ANTD_STEPS_SIZE_SMALL}
          titlePlacement={ANTD_STEPS_TITLE_PLACEMENT_VERTICAL}
          current={JOB_READINESS_LOOKS.findIndex((look: JobReadinessLook): boolean => look.step === nextStep)}
          items={stepItems}
        />
      </div>
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
