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
export interface LayerSummaryTextProps {
  /** The parts of the summary in order, each a value with its unit. */
  parts: string[];
  /** Class of the summary line, for its font and line clamp. */
  className?: string;
}
