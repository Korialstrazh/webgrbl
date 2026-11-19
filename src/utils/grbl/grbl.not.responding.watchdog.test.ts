import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GRBL_NOT_RESPONDING_SILENCE_MS } from './grbl.constants';
import { GrblNotRespondingWatchdog } from './grbl.not.responding.watchdog';
import { WindowBackgroundTimer } from './window.background.timer';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';

const LINE_INTERVAL_MS = 1000;
const HIDDEN_MINUTES = 6;
const MS_PER_MINUTE = 60_000;

describe(GrblNotRespondingWatchdog.name, () => {
  let emittedEvents: GrblControllerEvent[];
  let watchdog: GrblNotRespondingWatchdog;

  beforeEach(() => {
    vi.useFakeTimers();
    emittedEvents = [];
    watchdog = new GrblNotRespondingWatchdog(
      {
        hasInFlightLines: (): boolean => true,
        getLatestStatus: () => undefined,
        emitEvent: (event: GrblControllerEvent): void => void emittedEvents.push(event),
      },
      new WindowBackgroundTimer(),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports nothing while lines keep arriving for six simulated minutes', () => {
    watchdog.startWatching();

    for (let elapsedMs = 0; elapsedMs < HIDDEN_MINUTES * MS_PER_MINUTE; elapsedMs += LINE_INTERVAL_MS) {
      vi.advanceTimersByTime(LINE_INTERVAL_MS);
      watchdog.handleLineReceived();
    }

    expect(emittedEvents).toHaveLength(0);
  });

  it('reports one silence once', () => {
    watchdog.startWatching();
    vi.advanceTimersByTime(GRBL_NOT_RESPONDING_SILENCE_MS * 3);

    expect(emittedEvents).toHaveLength(1);
  });
});
