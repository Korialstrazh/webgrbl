/**
 * What the Project menu entries depend on: whether G-code export can start and whether undo and redo can act.
 *
 * @author michael.morosov
 *
 * @since 2026-11-20
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';

export interface ProjectMenuItemsOptions {
  gcodeExport: GcodeExportAvailability;
  /** Whether there is a change to undo; the phone-only Undo entry is off without one. */
  canUndo: boolean;
  /** Whether there is an undone change to redo; the phone-only Redo entry is off without one. */
  canRedo: boolean;
}
