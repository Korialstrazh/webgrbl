/**
 * Props of PanelSplitter: the three workbench panels it places side by side, and the callback for live resizes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';

export interface PanelSplitterProps {
  /** The left panel. */
  designPanelComponent: ReactNode;
  /** The middle panel, which takes the space the side panels leave until the user resizes. */
  bedPanelComponent: ReactNode;
  /** The right panel. */
  machinePanelComponent: ReactNode;
  /** Called while a splitter bar is dragged, with the width of each panel in percent of the workbench width. */
  onPanelResize: (panelSizePercents: number[]) => void;
}
