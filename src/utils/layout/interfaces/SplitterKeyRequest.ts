/**
 * A key pressed on a splitter bar handle, with the direction of the splitter and the size of one step.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SplitterKeyRequest {
  /** The KeyboardEvent key. */
  key: string;
  /** Whether the panels are stacked top to bottom, so the bar moves up and down. */
  isVertical: boolean;
  /** One arrow key step, in percent of the splitter. */
  stepPercent: number;
}
