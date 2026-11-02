/**
 * Layout constants shared by the workbench: the breakpoint where the regions sit side by side, the panel widths,
 * and the limits of the panel sizes the user sets with the splitter.
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

/** The resizable columns of the wide workbench, left to right: design panel, bed, machine panel. */
export const WORKBENCH_PANEL_COUNT = 3;

/** Position of the design panel in the list of panel sizes. */
export const DESIGN_PANEL_INDEX = 0;

/** Position of the machine panel in the list of panel sizes. */
export const MACHINE_PANEL_INDEX = 2;

/** Width of the design panel until the user resizes it; must match $design-panel-width in layout.scss. */
export const DESIGN_PANEL_DEFAULT_WIDTH_REM = 17.5;

/** Width of the machine panel until the user resizes it; must match $machine-panel-width in layout.scss. */
export const MACHINE_PANEL_DEFAULT_WIDTH_REM = 22;

/** The design panel never gets narrower than this, so the layer rows and the object fields stay usable. */
export const DESIGN_PANEL_MIN_WIDTH_REM = 14;

/** The bed never gets narrower than this, so its toolbar and the bed drawing stay usable. */
export const BED_PANEL_MIN_WIDTH_REM = 20;

/** The machine panel never gets narrower than this, so the jog buttons and STOP stay usable. */
export const MACHINE_PANEL_MIN_WIDTH_REM = 18;

/** The panel sizes are stored as percentages of the workbench width, which add up to this. */
export const PANEL_SIZE_PERCENT_TOTAL = 100;

/** Stored percentages may add up to a little more or less than 100 through rounding; a bigger gap means bad data. */
export const PANEL_SIZE_PERCENT_SUM_TOLERANCE = 1;

/** Custom property with the width of the design column; the console overlay starts at its right edge. */
export const DESIGN_COLUMN_WIDTH_PROPERTY = '--design-column-width';

/** Custom property with the width of the machine column; the console overlay stops short of it. */
export const MACHINE_COLUMN_WIDTH_PROPERTY = '--machine-column-width';
