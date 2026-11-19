/**
 * The result of checking a job against the three common cutting mistakes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { CutCheckWarning } from './CutCheckWarning';

export interface CutCheck {
  /** Number of parts predicted to come free. */
  freePartCount: number;
  /** Number of parts that may or may not come free. */
  borderlinePartCount: number;
  /** Number of parts predicted to stay attached. */
  attachedPartCount: number;
  /** Everything worth the user's attention. */
  warnings: CutCheckWarning[];
  /** Whether the check rests on a guess because nothing was tested. */
  isGuess: boolean;
}
