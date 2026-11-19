/**
 * The text of a toast message. Its description parameter holds a localisation key, so it is translated before it
 * goes into the message.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import type { ToastShownPayload } from './interfaces/ToastShownPayload';

const DESCRIPTION_PARAMETER_NAME = 'description';

export const getToastMessageText = (
  message: Pick<ToastShownPayload, 'messageKey' | 'messageParameters'>,
  t: TFunction,
): string => {
  const hasDescription: boolean = Object.hasOwn(message.messageParameters, DESCRIPTION_PARAMETER_NAME);
  const parameters: Record<string, string | number> = hasDescription
    ? {
      ...message.messageParameters,
      [DESCRIPTION_PARAMETER_NAME]: t(String(message.messageParameters[DESCRIPTION_PARAMETER_NAME])),
    }
    : message.messageParameters;

  return t(message.messageKey, parameters);
};
