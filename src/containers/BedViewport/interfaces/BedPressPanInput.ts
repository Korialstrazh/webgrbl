/**
 * What decides whether a press on the bed view pans.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
