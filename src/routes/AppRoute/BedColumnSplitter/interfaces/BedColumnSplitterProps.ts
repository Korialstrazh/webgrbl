/**
 * Props of BedColumnSplitter: the bed panel it places above the console.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';

export interface BedColumnSplitterProps {
  /** The upper panel; it stays mounted while the console opens and closes. */
  bedPanelComponent: ReactNode;
}
