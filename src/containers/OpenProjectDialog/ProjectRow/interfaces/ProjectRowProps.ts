/**
 * Props of ProjectRow.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectSummary } from '../../../../utils/project/interfaces/ProjectSummary';

export interface ProjectRowProps {
  /** The stored project this row shows. */
  summary: ProjectSummary;
  /** Whether this project is the one open now; it is marked and has no Open button. */
  isOpenProject: boolean;
  /** Called after the project was requested to open, so the dialog can close. */
  onOpened: () => void;
}
