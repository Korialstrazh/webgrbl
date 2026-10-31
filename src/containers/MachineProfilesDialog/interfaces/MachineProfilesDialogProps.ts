/**
 * Props of MachineProfilesDialog: whether it is shown and how it asks to close.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface MachineProfilesDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called on Escape, the close button and a click on the mask. */
  onClose: () => void;
}
