/**
 * Connects to a GRBL controller: open, soft reset, wait for the banner, then read build info ($I) and settings ($$).
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
import type { GrblHandshakeContext } from './interfaces/GrblHandshakeContext';
import type { GrblResponse } from './interfaces/GrblResponse';

/**
 * Resolves with the first banner. Later banners are ignored: opening the port often resets the board, and the
 * soft reset prints a second banner, so taking only the first keeps $I and $$ from being sent twice.
 */
const waitForFirstGrblBanner = (context: GrblHandshakeContext): Promise<GrblFirmwareIdentity> =>
  new Promise<GrblFirmwareIdentity>((resolveBanner: (identity: GrblFirmwareIdentity) => void, rejectBanner) => {
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout((): void => {
      context.setBannerListener(undefined);
      rejectBanner(new GrblHandshakeError(GRBL_HANDSHAKE_FAILURE_REASON.TIMEOUT));
    }, GRBL_HANDSHAKE_TIMEOUT_MS);

    context.setBannerListener((identity: GrblFirmwareIdentity): void => {
      clearTimeout(timeoutId);
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

  try {
    const identity: GrblFirmwareIdentity = await bannerWait;

    if (!isSupportedGrblFirmware(identity)) {
      throw new GrblHandshakeError(GRBL_HANDSHAKE_FAILURE_REASON.UNSUPPORTED_FIRMWARE);
    }

    return identity;
  } catch (error: unknown) {
    await context.closeTransport();
    throw error;
  }
};

export const performGrblHandshake = async (context: GrblHandshakeContext): Promise<GrblConnectionInfo> => {
  await context.openTransport();

  const identity: GrblFirmwareIdentity = await getSupportedGrblIdentity(context);
  const buildInfoLines: string[] = await context.sendPrivateCommand(GRBL_BUILD_INFO_COMMAND);
  const settingLines: string[] = await context.sendPrivateCommand(GRBL_SETTINGS_COMMAND);

  return {
    identity,
    rxBufferSize: getRxBufferSizeFromBuildInfo(buildInfoLines),
    settings: getSettingsFromSettingLines(settingLines),
    buildInfoLines,
  };
};
