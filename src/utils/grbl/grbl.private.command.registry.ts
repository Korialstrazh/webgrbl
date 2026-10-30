import type { GrblPrivateCommandRequest } from './interfaces/GrblPrivateCommandRequest';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';

/**
 * Pairs each private line (such as $I or $$) with the answer lines GRBL prints before acknowledging it. GRBL
 * answers lines in order, so lines that arrive while a private line is the oldest in flight belong to it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblPrivateCommandRegistry {
  /** Requests waiting for their acknowledgement, keyed by their queued line. */
  private readonly requestsByLine: Map<GrblQueuedLine, GrblPrivateCommandRequest> = new Map();

  /** Registers a queued private line; the promise resolves with its answer lines once the line is acknowledged. */
  public registerPrivateLine(line: GrblQueuedLine): Promise<string[]> {
    return new Promise<string[]>(
      (resolveAnswer: (answerLines: string[]) => void, rejectAnswer: (error: Error) => void): void => {
        this.requestsByLine.set(line, { answerLines: [], resolveAnswer, rejectAnswer });
      },
    );
  }

  /** Records an answer line if the oldest in-flight line is a registered private line. */
  public collectAnswerLine(oldestInFlightLine: GrblQueuedLine | undefined, answerText: string): void {
    if (oldestInFlightLine) {
      this.requestsByLine.get(oldestInFlightLine)?.answerLines.push(answerText);
    }
  }

  /**
   * Settles the request of an acknowledged line with its answer lines. An error acknowledgement settles it too:
   * the error itself is reported as a controller event, and the caller reads what arrived.
   */
  public completePrivateLine(acknowledgedLine: GrblQueuedLine | undefined): void {
    if (!acknowledgedLine) {
      return;
    }

    const request: GrblPrivateCommandRequest | undefined = this.requestsByLine.get(acknowledgedLine);

    if (!request) {
      return;
    }

    this.requestsByLine.delete(acknowledgedLine);
    request.resolveAnswer(request.answerLines);
  }

  /** Fails every waiting request, for example when the connection closes. */
  public rejectAllPrivateLines(error: Error): void {
    for (const request of this.requestsByLine.values()) {
      request.rejectAnswer(error);
    }

    this.requestsByLine.clear();
  }
}
