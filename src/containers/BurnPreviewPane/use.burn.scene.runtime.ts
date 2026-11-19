/**
 * Loads the 3D runtime module when the 3D view first opens, so a failed chunk gives a message rather than a crash.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useEffect, useState } from 'react';
import type { BurnSceneRuntime } from '../../utils/burn.scene/interfaces/BurnSceneRuntime';
import { BURN_SCENE_RUNTIME_LOAD_STATUS } from './burn.preview.pane.constants';
import type { BurnSceneRuntimeLoad } from './interfaces/BurnSceneRuntimeLoad';

const BURN_SCENE_RUNTIME_LOAD_ERROR_LOG_MESSAGE = 'Loading the 3D runtime failed';

export const useBurnSceneRuntime = (): BurnSceneRuntimeLoad => {
  const [runtimeLoad, setRuntimeLoad] = useState<BurnSceneRuntimeLoad>({
    status: BURN_SCENE_RUNTIME_LOAD_STATUS.LOADING,
  });

  useEffect(() => {
    let isPaneOpen = true;

    const loadBurnSceneRuntime = async (): Promise<void> => {
      try {
        const runtime: BurnSceneRuntime = await import('../../utils/burn.scene/burn.scene.runtime');

        if (isPaneOpen) {
          setRuntimeLoad({ status: BURN_SCENE_RUNTIME_LOAD_STATUS.READY, runtime });
        }
      } catch (error: unknown) {
        // eslint-disable-next-line no-console -- the user sees a fixed message, so the cause goes to the log
        console.error(BURN_SCENE_RUNTIME_LOAD_ERROR_LOG_MESSAGE, error);

        if (isPaneOpen) {
          setRuntimeLoad({ status: BURN_SCENE_RUNTIME_LOAD_STATUS.FAILED });
        }
      }
    };

    void loadBurnSceneRuntime();

    return () => {
      isPaneOpen = false;
    };
  }, []);

  return runtimeLoad;
};
