import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { BedRegionDrawer } from '.';
import { ANTD_DRAWER_PLACEMENT_LEFT } from '../../utils/antd.constants';
import { BED_REGION_DRAWER_INSET_PROPERTY } from '../../utils/bed/bed.region.drawer.constants';
import { BedRegionHostContext } from '../../utils/bed/bed.region.host.context';
import { newStore } from '../../utils/states/new.store';

const DRAWER_SIZE = 'min(23.75rem, 100%)';
const HOST_TEST_ID = 'bed-region-host';
const OVERLAY_ID_PREFIX = 'test-drawer';

interface DrawerHarnessProps {
  isOpen: boolean;
}

const DrawerHarness = ({ isOpen }: DrawerHarnessProps): ReactNode => {
  const [bedRegionHost, setBedRegionHost] = useState<HTMLElement | null>(null);

  return (
    <BedRegionHostContext value={bedRegionHost}>
      <div ref={setBedRegionHost} data-testid={HOST_TEST_ID} />
      <BedRegionDrawer
        isOpen={isOpen}
        overlayIdPrefix={OVERLAY_ID_PREFIX}
        placement={ANTD_DRAWER_PLACEMENT_LEFT}
        size={DRAWER_SIZE}
        onClose={() => undefined}
      />
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
});
