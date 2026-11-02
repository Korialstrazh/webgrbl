/**
 * Props of CollapsedCardToggle: whether the card is collapsed, the texts of the line, and the toggle callback.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface CollapsedCardToggleProps {
  isCollapsed: boolean;
  /** Why the card is collapsed and its controls are disabled, shown beside the toggle open or closed. */
  hintText: string;
  /** The id of the card body the toggle shows and hides. */
  controlsId: string;
  /** The visible toggle text: Show while collapsed, Hide while open. */
  toggleText: string;
  /** The accessible name of the toggle, which names the controls it shows or hides. */
  toggleLabel: string;
  /** Called when the toggle is pressed. */
  onToggle: () => void;
}
