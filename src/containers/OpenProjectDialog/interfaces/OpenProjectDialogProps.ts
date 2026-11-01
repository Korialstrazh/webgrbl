/**
 * Props of OpenProjectDialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface OpenProjectDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called when the dialog should close: Escape, the close button, the mask, or a project that was opened. */
  onClose: () => void;
}
