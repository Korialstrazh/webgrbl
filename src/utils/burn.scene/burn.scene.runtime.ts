/**
 * The 3D runtime, the only module that imports three.js, so that three.js stays in a chunk loaded on demand.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WebGLRenderer } from 'three';
import type { BurnSceneRenderer } from './interfaces/BurnSceneRenderer';

const BURN_SCENE_RENDERER_ERROR_LOG_MESSAGE = 'Starting the 3D renderer failed';

export const newBurnSceneRenderer = (canvas: HTMLCanvasElement): BurnSceneRenderer | undefined => {
  try {
    return new WebGLRenderer({ canvas, antialias: true });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console -- the user sees a fixed message, so the log is the only place for the cause
    console.error(BURN_SCENE_RENDERER_ERROR_LOG_MESSAGE, error);

    return undefined;
  }
};
