/**
 * A private line waiting for its answer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GrblPrivateCommandRequest {
  /** Answer lines received so far, before the acknowledgement. */
  answerLines: string[];
  /** Settles the request with its answer lines. */
  resolveAnswer: (answerLines: string[]) => void;
  /** Fails the request. */
  rejectAnswer: (error: Error) => void;
}
