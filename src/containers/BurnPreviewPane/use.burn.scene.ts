/**
 * Runs the 3D scene inside its host element: starts the renderer, keeps it showing the current model, its lifts and
 * the size of the view, and turns clicks into part selection and drags of the lift axis into lifts. Tells the pane
 * when WebGL fails.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { BurnModel } from '../../utils/burn.model/interfaces/BurnModel';
import type { BurnPartLiftsMm } from '../../utils/burn.model/interfaces/BurnPartLiftsMm';
import type { BurnScenePointer } from '../../utils/burn.scene/interfaces/BurnScenePointer';
import type { BurnSceneRenderer } from '../../utils/burn.scene/interfaces/BurnSceneRenderer';
import type { ElementSizePx } from '../../utils/hooks/interfaces/ElementSizePx';
import { useElementSizePx } from '../../utils/hooks/use.element.size.px';
import {
  BurnPartHovered,
  BurnPartLifted,
  BurnPartSelected,
  selectBurnPartLiftMm,
  selectBurnPartEffectiveLiftsMm,
  selectCurrentBurnModel,
  selectHoveredBurnPartId,
  selectSelectedBurnPartId,
} from '../../utils/states/burn.model.state';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import { addBurnLiftDragListener } from './add.burn.lift.drag.listener';
import { addBurnSceneClickListener } from './add.burn.scene.click.listener';
import { addBurnSceneHoverListener } from './add.burn.scene.hover.listener';
import { BURN_SCENE_RUNTIME_LOAD_STATUS } from './burn.preview.pane.constants';
import type { BurnSceneRuntimeLoad } from './interfaces/BurnSceneRuntimeLoad';
import type { BurnSceneUse } from './interfaces/BurnSceneUse';
import styles from './styles.module.scss';

const CANVAS_ELEMENT_NAME = 'canvas';
const WEBGL_CONTEXT_LOST_EVENT = 'webglcontextlost';

export const useBurnScene = (
  runtimeLoad: BurnSceneRuntimeLoad,
  hostRef: RefObject<HTMLDivElement | null>,
): BurnSceneUse => {
  const dispatch: AppDispatch = useDispatch();
  const store: AppStore = useStore() as AppStore;
  const model: BurnModel | undefined = useSelector(selectCurrentBurnModel);
  const liftsMm: BurnPartLiftsMm = useSelector(selectBurnPartEffectiveLiftsMm);
  const selectedPartId: number | undefined = useSelector(selectSelectedBurnPartId);
  const hoveredPartId: number | undefined = useSelector(selectHoveredBurnPartId);
  const size: ElementSizePx = useElementSizePx(hostRef);
  const [renderer, setRenderer] = useState<BurnSceneRenderer | undefined>(undefined);
  const [isSceneFailed, setIsSceneFailed] = useState<boolean>(false);

  useEffect(() => {
    const host: HTMLDivElement | null = hostRef.current;

    if (!host || isSceneFailed || runtimeLoad.status !== BURN_SCENE_RUNTIME_LOAD_STATUS.READY) {
      return undefined;
    }

    // One canvas per renderer, not one in the JSX: dispose() loses the context for good, and a canvas would give the
    // same lost context to any later renderer.
    const canvas: HTMLCanvasElement = document.createElement(CANVAS_ELEMENT_NAME);

    canvas.className = styles.sceneCanvas ?? '';
    host.append(canvas);

    const newRenderer: BurnSceneRenderer | undefined = runtimeLoad.runtime.newBurnSceneRenderer(canvas);

    if (!newRenderer) {
      canvas.remove();
      setIsSceneFailed(true);

      return undefined;
    }

    const handleContextLost = (): void => {
      setIsSceneFailed(true);
    };
    const removeClickListener: () => void = addBurnSceneClickListener(canvas, (pointer: BurnScenePointer): void => {
      dispatch(new BurnPartSelected({ partId: newRenderer.getBurnPartIdAtPointer(pointer) }));
    });
    const removeHoverListener: () => void = addBurnSceneHoverListener(
      canvas,
      newRenderer,
      (partId: number | undefined): void => {
        dispatch(new BurnPartHovered({ partId }));
      },
    );

    const removeLiftDragListener: () => void = addBurnLiftDragListener(canvas, newRenderer, {
      getLiftMm: (): number => {
        const partId: number | undefined = selectSelectedBurnPartId(store.getState());

        return partId ? selectBurnPartLiftMm(partId)(store.getState()) : 0;
      },
      setLiftMm: (liftMm: number): void => {
        const partId: number | undefined = selectSelectedBurnPartId(store.getState());

        if (partId) {
          dispatch(new BurnPartLifted({ partId, liftMm }));
        }
      },
    });

    canvas.addEventListener(WEBGL_CONTEXT_LOST_EVENT, handleContextLost);
    setRenderer(newRenderer);

    return () => {
      // Off before dispose(), whose own context loss is no failure.
      canvas.removeEventListener(WEBGL_CONTEXT_LOST_EVENT, handleContextLost);
      removeClickListener();
      removeHoverListener();
      removeLiftDragListener();
      newRenderer.dispose();
      canvas.remove();
      setRenderer(undefined);
    };
  }, [dispatch, hostRef, isSceneFailed, runtimeLoad, store]);

  useEffect(() => {
    if (renderer && size.widthPx && size.heightPx) {
      renderer.resizeBurnScene(size);
    }
  }, [renderer, size]);

  useEffect(() => {
    renderer?.showBurnModel(model);
  }, [renderer, model]);

  useEffect(() => {
    renderer?.applyBurnPartLifts(liftsMm);
  }, [renderer, model, liftsMm]);

  useEffect(() => {
    renderer?.highlightBurnPart(selectedPartId);
  }, [renderer, model, selectedPartId]);

  useEffect(() => {
    renderer?.hoverBurnPart(hoveredPartId);
  }, [renderer, model, hoveredPartId]);

  return { isSceneFailed, renderer };
};
