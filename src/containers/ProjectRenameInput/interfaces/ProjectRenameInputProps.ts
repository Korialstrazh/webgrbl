/**
 * Props of ProjectRenameInput.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ProjectRenameInputProps {
  /** The current name; the box starts with it, and a commit of the same name changes nothing. */
  initialName: string;
  /** Accessible name of the box. */
  ariaLabel: string;
  /** Called with the trimmed new name when the user commits a name that is not empty and not the current one. */
  onCommit: (newName: string) => void;
  /** Called when the rename ends without a new name: Escape, an empty name or an unchanged one. */
  onCancel: () => void;
}
