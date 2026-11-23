/**
 * The six handbook steps in the order the handbook shows them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import { HANDBOOK_STEP_ID } from './handbook.step.id.constants';
import type { HandbookStep } from './interfaces/HandbookStep';

const NO_ANIMATION = (): null => null;

export const HANDBOOK_STEPS: readonly HandbookStep[] = [
  {
    id: HANDBOOK_STEP_ID.MATERIAL,
    titleKey: DEFAULT.HANDBOOK_MATERIAL_TITLE,
    bodyKeys: [DEFAULT.HANDBOOK_MATERIAL_BODY_1],
    Animation: NO_ANIMATION,
  },
  {
    id: HANDBOOK_STEP_ID.CONNECT,
    titleKey: DEFAULT.HANDBOOK_CONNECT_TITLE,
    bodyKeys: [DEFAULT.HANDBOOK_CONNECT_BODY_1],
    Animation: NO_ANIMATION,
  },
  {
    id: HANDBOOK_STEP_ID.IMPORT,
    titleKey: DEFAULT.HANDBOOK_IMPORT_TITLE,
    bodyKeys: [DEFAULT.HANDBOOK_IMPORT_BODY_1],
    Animation: NO_ANIMATION,
  },
  {
    id: HANDBOOK_STEP_ID.FRAME,
    titleKey: DEFAULT.HANDBOOK_FRAME_TITLE,
    bodyKeys: [DEFAULT.HANDBOOK_FRAME_BODY_1],
    Animation: NO_ANIMATION,
  },
  {
    id: HANDBOOK_STEP_ID.RUN,
    titleKey: DEFAULT.HANDBOOK_RUN_TITLE,
    bodyKeys: [DEFAULT.HANDBOOK_RUN_BODY_1],
    Animation: NO_ANIMATION,
  },
  {
    id: HANDBOOK_STEP_ID.ERRORS,
    titleKey: DEFAULT.HANDBOOK_ERRORS_TITLE,
    bodyKeys: [DEFAULT.HANDBOOK_ERRORS_BODY_1],
    Animation: NO_ANIMATION,
  },
];
