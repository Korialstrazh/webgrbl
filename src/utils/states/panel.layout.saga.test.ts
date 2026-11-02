import { afterEach, describe, expect, it, vi } from 'vitest';
import { PANEL_SIZES_READ_TIMEOUT_MS } from '../layout.constants';
import { PANEL_SIZES_REPOSITORY } from '../project/panel.sizes.repository';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { watchPanelLayout } from './panel.layout.saga';
import {
  ConsoleSizeResized,
  PanelSizesResized,
  selectConsoleSizePercent,
  selectIsPanelLayoutLoaded,
  selectPanelSizePercents,
} from './panel.layout.state';

const STORED_PERCENTS: number[] = [20, 50, 30];
const RESIZED_PERCENTS: number[] = [25, 45, 30];
const STORED_CONSOLE_PERCENT = 35;
const RESIZED_CONSOLE_PERCENT = 40;

/** A storage read that neither resolves nor rejects, like IndexedDB blocked by another tab. */
const getHangingRead = <TValue>(): Promise<TValue> => new Promise<TValue>(() => undefined);

const waitForPanelLayout = async (store: AppStore): Promise<void> => {
  await vi.waitFor((): void => {
    expect(selectIsPanelLayoutLoaded(store.getState())).toBe(true);
  });
};

describe(watchPanelLayout.name, () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('loads the stored console height at start', async () => {
    await PANEL_SIZES_REPOSITORY.setConsoleSizePercent(STORED_CONSOLE_PERCENT);
    const store: AppStore = newStore();

    await waitForPanelLayout(store);

    expect(selectConsoleSizePercent(store.getState())).toBe(STORED_CONSOLE_PERCENT);
  });

  it('finishes loading with the default sizes when the read hangs past the timeout', async () => {
    vi.useFakeTimers();
    vi.spyOn(PANEL_SIZES_REPOSITORY, 'getPanelSizePercents').mockImplementation(getHangingRead);
    vi.spyOn(PANEL_SIZES_REPOSITORY, 'getConsoleSizePercent').mockImplementation(getHangingRead);
    const store: AppStore = newStore();

    await vi.advanceTimersByTimeAsync(PANEL_SIZES_READ_TIMEOUT_MS - 1);

    expect(selectIsPanelLayoutLoaded(store.getState())).toBe(false);

    await vi.advanceTimersByTimeAsync(1);

    expect(selectIsPanelLayoutLoaded(store.getState())).toBe(true);
    expect(selectPanelSizePercents(store.getState())).toBeUndefined();
    expect(selectConsoleSizePercent(store.getState())).toBeUndefined();
  });

  it('stores the console height after a resize', async () => {
    const store: AppStore = newStore();
    await waitForPanelLayout(store);

    store.dispatch(new ConsoleSizeResized({ consoleSizePercent: RESIZED_CONSOLE_PERCENT }));

    expect(selectConsoleSizePercent(store.getState())).toBe(RESIZED_CONSOLE_PERCENT);
    await vi.waitFor(async (): Promise<void> => {
      expect(await PANEL_SIZES_REPOSITORY.getConsoleSizePercent()).toBe(RESIZED_CONSOLE_PERCENT);
    });
  });

  it('loads the stored panel sizes at start', async () => {
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);
    const store: AppStore = newStore();

    expect(selectIsPanelLayoutLoaded(store.getState())).toBe(false);

    await waitForPanelLayout(store);

    expect(selectPanelSizePercents(store.getState())).toEqual(STORED_PERCENTS);
  });

  it('finishes loading with the default sizes when none are stored', async () => {
    const store: AppStore = newStore();

    await waitForPanelLayout(store);

    expect(selectPanelSizePercents(store.getState())).toBeUndefined();
  });

  it('finishes loading with the default sizes when the read fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(PANEL_SIZES_REPOSITORY, 'getPanelSizePercents').mockRejectedValue(new Error('blocked'));
    const store: AppStore = newStore();

    await waitForPanelLayout(store);

    expect(selectPanelSizePercents(store.getState())).toBeUndefined();
  });

  it('stores the sizes after a resize', async () => {
    const store: AppStore = newStore();
    await waitForPanelLayout(store);

    store.dispatch(new PanelSizesResized({ panelSizePercents: RESIZED_PERCENTS }));

    expect(selectPanelSizePercents(store.getState())).toEqual(RESIZED_PERCENTS);
    await vi.waitFor(async (): Promise<void> => {
      expect(await PANEL_SIZES_REPOSITORY.getPanelSizePercents()).toEqual(RESIZED_PERCENTS);
    });
  });

  it('keeps and stores a resize made while the stored sizes are still loading', async () => {
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);
    let finishRead: (panelSizePercents: number[]) => void = () => undefined;
    vi.spyOn(PANEL_SIZES_REPOSITORY, 'getPanelSizePercents').mockImplementation(() => new Promise<number[]>(
      (resolve: (panelSizePercents: number[]) => void) => {
        finishRead = resolve;
      },
    ));
    const store: AppStore = newStore();

    store.dispatch(new PanelSizesResized({ panelSizePercents: RESIZED_PERCENTS }));
    finishRead(STORED_PERCENTS);
    await waitForPanelLayout(store);

    expect(selectPanelSizePercents(store.getState())).toEqual(RESIZED_PERCENTS);
    vi.mocked(PANEL_SIZES_REPOSITORY.getPanelSizePercents).mockRestore();
    await vi.waitFor(async (): Promise<void> => {
      expect(await PANEL_SIZES_REPOSITORY.getPanelSizePercents()).toEqual(RESIZED_PERCENTS);
    });
  });

  it('keeps the resized sizes and logs when storing them fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(PANEL_SIZES_REPOSITORY, 'setPanelSizePercents').mockRejectedValue(new Error('quota'));
    const store: AppStore = newStore();
    await waitForPanelLayout(store);

    store.dispatch(new PanelSizesResized({ panelSizePercents: RESIZED_PERCENTS }));

    await vi.waitFor((): void => {
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
    expect(selectPanelSizePercents(store.getState())).toEqual(RESIZED_PERCENTS);
  });
});
