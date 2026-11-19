import type { GrblRealtimeCommand } from './grbl.constants';
import type { GrblHandshakeContext } from './interfaces/GrblHandshakeContext';
import type { GrblHandshakeContextParts } from './interfaces/GrblHandshakeContextParts';

/**
 * Builds the context the handshake runs with from the controller's transport, command writer and handshake hooks.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const newGrblHandshakeContext = (parts: GrblHandshakeContextParts): GrblHandshakeContext => {
  const { transport, commandWriter, setBannerListener, setHandshakeCanceller } = parts;

  return {
    openTransport: (): Promise<void> => transport.open(),
    closeTransport: (): Promise<void> => transport.close(),
    writeRealtimeCommand: (command: GrblRealtimeCommand): void => void commandWriter.writeRealtimeCommand(command),
    setBannerListener,
    setHandshakeCanceller,
    dropAllLines: (): void => commandWriter.dropAllLines(),
    sendPrivateCommand: (commandText: string): Promise<string[]> => commandWriter.sendPrivateCommand(commandText),
  };
};
