/**
 * The result of checking a job against the three common cutting mistakes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
