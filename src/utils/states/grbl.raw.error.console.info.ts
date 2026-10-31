/**
 * Builds the console line that shows the raw text of an error. Toasts carry only fixed messages, so this line is the
 * one place where the original error text reaches the user.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import { ConsoleInfoAdded } from './grbl.console.state';

/** Web Serial fails with DOMException, which not every environment derives from Error. */
const getErrorCauseMessage = (cause: unknown): string | undefined =>
  cause instanceof Error || cause instanceof DOMException ? cause.message : undefined;

/** The raw text of an error, with the text of its cause, for the console; toasts never show it. */
const getRawErrorDetail = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const causeMessage: string | undefined = getErrorCauseMessage(error.cause);

  return causeMessage ? `${error.message}: ${causeMessage}` : error.message;
};

export const newRawErrorConsoleInfo = (error: unknown): ConsoleInfoAdded => new ConsoleInfoAdded({
  messageKey: DEFAULT.CONSOLE_RAW_ERROR,
  isError: true,
  timestamp: Date.now(),
  messageParameters: { detail: getRawErrorDetail(error) },
});
