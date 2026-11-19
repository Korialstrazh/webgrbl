/**
 * What the material library table lists: the search text, the machine profile and the material to keep to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPresetOperation } from '../material.preset.constants';

export interface MaterialPresetRowFilter {
  /** Words that must all be found in the material, thickness or operation of a row. */
  searchText: string;
  /** The only machine profile to list; undefined lists every profile. */
  machineProfileId: string | undefined;
  /** The only material to list, when the library was opened for one; undefined lists every material. */
  materialId?: string;
  /** The material whose rows come first, usually the material of the project; undefined keeps the plain order. */
  preferredMaterialId?: string;
  /** The word the user sees for an operation, so that a search finds it in the user's language. */
  getOperationLabel: (operation: MaterialPresetOperation) => string;
}
