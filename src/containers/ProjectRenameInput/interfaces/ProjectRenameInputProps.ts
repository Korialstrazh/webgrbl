/**
 * Props of ProjectRenameInput.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ProjectRenameInputProps {
  /** The current name; the box starts with it, and a commit of the same name changes nothing. */
  initialName: string;
  /** Accessible name of the box. */
  ariaLabel: string;
  /** Called with the trimmed new name when the user commits a name that is not empty and not the current one. */
  onCommit: (name: string) => void;
  /** Called when the rename ends without a new name: Escape, an empty name or an unchanged one. */
  onCancel: () => void;
}
