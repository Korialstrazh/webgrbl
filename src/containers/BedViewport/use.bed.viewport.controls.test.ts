import { act, renderHook } from '@testing-library/react';
import type { RenderHookResult } from '@testing-library/react';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import { BED_ZOOM_STEP_FACTOR } from '../../utils/bed/bed.zoom.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { BedScreenSize } from '../../utils/bed/interfaces/BedScreenSize';
import type { BedViewport } from '../../utils/bed/interfaces/BedViewport';
import { newFitBedViewport } from '../../utils/bed/new.fit.bed.viewport';
import { newTopFitBedViewport } from '../../utils/bed/new.top.fit.bed.viewport';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import type { BedViewportControls } from './interfaces/BedViewportControls';
import type { KeptBedViewportRef } from './interfaces/KeptBedViewportRef';
import { useBedViewportControls } from './use.bed.viewport.controls';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const SCREEN_SIZE: BedScreenSize = { widthPx: 800, heightPx: 600 };

const newKeptViewportRef = (): KeptBedViewportRef => ({ current: undefined });

describe(useBedViewportControls.name, () => {
  it('starts fitted without a kept viewport', () => {
    const { result } = renderHook(() => useBedViewportControls(DIMENSIONS, SCREEN_SIZE));

    expect(result.current.viewport).toEqual(newFitBedViewport(DIMENSIONS));
  });

  it('keeps the zoom in the kept viewport and starts from it after a remount', () => {
    const keptViewportRef: KeptBedViewportRef = newKeptViewportRef();
    const first: RenderHookResult<BedViewportControls, unknown> = renderHook(
      (): BedViewportControls => useBedViewportControls(DIMENSIONS, SCREEN_SIZE, keptViewportRef),
    );

    act(() => {
      first.result.current.zoomBedBy(BED_ZOOM_STEP_FACTOR);
    });
    const zoomedViewport: BedViewport = first.result.current.viewport;
    first.unmount();

    const second: RenderHookResult<BedViewportControls, unknown> = renderHook(
      (): BedViewportControls => useBedViewportControls(DIMENSIONS, SCREEN_SIZE, keptViewportRef),
    );

    expect(keptViewportRef.current).toEqual(zoomedViewport);
    expect(second.result.current.viewport).toEqual(zoomedViewport);
  });
});

interface CoverFitProps {
  isStripFitWanted: boolean;
}

describe(`${useBedViewportControls.name} with a drawer`, () => {
  const STRIP_SIZE: BedScreenSize = { widthPx: 300, heightPx: 700 };

  it('fits the bed to the top of the strip while a drawer is open and gives the zoom back once it closes', () => {
    const initialProps: CoverFitProps = { isStripFitWanted: false };
    const hook: RenderHookResult<BedViewportControls, CoverFitProps> = renderHook(
      ({ isStripFitWanted }: CoverFitProps): BedViewportControls =>
        useBedViewportControls(DIMENSIONS, STRIP_SIZE, undefined, isStripFitWanted),
      { initialProps },
    );

    act(() => {
      hook.result.current.zoomBedBy(BED_ZOOM_STEP_FACTOR);
    });
    const zoomedViewport: BedViewport = hook.result.current.viewport;

    hook.rerender({ isStripFitWanted: true });

    expect(hook.result.current.viewport).toEqual(newTopFitBedViewport(DIMENSIONS, STRIP_SIZE));

    hook.rerender({ isStripFitWanted: false });

    expect(hook.result.current.viewport).toEqual(zoomedViewport);
  });

  it('starts the first zoom inside the drawer from the fitted bed', () => {
    const { result } = renderHook(() => useBedViewportControls(DIMENSIONS, STRIP_SIZE, undefined, true));
    const fitViewport: BedViewport = newFitBedViewport(DIMENSIONS);

    act(() => {
      result.current.zoomBedBy(BED_ZOOM_STEP_FACTOR);
    });

    expect(result.current.viewport.zoom).toBeCloseTo(fitViewport.zoom * BED_ZOOM_STEP_FACTOR);
  });
});

interface OverlayProps {
  overlayInsetPx: number;
}

describe(`${useBedViewportControls.name} with a drawer over the bed`, () => {
  const DRAWER_INSET_PX = 336;
  const selectedObject: ProjectObject = newProjectObject({ xMm: 5, yMm: 5, widthMm: 110, heightMm: 70 });

  it('keeps the zoom, moves the selection out from under the drawer, and gives the pan back once it closes', () => {
    const initialProps: OverlayProps = { overlayInsetPx: 0 };
    const hook: RenderHookResult<BedViewportControls, OverlayProps> = renderHook(
      ({ overlayInsetPx }: OverlayProps): BedViewportControls =>
        useBedViewportControls(DIMENSIONS, SCREEN_SIZE, undefined, false, overlayInsetPx, [selectedObject]),
      { initialProps },
    );
    const viewportBefore: BedViewport = hook.result.current.viewport;

    hook.rerender({ overlayInsetPx: DRAWER_INSET_PX });

    expect(hook.result.current.viewport.zoom).toBe(viewportBefore.zoom);
    expect(hook.result.current.viewport.centerYMm).toBe(viewportBefore.centerYMm);
    expect(hook.result.current.viewport.centerXMm).toBeLessThan(viewportBefore.centerXMm);

    hook.rerender({ overlayInsetPx: 0 });

    expect(hook.result.current.viewport).toEqual(viewportBefore);
  });

  it('leaves the view as it is when nothing is selected', () => {
    const initialProps: OverlayProps = { overlayInsetPx: 0 };
    const hook: RenderHookResult<BedViewportControls, OverlayProps> = renderHook(
      ({ overlayInsetPx }: OverlayProps): BedViewportControls =>
        useBedViewportControls(DIMENSIONS, SCREEN_SIZE, undefined, false, overlayInsetPx),
      { initialProps },
    );
    const viewportBefore: BedViewport = hook.result.current.viewport;

    hook.rerender({ overlayInsetPx: DRAWER_INSET_PX });

    expect(hook.result.current.viewport).toEqual(viewportBefore);
  });
});
