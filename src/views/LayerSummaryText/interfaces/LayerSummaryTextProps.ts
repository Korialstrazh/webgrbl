/**
 * Props of the one-line layer summary.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';

export interface LayerSummaryTextProps {
  /** The parts of the summary in order, each a value with its unit. */
  parts: string[];
  /** One icon per part, leading it; none draws the plain line with separators. */
  iconComponents?: ReactNode[];
  /** Class of the summary line, for its font and line clamp. */
  className?: string;
}
