/**
 * Props of the toolbar above the material library list: the search, the machine filter, the chips that name the
 * material the list is kept to and the layer it applies to, and the Add preset and New material buttons.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from '../../../utils/materials/interfaces/Material';

export interface MaterialLibraryFiltersProps {
  searchText: string;
  /** Whether the list keeps to the active machine. */
  isOnlyActiveMachine: boolean;
  /** Whether a machine is active, which the machine filter needs. */
  hasActiveMachine: boolean;
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
