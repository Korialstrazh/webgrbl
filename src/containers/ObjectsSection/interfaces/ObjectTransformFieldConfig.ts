/**
 * One editable placement field of an object: which value it sets, its label and how many decimals it shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';

export interface ObjectTransformFieldConfig {
  /** The placement value the field sets; also the key of the field in the list. */
  field: keyof ProjectObjectTransform;
  /** Translation key of the field label. */
  labelKey: string;
  /** Translation key of the short letter shown inside the input; fields without one show an icon. */
  prefixKey?: string;
  /** Translation key of the tooltip that names the field and its unit. */
  hintKey: string;
  /** Decimals shown for the value. */
  decimals: number;
}
