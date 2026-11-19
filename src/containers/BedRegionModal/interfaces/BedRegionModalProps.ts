/**
 * Props of BedRegionModal: the antd Modal props it passes on, without the ones that place it, plus its open state,
 * its overlay registry prefix and its close callback.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
