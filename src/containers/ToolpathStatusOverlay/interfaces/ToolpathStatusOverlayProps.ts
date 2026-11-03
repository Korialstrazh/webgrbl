/**
 * How the toolpath status overlay is shown.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ToolpathStatusOverlayProps {
  /** True in the 3D view, where the pane's own message already covers an out-of-date or missing toolpath. */
  isGeneratingOrFailedOnly?: boolean;
}
