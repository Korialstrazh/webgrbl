import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { BedRegionDrawer } from '.';
import { ANTD_DRAWER_PLACEMENT_LEFT } from '../../utils/antd.constants';
import { BED_REGION_DRAWER_INSET_PROPERTY } from '../../utils/bed/bed.region.drawer.constants';
import { BedRegionHostContext } from '../../utils/bed/bed.region.host.context';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { OVERLAY_KIND } from '../../utils/states/overlay.kind.constants';
import { OverlayOpened } from '../../utils/states/ui.overlay.state';

const DRAWER_SIZE = 'min(23.75rem, 100%)';
const HOST_TEST_ID = 'bed-region-host';
const OVERLAY_ID_PREFIX = 'test-drawer';

const DIALOG_OVERLAY_ID = 'test-dialog';
const INSIDE_BUTTON_LABEL = 'Inside';
const OUTSIDE_BUTTON_LABEL = 'Outside';

interface DrawerHarnessProps {
  isOpen: boolean;
  onClose?: () => void;
}

const DrawerHarness = ({ isOpen, onClose = () => undefined }: DrawerHarnessProps): ReactNode => {
  const [bedRegionHost, setBedRegionHost] = useState<HTMLElement | null>(null);

  return (
    <BedRegionHostContext value={bedRegionHost}>
      <div ref={setBedRegionHost} data-testid={HOST_TEST_ID} />
      <BedRegionDrawer
        isOpen={isOpen}
        overlayIdPrefix={OVERLAY_ID_PREFIX}
        placement={ANTD_DRAWER_PLACEMENT_LEFT}
        size={DRAWER_SIZE}
        onClose={onClose}
      >
        <button type="button">{INSIDE_BUTTON_LABEL}</button>
      </BedRegionDrawer>
      <button type="button">{OUTSIDE_BUTTON_LABEL}</button>
    </BedRegionHostContext>
  );
};

const renderHarness = (isOpen: boolean): ReturnType<typeof render> =>
  render(<Provider store={newStore()}><DrawerHarness isOpen={isOpen} /></Provider>);

describe(BedRegionDrawer.name, () => {
  it('sets its width on the bed region host while open, so a wide bed moves aside', () => {
    const { getByTestId } = renderHarness(true);

    expect(getByTestId(HOST_TEST_ID).style.getPropertyValue(BED_REGION_DRAWER_INSET_PROPERTY)).toBe(DRAWER_SIZE);
  });

  it('clears the width when it closes, so the bed takes the whole region again', () => {
    const { getByTestId, rerender } = renderHarness(true);

    rerender(<Provider store={newStore()}><DrawerHarness isOpen={false} /></Provider>);

    expect(getByTestId(HOST_TEST_ID).style.getPropertyValue(BED_REGION_DRAWER_INSET_PROPERTY)).toBe('');
  });

  it('closes when a dialog opens from outside it, so Escape never leaves it behind', () => {
    const store: AppStore = newStore();
    const onClose = vi.fn<() => void>();
    const { getByRole } = render(<Provider store={store}><DrawerHarness isOpen onClose={onClose} /></Provider>);

    fireEvent.pointerDown(getByRole('button', { name: OUTSIDE_BUTTON_LABEL }));
    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: DIALOG_OVERLAY_ID, overlayKind: OVERLAY_KIND.DIALOG }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays open under a dialog opened from inside it, such as Add material', () => {
    const store: AppStore = newStore();
    const onClose = vi.fn<() => void>();
    const { getByRole } = render(<Provider store={store}><DrawerHarness isOpen onClose={onClose} /></Provider>);

    fireEvent.pointerDown(getByRole('button', { name: INSIDE_BUTTON_LABEL, hidden: true }));
    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: DIALOG_OVERLAY_ID, overlayKind: OVERLAY_KIND.DIALOG }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
