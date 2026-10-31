/**
 * A ResizeObserver that never reports, for tests: jsdom has none, and antd positions popovers with one.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
