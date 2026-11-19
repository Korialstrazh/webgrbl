/**
 * Props of the toolbar above the material library list: the search, the machine filter, the chips that name the
 * material the list is kept to and the layer it applies to, and the Add preset and New material buttons.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from '../../../utils/materials/interfaces/Material';

export interface MaterialLibraryFiltersProps {
  searchText: string;
  /** Whether the list keeps to the active machine. */
  isOnlyActiveMachine: boolean;
  /** Whether a machine is active, which the machine filter needs. */
  hasActiveMachine: boolean;
  /** Whether any material exists; without one the empty list offers New material itself. */
  hasMaterials: boolean;
  /** The material the list is filtered to; undefined lists every material. */
  filteredMaterial: Material | undefined;
  /** The name of the layer the rows apply to, when the library was opened from a layer. */
  targetLayerName: string | undefined;
  /** Whether a preset can be added: there is a material to add it for and a machine to add it on. */
  isAddAllowed: boolean;
  onSearch: (searchText: string) => void;
  onOnlyActiveMachineChange: (isOnlyActiveMachine: boolean) => void;
  onClearMaterialFilter: () => void;
  onAdd: () => void;
  onNewMaterial: () => void;
}
