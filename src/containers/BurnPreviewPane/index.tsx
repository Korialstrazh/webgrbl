/**
 * The 3D view of the bed region: the element that hosts the scene, the loading state, and a fixed message when the
 * 3D runtime cannot load or the browser cannot run WebGL. The rest of the app does not depend on it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert, Spin } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_ALERT_TYPE_WARNING } from '../../utils/antd.constants';
import type { BurnSceneRenderer } from '../../utils/burn.scene/interfaces/BurnSceneRenderer';
import { DEFAULT } from '../../utils/localization/default.locales';
import { BURN_SCENE_RUNTIME_LOAD_STATUS } from './burn.preview.pane.constants';
import type { BurnSceneRuntimeLoad } from './interfaces/BurnSceneRuntimeLoad';
import styles from './styles.module.scss';
import { useBurnSceneRuntime } from './use.burn.scene.runtime';

export const BurnPreviewPane = (): ReactNode => {
  const { t } = useTranslation();
  const runtimeLoad: BurnSceneRuntimeLoad = useBurnSceneRuntime();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRendererFailed, setIsRendererFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!canvas || runtimeLoad.status !== BURN_SCENE_RUNTIME_LOAD_STATUS.READY) {
      return undefined;
    }

    const renderer: BurnSceneRenderer | undefined = runtimeLoad.runtime.newBurnSceneRenderer(canvas);

    if (!renderer) {
      setIsRendererFailed(true);

      return undefined;
    }

    return () => {
      renderer.dispose();
    };
  }, [canvas, runtimeLoad]);

  if (isRendererFailed || runtimeLoad.status === BURN_SCENE_RUNTIME_LOAD_STATUS.FAILED) {
    return (
      <div className={styles.burnPreviewPane}>
        <Alert className={styles.message} type={ANTD_ALERT_TYPE_WARNING} title={t(DEFAULT.BURN_PREVIEW_NO_WEBGL)} />
      </div>
    );
  }

  if (runtimeLoad.status === BURN_SCENE_RUNTIME_LOAD_STATUS.LOADING) {
    return (
      <div className={styles.burnPreviewPane} role="status">
        <Spin aria-hidden="true" />
        <span>{t(DEFAULT.BURN_PREVIEW_LOADING)}</span>
      </div>
    );
  }

  return (
    <div className={styles.burnPreviewPane}>
      {/* antd has no canvas; WebGL needs the plain element. */}
      <canvas ref={setCanvas} className={styles.sceneCanvas} />
    </div>
  );
};
