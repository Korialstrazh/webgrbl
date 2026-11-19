/**
 * Props of BedColumnSplitter: the bed panel it places above the console.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';

export interface BedColumnSplitterProps {
  /** The upper panel; it stays mounted while the console opens and closes. */
  bedPanelComponent: ReactNode;
}
