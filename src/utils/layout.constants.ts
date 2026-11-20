/**
 * Layout constants shared by the workbench: the breakpoint where the regions sit side by side, the panel widths,
 * and the limits of the panel sizes the user sets with the splitter.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/** The window is at least 1280 px wide, so the regions fit side by side. */
export const WIDE_LAYOUT_MEDIA_QUERY = '(min-width: 80rem)';

/**
 * The window is at least 1600 px wide, so a left bed drawer pushes the bed aside and the bed still keeps most of its
 * width; below it the drawer slides over the bed, which keeps its size. Must match the media query in BedPanel styles.
 */
export const BED_DRAWER_PUSH_MEDIA_QUERY = '(min-width: 100rem)';

/** Width of the design panel; the custom property is set from layout.scss by the workbench styles. */
export const DESIGN_PANEL_WIDTH = 'var(--design-panel-width)';

/** Width of the machine panel; the custom property is set from layout.scss by the workbench styles. */
export const MACHINE_PANEL_WIDTH = 'var(--machine-panel-width)';

/** The resizable columns of the wide workbench, left to right: design panel, bed, machine panel. */
export const WORKBENCH_PANEL_COUNT = 3;

/**
 * Width of the design panel until the user resizes it, wide enough for a layer name such as "Shading (black)" on one
 * line; must match $design-panel-width in layout.scss.
 */
export const DESIGN_PANEL_DEFAULT_WIDTH_REM = 20.5;

/** On a window at least this wide the design panel opens at its roomy width. */
export const ROOMY_WORKBENCH_MIN_WIDTH_REM = 100;

/**
 * Width of the design panel until the user resizes it on a window exactly as wide as the roomy minimum; a wider window
 * grows it, and the machine panel, in proportion, up to their maximum widths.
 */
export const DESIGN_PANEL_ROOMY_DEFAULT_WIDTH_REM = 24;

/** Width of the machine panel until the user resizes it; must match $machine-panel-width in layout.scss. */
export const MACHINE_PANEL_DEFAULT_WIDTH_REM = 22;

/** The design panel never gets narrower than this, so a layer row keeps its name and a one-line summary. */
export const DESIGN_PANEL_MIN_WIDTH_REM = 16.25;

/** The design panel never gets wider than this, so on a very wide screen the bed takes the rest of the extra width. */
export const DESIGN_PANEL_MAX_WIDTH_REM = 32;

/** The bed never gets narrower than this, so its toolbar and the bed drawing stay usable. */
export const BED_PANEL_MIN_WIDTH_REM = 30;

/** The machine panel never gets narrower than this, so the cards fit without a sideways scrollbar. */
export const MACHINE_PANEL_MIN_WIDTH_REM = 20;

/** The machine panel never gets wider than this, so on a very wide screen the bed takes the rest of the extra width. */
export const MACHINE_PANEL_MAX_WIDTH_REM = 32;

/** One arrow key step of a keyboard splitter handle, in rem: 16 px at the default font size. */
export const SPLITTER_KEYBOARD_STEP_REM = 1;

/** The panel sizes are stored as percentages of the workbench width, which add up to this. */
export const PANEL_SIZE_PERCENT_TOTAL = 100;

/** Stored percentages may add up to a little more or less than 100 through rounding; a bigger gap means bad data. */
export const PANEL_SIZE_PERCENT_SUM_TOLERANCE = 1;

/** The bed above the console never gets lower than this, so the bed drawing and the playback bar stay visible. */
export const BED_PANEL_MIN_HEIGHT_REM = 22;

/**
 * The console never gets lower than this: its padding, header, three log lines (the log's own minimum height in the
 * ConsolePanel stylesheet), the gaps and the command input, so no line is cut through.
 */
export const CONSOLE_PANEL_MIN_HEIGHT_REM = 11.5;

/** Height of the console, in percent of the bed column, until the user resizes it. */
export const CONSOLE_PANEL_DEFAULT_SIZE_PERCENT = 30;

/**
 * How long the workbench waits for the stored panel sizes. IndexedDB can hang without failing, for example while
 * another tab upgrades the database; after this time the workbench opens with the default sizes instead.
 */
export const PANEL_SIZES_READ_TIMEOUT_MS = 1_500;

/** Marks what a popover must never cover, such as the Job steps and the next-step button. */
export const POPOVER_KEEP_CLEAR_ATTRIBUTE = 'data-popover-keep-clear';

/** Set on the root element while tooltips are held back after the shown view changed; the global styles hide them. */
export const TOOLTIP_HOLD_ATTRIBUTE = 'data-tooltip-hold';
