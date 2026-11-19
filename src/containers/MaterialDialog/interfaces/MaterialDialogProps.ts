/**
 * Props of MaterialDialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from '../../../utils/materials/interfaces/Material';

export interface MaterialDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called on Cancel, on closing, and after Save. */
  onClose: () => void;
  /**
   * Called with the id of the saved material, or of the matching one the user chose, instead of making it the
   * material of the project; without it the dialog selects the material for the project.
   */
  onMaterialChosen?: (materialId: string) => void;
  /** A saved material to rename or change the thickness of in place; without it the dialog adds a new one. */
  editedMaterial?: Material;
}
