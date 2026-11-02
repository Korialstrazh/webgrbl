/**
 * A key pressed on a splitter bar handle, with the direction of the splitter and the size of one step.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SplitterKeyRequest {
  /** The KeyboardEvent key. */
  key: string;
  /** Whether the panels are stacked top to bottom, so the bar moves up and down. */
  isVertical: boolean;
  /** One arrow key step, in percent of the splitter. */
  stepPercent: number;
}
