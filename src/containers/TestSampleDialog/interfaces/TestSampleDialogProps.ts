/**
 * Props of the test sample dialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
