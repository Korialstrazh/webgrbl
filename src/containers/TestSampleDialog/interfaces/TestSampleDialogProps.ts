/**
 * Props of the test sample dialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from '../../../utils/materials/interfaces/Material';

export interface TestSampleDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** The material the sample is burnt on and the result is saved for. */
  material: Material;
  /** Called on Cancel, on closing, and after Save. */
  onClose: () => void;
}
