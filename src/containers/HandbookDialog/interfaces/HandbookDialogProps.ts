/**
 * The props of the handbook dialog: whether it is shown and how it asks to close.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface HandbookDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called on Escape, the close button, a click on the mask and the Done button. */
  onClose: () => void;
}
