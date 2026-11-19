/**
 * The look of one readiness step: its icon, caption, tooltips and next-step action.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import type { JobReadinessStep } from '../../../../../utils/states/job.readiness.selector';

export interface JobReadinessLook {
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
