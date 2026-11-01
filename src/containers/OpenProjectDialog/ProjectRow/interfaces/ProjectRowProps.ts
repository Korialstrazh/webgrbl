/**
 * Props of ProjectRow.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
