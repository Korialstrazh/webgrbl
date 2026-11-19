/**
 * Props of CollapsedCardToggle: whether the card is collapsed, the texts of the line, and the toggle callback.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface CollapsedCardToggleProps {
  isCollapsed: boolean;
  /** Why the card is collapsed and its controls are disabled, shown beside the toggle open or closed. */
  hintText: string;
  /** The id of the card body the toggle shows and hides. */
  controlsId: string;
  /** The accessible name of the toggle, which names the controls it shows or hides. */
  toggleLabel: string;
  /** Called when the toggle is pressed. */
  onToggle: () => void;
  /** Called when the plug is pressed, to open the connection popover; it must not connect. */
  onPlugClick?: () => void;
}
