import { act, renderHook } from '@testing-library/react';
import type { RenderHookResult } from '@testing-library/react';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import { BED_ZOOM_STEP_FACTOR } from '../../utils/bed/bed.zoom.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { BedScreenSize } from '../../utils/bed/interfaces/BedScreenSize';
import type { BedViewport } from '../../utils/bed/interfaces/BedViewport';
import { newCoverBedViewport } from '../../utils/bed/new.cover.bed.viewport';
import { newFitBedViewport } from '../../utils/bed/new.fit.bed.viewport';
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

describe(`${useBedViewportControls.name} with a drawer`, () => {
  const STRIP_SIZE: BedScreenSize = { widthPx: 300, heightPx: 700 };

  it('fills the strip while a drawer is open and gives the earlier zoom back once it closes', () => {
    const hook: RenderHookResult<BedViewportControls, { isCoverFitWanted: boolean }> = renderHook(
      ({ isCoverFitWanted }: { isCoverFitWanted: boolean }): BedViewportControls =>
        useBedViewportControls(DIMENSIONS, STRIP_SIZE, undefined, isCoverFitWanted),
      { initialProps: { isCoverFitWanted: false } },
    );

    act(() => {
      hook.result.current.zoomBedBy(BED_ZOOM_STEP_FACTOR);
    });
    const zoomedViewport: BedViewport = hook.result.current.viewport;

    hook.rerender({ isCoverFitWanted: true });

    expect(hook.result.current.viewport).toEqual(newCoverBedViewport(DIMENSIONS, STRIP_SIZE));

    hook.rerender({ isCoverFitWanted: false });

    expect(hook.result.current.viewport).toEqual(zoomedViewport);
  });

  it('starts the first zoom inside the drawer from the filled strip', () => {
    const { result } = renderHook(() => useBedViewportControls(DIMENSIONS, STRIP_SIZE, undefined, true));
    const coverViewport: BedViewport = newCoverBedViewport(DIMENSIONS, STRIP_SIZE);

    act(() => {
      result.current.zoomBedBy(BED_ZOOM_STEP_FACTOR);
    });

    expect(result.current.viewport.zoom).toBeCloseTo(coverViewport.zoom * BED_ZOOM_STEP_FACTOR);
  });
});
