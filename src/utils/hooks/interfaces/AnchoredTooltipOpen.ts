/**
 * The open state of a tooltip kept tied to its trigger, and the steps that change it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface AnchoredTooltipOpen {
  isOpen: boolean;
  /** Passed as the tooltip's onOpenChange, so hover and focus still open and close it. */
  setIsOpen: (isOpen: boolean) => void;
  close: () => void;
}
