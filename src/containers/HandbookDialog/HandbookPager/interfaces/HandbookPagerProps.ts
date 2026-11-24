/**
 * The props of the handbook pager: what it calls when the reader finishes the last step.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface HandbookPagerProps {
  /** Called when Done is pressed on the last step. */
  onFinish: () => void;
}
