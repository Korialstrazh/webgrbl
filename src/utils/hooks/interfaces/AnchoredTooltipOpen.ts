/**
 * The open state of a tooltip kept tied to its trigger, and the steps that change it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface AnchoredTooltipOpen {
  isOpen: boolean;
  /** Passed as the tooltip's onOpenChange, so hover and focus still open and close it. */
  setIsOpen: (isOpen: boolean) => void;
  close: () => void;
}
