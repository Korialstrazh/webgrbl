import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { newStore } from '../states/new.store';
import type { AppStore } from '../states/new.store';
import { OVERLAY_KIND } from '../states/overlay.kind.constants';
import { OverlayOpened } from '../states/ui.overlay.state';
import { NarrowRegionChanged } from '../states/ui.workbench.state';
import { WORKBENCH_REGION } from '../states/workbench.region.constants';
import { usePopoverAutoClose } from './use.popover.auto.close';

const DIALOG_OVERLAY_ID = 'test-dialog';
const POPOVER_OVERLAY_ID = 'test-popover';

interface ClosingPopoverProps {
  isPopoverOpen: boolean;
  closePopover: () => void;
}

const ClosingPopover = ({ isPopoverOpen, closePopover }: ClosingPopoverProps): ReactNode => {
  usePopoverAutoClose(isPopoverOpen, closePopover);

  return null;
};

const renderClosingPopover = (store: AppStore, isPopoverOpen: boolean, closePopover: () => void): void => {
  render(
    <Provider store={store}>
      <ClosingPopover isPopoverOpen={isPopoverOpen} closePopover={closePopover} />
    </Provider>,
  );
};

describe(usePopoverAutoClose.name, () => {
  it('closes an open popover when a dialog or drawer opens', () => {
    const store: AppStore = newStore();
    const closePopover = vi.fn();

    renderClosingPopover(store, true, closePopover);
    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: DIALOG_OVERLAY_ID, overlayKind: OVERLAY_KIND.DIALOG }));
    });

    expect(closePopover).toHaveBeenCalledTimes(1);
  });

  it('closes an open popover when the narrow layout switches region', () => {
    const store: AppStore = newStore();
    const closePopover = vi.fn();

    renderClosingPopover(store, true, closePopover);
    act(() => {
      store.dispatch(new NarrowRegionChanged({ narrowRegion: WORKBENCH_REGION.JOB }));
    });

    expect(closePopover).toHaveBeenCalledTimes(1);
  });

  it('leaves the popover alone when it opens, or when another popover opens', () => {
    const store: AppStore = newStore();
    const closePopover = vi.fn();

    renderClosingPopover(store, true, closePopover);
    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: POPOVER_OVERLAY_ID }));
    });

    expect(closePopover).not.toHaveBeenCalled();
  });

  it('does nothing while the popover is closed', () => {
    const store: AppStore = newStore();
    const closePopover = vi.fn();

    renderClosingPopover(store, false, closePopover);
    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: DIALOG_OVERLAY_ID, overlayKind: OVERLAY_KIND.DIALOG }));
    });

    expect(closePopover).not.toHaveBeenCalled();
  });
});
