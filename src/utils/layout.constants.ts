/**
 * Layout constants shared by the workbench: the breakpoint where the regions sit side by side and the panel widths.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** The window is at least 1280 px wide, so the regions fit side by side. */
export const WIDE_LAYOUT_MEDIA_QUERY = '(min-width: 80rem)';

/** Width of the design panel; the custom property is set from layout.scss by the workbench styles. */
export const DESIGN_PANEL_WIDTH = 'var(--design-panel-width)';

/** Width of the machine panel; the custom property is set from layout.scss by the workbench styles. */
export const MACHINE_PANEL_WIDTH = 'var(--machine-panel-width)';
