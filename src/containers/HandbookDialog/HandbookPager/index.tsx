/**
 * The body of the handbook: the current step with its animation and text, a step list beside it in a wide window, and a
 * Previous / Next pager that ends in Done. It holds the current step, so unmounting it resets the handbook to step 1.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Button, Typography } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_TYPE_PRIMARY, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { DefaultLocaleKey } from '../../../utils/localization/default.locales';
import { FIRST_HANDBOOK_STEP_INDEX } from '../handbook.dialog.constants';
import { HANDBOOK_STEPS } from '../handbook.steps';
import type { HandbookStep } from '../interfaces/HandbookStep';
import type { HandbookPagerProps } from './interfaces/HandbookPagerProps';
import styles from './styles.module.scss';

const LAST_HANDBOOK_STEP_INDEX: number = HANDBOOK_STEPS.length - 1;
const ARIA_CURRENT_STEP = 'step';

export const HandbookPager = ({ onFinish }: HandbookPagerProps): ReactNode => {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState<number>(FIRST_HANDBOOK_STEP_INDEX);
  const step: HandbookStep | undefined = HANDBOOK_STEPS[stepIndex];
  const isFirstStep: boolean = stepIndex === FIRST_HANDBOOK_STEP_INDEX;
  const isLastStep: boolean = stepIndex === LAST_HANDBOOK_STEP_INDEX;

  const goToNextStep = (): void => {
    if (isLastStep) {
      onFinish();

      return;
    }

    setStepIndex(stepIndex + 1);
  };

  if (!step) {
    return null;
  }

  const StepAnimation = step.Animation;

  return (
    <div className={styles.handbook}>
      <nav className={styles.stepList} aria-label={t(DEFAULT.HANDBOOK_STEPS_LABEL)}>
        {HANDBOOK_STEPS.map((listedStep: HandbookStep, listedIndex: number) => (
          <Button
            key={listedStep.id}
            type={ANTD_BUTTON_TYPE_TEXT}
            className={listedIndex === stepIndex ? styles.currentStepButton : styles.stepButton}
            aria-current={listedIndex === stepIndex ? ARIA_CURRENT_STEP : undefined}
            onClick={() => setStepIndex(listedIndex)}
          >
            {listedIndex + 1}. {t(listedStep.titleKey)}
          </Button>
        ))}
      </nav>
      <section className={styles.content}>
        <div className={styles.animationFrame}>
          <StepAnimation />
        </div>
        <Typography.Text type="secondary">
          {t(DEFAULT.HANDBOOK_STEP_COUNTER, { current: stepIndex + 1, total: HANDBOOK_STEPS.length })}
        </Typography.Text>
        <Typography.Title level={4} className={styles.stepTitle}>{t(step.titleKey)}</Typography.Title>
        {step.bodyKeys.map((bodyKey: DefaultLocaleKey) => (
          <Typography.Paragraph key={bodyKey}>{t(bodyKey)}</Typography.Paragraph>
        ))}
        <div className={styles.pager}>
          <Button disabled={isFirstStep} onClick={() => setStepIndex(stepIndex - 1)}>
            {t(DEFAULT.HANDBOOK_PREVIOUS)}
          </Button>
          <Button type={ANTD_BUTTON_TYPE_PRIMARY} onClick={goToNextStep}>
            {isLastStep ? t(DEFAULT.HANDBOOK_DONE) : t(DEFAULT.HANDBOOK_NEXT)}
          </Button>
        </div>
      </section>
    </div>
  );
};
