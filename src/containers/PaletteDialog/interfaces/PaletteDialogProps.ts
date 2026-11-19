/**
 * What the palette dialog needs: whether it is open and what to do when it closes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface PaletteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
