/**
 * Props of ProjectList.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ProjectListProps {
  /** Called when a project was opened, so the dialog around the list closes. */
  onClose: () => void;
}
