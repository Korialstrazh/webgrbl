/**
 * Props of the message history dialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MessageHistoryDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called on Escape, the close button and a click on the mask. */
  onClose: () => void;
}
