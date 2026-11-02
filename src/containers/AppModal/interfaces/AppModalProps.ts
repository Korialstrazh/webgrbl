/**
 * Props of AppModal: the antd Modal props it passes on, without the ones that place and size it, plus its open state,
 * its overlay registry prefix, its widest width and its close callback.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ModalProps } from 'antd';

/** The Modal props that place and size the dialog; AppModal sets them so the dialog always fits the window. */
type AppModalPlacementPropName =
  | 'getContainer'
  | 'rootClassName'
  | 'open'
  | 'onCancel'
  | 'zIndex'
  | 'width'
  | 'centered';

export interface AppModalProps extends Omit<ModalProps, AppModalPlacementPropName> {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Prefix of the id the dialog registers in the overlay registry while open. */
  overlayIdPrefix: string;
  /** The widest the dialog gets, as a CSS length in rem; a narrower window makes it narrower. */
  maxWidth: string;
  /** Called on Escape, the close button and a click on the mask. */
  onClose: () => void;
}
