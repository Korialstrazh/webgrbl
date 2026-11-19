/**
 * How the toolpath status overlay is shown.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ToolpathStatusOverlayProps {
  /** True in the 3D view, where the pane's own message already covers an out-of-date or missing toolpath. */
  isGeneratingOrFailedOnly?: boolean;
}
