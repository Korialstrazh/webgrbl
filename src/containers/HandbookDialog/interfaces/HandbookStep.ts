/**
 * One step of the getting-started handbook: its id, its title and body text keys and its animation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ComponentType } from 'react';
import type { DefaultLocaleKey } from '../../../utils/localization/default.locales';
import type { HandbookStepId } from './HandbookStepId';

export interface HandbookStep {
  /** Which step this is. */
  id: HandbookStepId;
  /** Locale key of the step title. */
  titleKey: DefaultLocaleKey;
  /** Locale keys of the step text, one paragraph or list item per key. */
  bodyKeys: readonly DefaultLocaleKey[];
  /** The looping picture that shows the step. */
  Animation: ComponentType;
}
