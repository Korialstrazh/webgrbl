import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { HANDBOOK_STEP_ID } from '../../containers/HandbookDialog/handbook.step.id.constants';
import { HANDBOOK_STEPS } from '../../containers/HandbookDialog/handbook.steps';
import type { HandbookStep } from '../../containers/HandbookDialog/interfaces/HandbookStep';
import { ConnectAnimation } from './ConnectAnimation';
import connectStyles from './ConnectAnimation/styles.module.scss';
import { ErrorAnimation } from './ErrorAnimation';
import errorStyles from './ErrorAnimation/styles.module.scss';
import { FrameAnimation } from './FrameAnimation';
import frameStyles from './FrameAnimation/styles.module.scss';
import { ImportSvgAnimation } from './ImportSvgAnimation';
import importSvgStyles from './ImportSvgAnimation/styles.module.scss';
import { MaterialAnimation } from './MaterialAnimation';
import materialStyles from './MaterialAnimation/styles.module.scss';
import { RunJobAnimation } from './RunJobAnimation';
import runJobStyles from './RunJobAnimation/styles.module.scss';

interface HandbookAnimationCase {
  stepId: string;
  Animation: () => ReactNode;
  animationClassName: string | undefined;
}

const ANIMATION_CASES: readonly HandbookAnimationCase[] = [
  { stepId: HANDBOOK_STEP_ID.MATERIAL, Animation: MaterialAnimation, animationClassName: materialStyles.animation },
  { stepId: HANDBOOK_STEP_ID.CONNECT, Animation: ConnectAnimation, animationClassName: connectStyles.animation },
  { stepId: HANDBOOK_STEP_ID.IMPORT, Animation: ImportSvgAnimation, animationClassName: importSvgStyles.animation },
  { stepId: HANDBOOK_STEP_ID.FRAME, Animation: FrameAnimation, animationClassName: frameStyles.animation },
  { stepId: HANDBOOK_STEP_ID.RUN, Animation: RunJobAnimation, animationClassName: runJobStyles.animation },
  { stepId: HANDBOOK_STEP_ID.ERRORS, Animation: ErrorAnimation, animationClassName: errorStyles.animation },
];

describe('HandbookAnimations', () => {
  it.each(ANIMATION_CASES)('renders the $stepId animation as a hidden svg with the animation class', (testCase) => {
    const { Animation, animationClassName } = testCase;
    const { container } = render(<Animation />);
    const animationRoot: SVGSVGElement | null = container.querySelector('svg');

    expect(animationClassName).toBeTruthy();
    expect(animationRoot).toHaveAttribute('aria-hidden', 'true');
    expect(animationRoot).toHaveClass(animationClassName ?? '');
  });

  it.each(ANIMATION_CASES)('wires the $stepId animation into its handbook step', (testCase) => {
    const step: HandbookStep | undefined = HANDBOOK_STEPS.find(
      (handbookStep: HandbookStep) => handbookStep.id === testCase.stepId,
    );

    expect(step?.Animation).toBe(testCase.Animation);
  });
});
