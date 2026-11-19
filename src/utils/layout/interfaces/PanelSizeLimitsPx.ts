/**
 * The narrowest and the widest one splitter panel may be, in CSS pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface PanelSizeLimitsPx {
  minPx: number;
  /** Undefined for a panel that may take whatever the others leave. */
  maxPx: number | undefined;
}
