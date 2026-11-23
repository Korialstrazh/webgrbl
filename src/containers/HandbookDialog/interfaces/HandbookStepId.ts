/**
 * The id of one handbook step.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { HANDBOOK_STEP_ID } from '../handbook.step.id.constants';

export type HandbookStepId = (typeof HANDBOOK_STEP_ID)[keyof typeof HANDBOOK_STEP_ID];
