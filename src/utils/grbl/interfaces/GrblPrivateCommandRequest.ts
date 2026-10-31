/**
 * A private line waiting for its answer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GrblPrivateCommandRequest {
  /** Answer lines received so far, before the acknowledgement. */
  answerLines: string[];
  /** Settles the request with its answer lines. */
  resolveAnswer: (answerLines: string[]) => void;
  /** Fails the request. */
  rejectAnswer: (error: Error) => void;
}
