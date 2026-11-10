/**
 * The marker of one readiness step inside the antd Steps row: a text button that goes to where the step is set, with a
 * large check once done, the warning count as an antd Badge on Check and a small dashed ring on an open optional step.
 * A done Check or Connect has nothing to open, so it leaves the tab order and says so through aria-disabled.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckOutlined } from '@ant-design/icons';
import { Badge, Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BADGE_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../../utils/antd.constants';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import {
  isJobReadinessStepOptional,
  JOB_READINESS_STEP,
  selectFirstUnmetJobReadinessStep,
  selectIsJobReadinessStepMet,
  selectJobReadinessWarningCount,
} from '../../../../utils/states/job.readiness.selector';
import type { JobReadinessStep } from '../../../../utils/states/job.readiness.selector';
import { KEYBOARD_FOCUSABLE_TAB_INDEX, SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../../../utils/tab.index.constants';
import { DismissibleTooltip } from '../../../../views/DismissibleTooltip';
import type { JobReadinessLook } from './interfaces/JobReadinessLook';
import styles from './styles.module.scss';

const ARIA_CURRENT_STEP = 'step';

// Once met these have nothing left to open: a fixed toolpath and a live connection need no visit.
const STEPS_DONE_WHEN_MET: readonly JobReadinessStep[] = [JOB_READINESS_STEP.WARNINGS, JOB_READINESS_STEP.CONNECT];

/** Whether a step still has somewhere to go: an open step always, a done one unless it is done for good. */
const isJobReadinessStepActionable = (step: JobReadinessStep, isMet: boolean): boolean =>
  !isMet || !STEPS_DONE_WHEN_MET.includes(step);

interface JobReadinessStepButtonProps extends JobReadinessLook {
  onGoToStep: (step: JobReadinessStep) => void;
}

export const JobReadinessStepButton = (props: JobReadinessStepButtonProps): ReactNode => {
  const { step, iconComponent, captionKey, hintKey, optionalHintKey, metHintKey, onGoToStep } = props;
  const { t } = useTranslation();
  const isMet: boolean = useSelector(selectIsJobReadinessStepMet(step));
  const isNextStep: boolean = useSelector(selectFirstUnmetJobReadinessStep) === step;
  const isOptionalOpen: boolean = !isMet && isJobReadinessStepOptional(step);
  const isActionable: boolean = isJobReadinessStepActionable(step, isMet);
  const warningCount: number = useSelector(selectJobReadinessWarningCount);
  // Only the Check step counts something: its open marker carries the number of warnings left to fix.
  const openCount: number = !isMet && step === JOB_READINESS_STEP.WARNINGS ? warningCount : 0;
  const captionText: string = t(captionKey);
  const openHintKey: string = isOptionalOpen && optionalHintKey ? optionalHintKey : hintKey;
  const openLabelKey: string = isOptionalOpen ? DEFAULT.JOB_READINESS_STEP_OPTIONAL : DEFAULT.JOB_READINESS_STEP_OPEN;

  return (
    <DismissibleTooltip
      title={isNextStep ? undefined : t(isMet && metHintKey ? metHintKey : openHintKey, { count: warningCount })}
    >
      <Button
        className={styles.step}
        type={ANTD_BUTTON_TYPE_TEXT}
        aria-label={t(isMet ? DEFAULT.JOB_READINESS_STEP_MET : openLabelKey, { step: captionText, count: openCount })}
        aria-current={isNextStep ? ARIA_CURRENT_STEP : undefined}
        aria-disabled={!isActionable}
        tabIndex={isActionable ? KEYBOARD_FOCUSABLE_TAB_INDEX : SCRIPT_FOCUS_ONLY_TAB_INDEX}
        onClick={() => {
          if (isActionable) {
            onGoToStep(step);
          }
        }}
      >
        <Badge count={openCount} size={ANTD_BADGE_SIZE_SMALL} className={styles.countBadge}>
          <span className={styles.marker}>
            {isMet ? <CheckOutlined aria-hidden /> : iconComponent}
            {/* An open optional step carries a small dashed-ring badge on its marker, apart from the name, so it
                never reads as punctuation or as a blocker. */}
            {isOptionalOpen && (
              <span className={styles.optionalMark} aria-hidden>
                <span className={styles.optionalMarkText}>{t(DEFAULT.JOB_READINESS_STEP_OPTIONAL_CAPTION)}</span>
              </span>
            )}
          </span>
        </Badge>
      </Button>
    </DismissibleTooltip>
  );
};
