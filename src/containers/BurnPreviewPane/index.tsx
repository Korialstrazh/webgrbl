/**
 * The 3D view of the bed region: the element that hosts the scene, the lift control, the loading state, why the scene
 * is empty, and a fixed message when the 3D runtime cannot load or the browser cannot run WebGL. The rest of the app
 * does not depend on it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert, Spin } from 'antd';
import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_ALERT_TYPE_WARNING } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { BurnPartLiftControl } from './BurnPartLiftControl';
import { BurnPreviewStateMessage } from './BurnPreviewStateMessage';
import { BURN_SCENE_RUNTIME_LOAD_STATUS } from './burn.preview.pane.constants';
import type { BurnSceneRuntimeLoad } from './interfaces/BurnSceneRuntimeLoad';
import styles from './styles.module.scss';
import { useBurnScene } from './use.burn.scene';
import { useBurnSceneRuntime } from './use.burn.scene.runtime';

export const BurnPreviewPane = (): ReactNode => {
  const { t } = useTranslation();
  const runtimeLoad: BurnSceneRuntimeLoad = useBurnSceneRuntime();
  const sceneHostRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const isSceneFailed: boolean = useBurnScene(runtimeLoad, sceneHostRef);
  const isSceneUnavailable: boolean = isSceneFailed
    || runtimeLoad.status === BURN_SCENE_RUNTIME_LOAD_STATUS.FAILED;

  return (
    <div className={styles.burnPreviewPane}>
      {/* Plain and always there: the scene hook measures it and puts the WebGL canvas in it. */}
      <div ref={sceneHostRef} className={styles.sceneHost} />
      {isSceneUnavailable && (
        <Alert className={styles.message} type={ANTD_ALERT_TYPE_WARNING} title={t(DEFAULT.BURN_PREVIEW_NO_WEBGL)} />
      )}
      {!isSceneUnavailable && runtimeLoad.status === BURN_SCENE_RUNTIME_LOAD_STATUS.LOADING && (
        <div className={styles.loading} role="status">
          <Spin aria-hidden="true" />
          <span>{t(DEFAULT.BURN_PREVIEW_LOADING)}</span>
        </div>
      )}
      <BurnPreviewStateMessage />
      {!isSceneUnavailable && <BurnPartLiftControl />}
    </div>
  );
};
