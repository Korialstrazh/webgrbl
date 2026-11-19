/**
 * Props of MachineProfilesDialog: whether it is shown and how it asks to close.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface MachineProfilesDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called on Escape, the close button and a click on the mask. */
  onClose: () => void;
}
