import type { MockInstance } from 'vitest';
import { newBurnSceneRenderer } from './burn.scene.runtime';

describe(newBurnSceneRenderer.name, () => {
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns undefined and logs the error when WebGL cannot start, as in jsdom', () => {
    const canvas: HTMLCanvasElement = document.createElement('canvas');

    expect(newBurnSceneRenderer(canvas)).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
