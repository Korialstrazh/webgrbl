/**
 * What the palette dialog needs: whether it is open and what to do when it closes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface PaletteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
