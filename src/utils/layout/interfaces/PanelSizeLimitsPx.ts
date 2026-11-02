/**
 * The narrowest and the widest one splitter panel may be, in CSS pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface PanelSizeLimitsPx {
  minPx: number;
  /** Undefined for a panel that may take whatever the others leave. */
  maxPx: number | undefined;
}
