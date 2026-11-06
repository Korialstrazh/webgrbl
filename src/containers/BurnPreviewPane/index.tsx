/**
 * The 3D view of the bed region: the element that hosts the scene, the lift bar below it, the loading state, why the
 * scene is empty, and a fixed message when the 3D runtime cannot load or the browser cannot run WebGL. The rest of the
 * app does not depend on it.
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
import { useSelector } from 'react-redux';
import { ANTD_ALERT_TYPE_WARNING } from '../../utils/antd.constants';
import type { BurnModel } from '../../utils/burn.model/interfaces/BurnModel';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectCurrentBurnModel } from '../../utils/states/burn.model.state';
import { BURN_PREVIEW_EMPTY_STATE } from '../../utils/states/burn.preview.empty.state.constants';
import { selectBurnPreviewEmptyState } from '../../utils/states/burn.preview.selectors';
import { BurnSceneViewControls } from '../../views/BurnSceneViewControls';
import { BurnPartLiftControl } from './BurnPartLiftControl';
import { BurnPreviewStateMessage } from './BurnPreviewStateMessage';
import { BURN_SCENE_RUNTIME_LOAD_STATUS } from './burn.preview.pane.constants';
import type { BurnSceneRuntimeLoad } from './interfaces/BurnSceneRuntimeLoad';
import type { BurnSceneUse } from './interfaces/BurnSceneUse';
import styles from './styles.module.scss';
import { useBurnScene } from './use.burn.scene';
import { useBurnSceneRuntime } from './use.burn.scene.runtime';

export const BurnPreviewPane = (): ReactNode => {
  const { t } = useTranslation();
  const runtimeLoad: BurnSceneRuntimeLoad = useBurnSceneRuntime();
  const sceneHostRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  // The pane remounts on each entry to 3D, so a failure is never carried over from an earlier visit.
  const { isSceneFailed, renderer }: BurnSceneUse = useBurnScene(runtimeLoad, sceneHostRef);
  const model: BurnModel | undefined = useSelector(selectCurrentBurnModel);
  const isSceneUnavailable: boolean = isSceneFailed
    || runtimeLoad.status === BURN_SCENE_RUNTIME_LOAD_STATUS.FAILED;
  // While the model builds, its placeholder already reads as loading; a second spinner would only repeat it.
  const isModelBuilding: boolean = useSelector(selectBurnPreviewEmptyState) === BURN_PREVIEW_EMPTY_STATE.BUILDING;

  return (
    <div className={styles.burnPreviewPane}>
      <div className={styles.sceneArea}>
        {/* Plain and always there: the scene hook measures it and puts the WebGL canvas in it. */}
        <div ref={sceneHostRef} className={styles.sceneHost} />
        {isSceneUnavailable && (
          <Alert className={styles.message} type={ANTD_ALERT_TYPE_WARNING} title={t(DEFAULT.BURN_PREVIEW_NO_WEBGL)} />
        )}
        {!isSceneUnavailable && !isModelBuilding && runtimeLoad.status === BURN_SCENE_RUNTIME_LOAD_STATUS.LOADING && (
          <div className={styles.loading} role="status">
            <Spin aria-hidden="true" />
            <span>{t(DEFAULT.BURN_PREVIEW_LOADING)}</span>
          </div>
        )}
        {renderer && model && (
          <BurnSceneViewControls
            onFit={() => renderer.fitBurnSceneView()}
            onTop={() => renderer.showBurnSceneFromTop()}
          />
        )}
        <BurnPreviewStateMessage isSceneUnavailable={isSceneUnavailable} />
      </div>
      {!isSceneUnavailable && <BurnPartLiftControl />}
    </div>
  );
};
