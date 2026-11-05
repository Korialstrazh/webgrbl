/**
 * The four things a job needs, in the order to set them, each read live from existing state. It adds no rule: Start job
 * keeps its own guards, and a job can start without a material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { selectIsConnected } from './grbl.connection.state';
import { selectActiveMachineProfile } from './machine.profile.state';
import { selectActiveMaterial } from './material.selectors';
import type { AppRootState } from './new.store';
import { selectProjectObjects } from './project.document.state';

export const JOB_READINESS_STEP = {
  PROFILE: 'profile',
  DESIGN: 'design',
  MATERIAL: 'material',
  CONNECT: 'connect',
} as const;

export type JobReadinessStep = (typeof JOB_READINESS_STEP)[keyof typeof JOB_READINESS_STEP];

const JOB_READINESS_STEPS_IN_ORDER: readonly JobReadinessStep[] = [
  JOB_READINESS_STEP.PROFILE,
  JOB_READINESS_STEP.DESIGN,
  JOB_READINESS_STEP.MATERIAL,
  JOB_READINESS_STEP.CONNECT,
];

export const selectIsJobReadinessStepMet = (step: JobReadinessStep) => (state: AppRootState): boolean => {
  switch (step) {
  case JOB_READINESS_STEP.PROFILE:
    return Boolean(selectActiveMachineProfile(state));
  case JOB_READINESS_STEP.DESIGN:
    return Boolean(selectProjectObjects(state).length);
  case JOB_READINESS_STEP.MATERIAL:
    return Boolean(selectActiveMaterial(state));
  default:
    return selectIsConnected(state);
  }
};

export const selectFirstUnmetJobReadinessStep = (state: AppRootState): JobReadinessStep | undefined =>
  JOB_READINESS_STEPS_IN_ORDER.find((step: JobReadinessStep): boolean => !selectIsJobReadinessStepMet(step)(state));
