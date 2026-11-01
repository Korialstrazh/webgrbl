/**
 * Limits, steps, timings, name rules and file format values of projects.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';

export const MAX_PROJECT_OBJECTS = 50;
export const IMPORT_PLACEMENT_OFFSET_MM = 10;
/** After this many imported objects the placement cascade starts again at the corner. */
export const IMPORT_PLACEMENT_CASCADE_LENGTH = 10;
export const NUDGE_STEP_MM = 1;
export const NUDGE_STEP_SHIFT_MM = 10;
export const ROTATION_SNAP_DEG = 15;
export const MIN_OBJECT_SIZE_MM = 0.1;
export const MAX_OBJECT_SIZE_MM = 5000;
export const MAX_UNDO_STEPS = 100;
export const AUTOSAVE_DEBOUNCE_MS = 1000;
export const AUTOSAVE_MAX_WAIT_MS = 3000;
export const MIN_PROJECT_NAME_LENGTH = 1;
export const MAX_PROJECT_NAME_LENGTH = 100;
export const DEFAULT_PROJECT_NAME_KEY = DEFAULT.TOP_BAR_PROJECT_PLACEHOLDER;

export const PROJECT_FILE_FORMAT = 'webgrbl-project';
export const PROJECT_FILE_VERSION = 1;
export const PROJECT_FILE_EXTENSION = '.webgrbl.json';
/** Spaces per indent level, so a saved project file stays readable in a text editor. */
export const PROJECT_FILE_JSON_INDENT = 2;

/** Tolerance for float noise when a rotated corner is compared with a bed edge. */
export const BED_EDGE_EPSILON_MM = 1e-9;

export const FULL_TURN_DEG = 360;
export const HALF_TURN_DEG = FULL_TURN_DEG / 2;
export const HALF_BOX_FACTOR = 0.5;

export const DEFAULT_OBJECT_NAME = 'Object';
export const DEFAULT_OBJECT_SIZE_MM = 10;
export const DEFAULT_OBJECT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
