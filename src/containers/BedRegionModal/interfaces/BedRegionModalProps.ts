/**
 * Props of BedRegionModal: the antd Modal props it passes on, without the ones that place it, plus its open state,
 * its overlay registry prefix and its close callback.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ModalProps } from 'antd';

/** The Modal props that place the dialog and its mask; BedRegionModal sets them so the dialog stays in the bed. */
type BedRegionModalPlacementPropName = 'getContainer' | 'rootClassName' | 'open' | 'onCancel' | 'zIndex';

export interface BedRegionModalProps extends Omit<ModalProps, BedRegionModalPlacementPropName> {
  /** Whether the dialog is shown. */
  isOpen: boolean;
  /** Prefix of the id the dialog registers in the overlay registry while open. */
  overlayIdPrefix: string;
  /** Called on Escape, the close button and a click on the mask. */
  onClose: () => void;
}
