import { describe, expect, it, vi } from 'vitest';
import { GrblController } from './grbl.controller';
import { newGrblControllerHarness } from './test.support/grbl.controller.harness';
import type { BackgroundTimer } from './interfaces/BackgroundTimer';

const { disposeBackgroundTimer } = vi.hoisted(() => ({ disposeBackgroundTimer: vi.fn() }));

vi.mock('./background.timer', () => ({
  newBackgroundTimer: (): BackgroundTimer => ({
    setInterval: (): number => 1,
    setTimeout: (): number => 1,
    clear: (): void => undefined,
    dispose: disposeBackgroundTimer,
  }),
}));

describe(GrblController.name, () => {
  it('disposes its background timer on disconnect, so no worker outlives the connection', async () => {
    const { controller } = newGrblControllerHarness();

    await controller.disconnect();

    expect(disposeBackgroundTimer).toHaveBeenCalledTimes(1);
  });
});
