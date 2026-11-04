/**
 * What the material library table lists: the search text and the machine profile to keep to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPresetOperation } from '../material.preset.constants';

export interface MaterialPresetRowFilter {
  /** Words that must all be found in the material, thickness or operation of a row. */
  searchText: string;
  /** The only machine profile to list; undefined lists every profile. */
  machineProfileId: string | undefined;
  /** The material whose rows come first, usually the material of the project; undefined keeps the plain order. */
  preferredMaterialId?: string;
  /** The word the user sees for an operation, so that a search finds it in the user's language. */
  getOperationLabel: (operation: MaterialPresetOperation) => string;
}
