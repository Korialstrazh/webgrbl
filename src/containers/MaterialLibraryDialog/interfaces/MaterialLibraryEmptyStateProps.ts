/**
 * Props of the empty state of the material library table.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface MaterialLibraryEmptyStateProps {
  /** Whether any material exists; without one no preset can be added. */
  hasMaterials: boolean;
  /** Whether a machine is active; without one no preset can be added. */
  hasActiveMachine: boolean;
  /** The search text, which can be the reason no row shows. */
  searchText: string;
  onClearSearch: () => void;
  /** Closes the dialog, which is in the way of the panel the user has to go to. */
  onClose: () => void;
}
