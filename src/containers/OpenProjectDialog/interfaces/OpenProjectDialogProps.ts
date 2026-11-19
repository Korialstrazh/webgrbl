/**
 * Props of OpenProjectDialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface OpenProjectDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called when the dialog should close: Escape, the close button, the mask, or a project that was opened. */
  onClose: () => void;
}
