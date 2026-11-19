/**
 * Props of the empty state of the material library table.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from '../../../utils/materials/interfaces/Material';

export interface MaterialLibraryEmptyStateProps {
  /** Whether any material exists; without one no preset can be added. */
  hasMaterials: boolean;
  /** Whether a machine is active; without one no preset can be added. */
  hasActiveMachine: boolean;
  /** The search text, which can be the reason no row shows. */
  searchText: string;
  /** The material the list is filtered to, which can be the reason no row shows; undefined without a filter. */
  filteredMaterial: Material | undefined;
  onClearSearch: () => void;
  onClearMaterialFilter: () => void;
  /** Opens the dialog that adds a material, the one thing to do while there is none. */
  onNewMaterial: () => void;
  /** Closes the library, so the top bar is free while the user picks a machine. */
  onClose: () => void;
}
