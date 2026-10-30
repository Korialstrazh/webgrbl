import { describe, expect, it } from 'vitest';
import { GRBL_BUILD_INFO_COMMAND, GRBL_SETTINGS_COMMAND } from './grbl.constants';
import { GrblCommandWipedError } from './grbl.command.wiped.error';
import { GrblCommandWriter } from './grbl.command.writer';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import type { SerialTransport } from './interfaces/SerialTransport';

const newSilentTransport = (): SerialTransport => ({
  open: async (): Promise<void> => {},
  write: async (): Promise<void> => {},
  close: async (): Promise<void> => {},
  setReceiveListener: (): void => {},
  setConnectionLostListener: (): void => {},
});

const newCommandWriter = (): GrblCommandWriter => new GrblCommandWriter(newSilentTransport(), (): void => {});

describe(GrblCommandWriter.name, () => {
  it('a soft reset fails waiting private commands with GrblCommandWipedError', async () => {
    const commandWriter: GrblCommandWriter = newCommandWriter();
    const answer: Promise<string[]> = commandWriter.sendPrivateCommand(GRBL_BUILD_INFO_COMMAND);

    commandWriter.holdQueueUntilBanner();

    await expect(answer).rejects.toBeInstanceOf(GrblCommandWipedError);
    expect(commandWriter.hasInFlightLines()).toBe(false);
  });

  it('dropping all lines for an alarm fails waiting private commands but keeps the banner hold', async () => {
    const commandWriter: GrblCommandWriter = newCommandWriter();
    commandWriter.holdQueueUntilBanner();
    const answer: Promise<string[]> = commandWriter.sendPrivateCommand(GRBL_SETTINGS_COMMAND);

    commandWriter.dropAllLines();

    await expect(answer).rejects.toBeInstanceOf(GrblCommandWipedError);
    expect(commandWriter.isQueueHeldForBanner()).toBe(true);
  });

  it('releasing all lines for a closed connection fails waiting private commands with the given error', async () => {
    const commandWriter: GrblCommandWriter = newCommandWriter();
    const answer: Promise<string[]> = commandWriter.sendPrivateCommand(GRBL_BUILD_INFO_COMMAND);

    commandWriter.releaseAllLines(new GrblConnectionClosedError());

    await expect(answer).rejects.toBeInstanceOf(GrblConnectionClosedError);
  });
});
