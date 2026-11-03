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
export interface MaterialDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called on Cancel, on closing, and after Save. */
  onClose: () => void;
}
