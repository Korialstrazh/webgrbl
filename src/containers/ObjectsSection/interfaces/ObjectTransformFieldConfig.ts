/**
 * One editable placement field of an object: which value it sets, its label and how many decimals it shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';

export interface ObjectTransformFieldConfig {
  /** The placement value the field sets; also the key of the field in the list. */
  field: keyof ProjectObjectTransform;
  /** Translation key of the field label. */
  labelKey: string;
  /** Decimals shown for the value. */
  decimals: number;
}
