/**
 * Props of the bed panel.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Ref } from 'react';

export interface BedPanelProps {
  /** Receives the bed region element below the bed header, which dialogs and drawers render into; in a narrow window the
   * workbench gives them a larger box instead. */
  hostRef?: Ref<HTMLDivElement>;
  /** Whether the window is wide; narrower, the toasts are pinned to the window. */
  isWide: boolean;
}
