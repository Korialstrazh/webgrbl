/**
 * Props of the material library dialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface MaterialLibraryDialogProps {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Called on Escape, the close button and a click on the mask. */
  onClose: () => void;
  /** The layer to apply presets to at the start, when the library is opened from a layer. */
  initialLayerKey?: string;
}
