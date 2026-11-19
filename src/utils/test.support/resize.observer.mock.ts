/**
 * A ResizeObserver that never reports, for tests: jsdom has none, and antd positions popovers with one.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

class SilentResizeObserver implements ResizeObserver {
  public observe(): void {
    // jsdom does no layout, so there is never a size change to report.
  }

  public unobserve(): void {
    // Nothing is tracked, so there is nothing to forget.
  }

  public disconnect(): void {
    // Nothing is tracked, so there is nothing to stop.
  }
}

/** Installs the silent ResizeObserver unless the environment already has a real one. */
export const installResizeObserverMock = (): void => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = SilentResizeObserver;
  }
};
