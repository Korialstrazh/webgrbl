/**
 * Props of PanelSplitter: the three workbench panels it places side by side.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';

export interface PanelSplitterProps {
  /** The left panel. */
  designPanelComponent: ReactNode;
  /** The middle panel, which takes the space the side panels leave until the user resizes. */
  bedPanelComponent: ReactNode;
  /** The right panel. */
  machinePanelComponent: ReactNode;
}
