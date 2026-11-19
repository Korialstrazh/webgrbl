/**
 * Connects to a GRBL controller: open, soft reset, wait for the banner, then read build info ($I) and settings ($$).
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_BUILD_INFO_COMMAND,
  GRBL_DEFAULT_RX_BUFFER_BYTES,
  GRBL_HANDSHAKE_FAILURE_REASON,
  GRBL_HANDSHAKE_TIMEOUT_MS,
  GRBL_REALTIME_COMMAND,
  GRBL_RESPONSE_KIND,
  GRBL_SETTINGS_COMMAND,
} from './grbl.constants';
import { getGrblRxBufferSizeFromBuildOption } from './grbl.build.info.parser';
import { GrblHandshakeError } from './grbl.handshake.error';
import { isSupportedGrblFirmware } from './grbl.firmware.support';
import { getParsedGrblResponse } from './grbl.response.parser';
import type { GrblConnectionInfo } from './interfaces/GrblConnectionInfo';
import type { GrblFirmwareIdentity } from './interfaces/GrblFirmwareIdentity';
import type { GrblConnectionAnswers } from './interfaces/GrblConnectionAnswers';
import type { GrblRestartWait } from './interfaces/GrblRestartWait';
import type { GrblHandshakeContext } from './interfaces/GrblHandshakeContext';
import type { GrblResponse } from './interfaces/GrblResponse';

/** How often $I and $$ are asked in all before a restarting controller counts as failed. */
const GRBL_HANDSHAKE_QUERY_ATTEMPTS = 3;
/** How long a banner may go unanswered before the lines sent earlier count as wiped by a restart. */
const GRBL_HANDSHAKE_RESTART_QUIET_MS = 1000;

/**
 * Resolves with the first banner. Opening the port often resets the board and the soft reset prints a second banner;
 * one that arrives after $I was sent and is followed by silence makes the queries start again (see
 * getAnswersAcrossRestarts).
 */
const waitForFirstGrblBanner = (context: GrblHandshakeContext): Promise<GrblFirmwareIdentity> =>
  new Promise<GrblFirmwareIdentity>((resolveBanner: (identity: GrblFirmwareIdentity) => void): void => {
    context.setBannerListener((identity: GrblFirmwareIdentity): void => {
      context.setBannerListener(undefined);
      resolveBanner(identity);
    });
  });

const getRxBufferSizeFromBuildInfo = (buildInfoLines: string[]): number => {
  for (const line of buildInfoLines) {
    const rxBufferSize: number | undefined = getGrblRxBufferSizeFromBuildOption(line);

    if (rxBufferSize) {
      return rxBufferSize;
    }
  }

  return GRBL_DEFAULT_RX_BUFFER_BYTES;
};

const getSettingsFromSettingLines = (settingLines: string[]): Record<number, string> => {
  const settings: Record<number, string> = {};

  for (const line of settingLines) {
    const response: GrblResponse = getParsedGrblResponse(line);

    if (response.kind === GRBL_RESPONSE_KIND.SETTING) {
      settings[response.settingNumber] = response.value;
    }
  }

  return settings;
};

const getSupportedGrblIdentity = async (context: GrblHandshakeContext): Promise<GrblFirmwareIdentity> => {
  const bannerWait: Promise<GrblFirmwareIdentity> = waitForFirstGrblBanner(context);
  context.writeRealtimeCommand(GRBL_REALTIME_COMMAND.SOFT_RESET);

  const identity: GrblFirmwareIdentity = await bannerWait;

  if (!isSupportedGrblFirmware(identity)) {
    throw new GrblHandshakeError(GRBL_HANDSHAKE_FAILURE_REASON.UNSUPPORTED_FIRMWARE);
  }

  return identity;
};

const getGrblConnectionAnswers = async (context: GrblHandshakeContext): Promise<GrblConnectionAnswers> => {
  const buildInfoLines: string[] = await context.sendPrivateCommand(GRBL_BUILD_INFO_COMMAND);
  const settingLines: string[] = await context.sendPrivateCommand(GRBL_SETTINGS_COMMAND);

  return { buildInfoLines, settingLines };
};

/**
 * Resolves when a banner was followed by a silence with no answer. A banner alone proves nothing: the banner of the
 * soft reset often arrives after $I was sent, and $I is still answered then.
 */
const waitForUnansweredRestart = (context: GrblHandshakeContext): GrblRestartWait => {
  let quietTimerId: ReturnType<typeof setTimeout> | undefined;
  const restart: Promise<undefined> = new Promise<undefined>((resolveRestart: (value: undefined) => void): void => {
    context.setBannerListener((): void => {
      clearTimeout(quietTimerId);
      quietTimerId = setTimeout((): void => resolveRestart(undefined), GRBL_HANDSHAKE_RESTART_QUIET_MS);
    });
  });

  return { restart, cancelRestartWait: (): void => clearTimeout(quietTimerId) };
};

/**
 * A restart wipes $I and $$, so they would never be answered. Some firmwares restart by themselves after an alarm at
 * start, such as a head resting on a limit switch. So the lines are dropped and asked again, a limited number of
 * times, under the deadline of the whole handshake.
 */
const getAnswersAcrossRestarts = async (context: GrblHandshakeContext): Promise<GrblConnectionAnswers> => {
  for (let attempt = 0; attempt < GRBL_HANDSHAKE_QUERY_ATTEMPTS; attempt++) {
    const { restart, cancelRestartWait }: GrblRestartWait = waitForUnansweredRestart(context);
    const answersWait: Promise<GrblConnectionAnswers> = getGrblConnectionAnswers(context);
    const answers: GrblConnectionAnswers | undefined = await Promise.race([answersWait, restart]);

    cancelRestartWait();

    if (answers) {
      return answers;
    }

    // Dropping the lines rejects this wait, which nobody reads any more.
    answersWait.catch((): void => undefined);
    context.dropAllLines();
  }

  throw new GrblHandshakeError(GRBL_HANDSHAKE_FAILURE_REASON.TIMEOUT);
};

const runGrblHandshakeSteps = async (context: GrblHandshakeContext): Promise<GrblConnectionInfo> => {
  await context.openTransport();

  const identity: GrblFirmwareIdentity = await getSupportedGrblIdentity(context);
  const { buildInfoLines, settingLines }: GrblConnectionAnswers = await getAnswersAcrossRestarts(context);

  return {
    identity,
    rxBufferSize: getRxBufferSizeFromBuildInfo(buildInfoLines),
    settings: getSettingsFromSettingLines(settingLines),
    buildInfoLines,
  };
};

/**
 * The deadline covers the whole handshake, so a controller that prints a banner but never answers $I or $$ fails
 * too. The controller cancels the handshake through the registered canceller when it disconnects or loses the port;
 * the transport is closed here only for a handshake failure, never for a cancel or an open failure.
 */
export const performGrblHandshake = async (context: GrblHandshakeContext): Promise<GrblConnectionInfo> => {
  let deadlineTimerId: ReturnType<typeof setTimeout> | undefined;
  const handshakeAbort: Promise<never> = new Promise<never>((_resolve, rejectHandshake: (error: Error) => void) => {
    deadlineTimerId = setTimeout((): void => {
      rejectHandshake(new GrblHandshakeError(GRBL_HANDSHAKE_FAILURE_REASON.TIMEOUT));
    }, GRBL_HANDSHAKE_TIMEOUT_MS);
    context.setHandshakeCanceller(rejectHandshake);
  });

  try {
    return await Promise.race([runGrblHandshakeSteps(context), handshakeAbort]);
  } catch (error: unknown) {
    if (error instanceof GrblHandshakeError) {
      await context.closeTransport();
    }

    throw error;
  } finally {
    clearTimeout(deadlineTimerId);
    context.setBannerListener(undefined);
    context.setHandshakeCanceller(undefined);
  }
};
