/**
 * What decides whether a press on the bed view pans.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedPressPanInput {
  /** The pointer button that went down. */
  button: number;
  /** True while Space is held over the bed. */
  isSpaceHeld: boolean;
  /** True when Ctrl (Cmd on a Mac) was held as the button went down. */
  isCtrlHeld: boolean;
  /** True when at least one object is selected. */
  hasSelection: boolean;
  /** True when the press landed on a drawn object or one of its handles. */
  isOnObject: boolean;
}
