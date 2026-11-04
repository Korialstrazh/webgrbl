/**
 * Props of the toolbar above the material library table: the search, the machine filter, the material filter chip
 * and the Add preset button.
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
  /** Whether a preset can be added: there is a material to add it for and a machine to add it on. */
  isAddAllowed: boolean;
  /** Whether Add preset is the main action, which it is while no preset is open in the edit pane. */
  isAddMainAction: boolean;
  onSearch: (searchText: string) => void;
  onOnlyActiveMachineChange: (isOnlyActiveMachine: boolean) => void;
  onClearMaterialFilter: () => void;
  onAdd: () => void;
}
