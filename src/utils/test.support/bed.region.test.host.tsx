/**
 * Gives a test render the bed region element that BedRegionModal and BedRegionDrawer render into, as AppRoute does,
 * so a dialog can be tested without the whole workbench.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { BedRegionHostContext } from '../bed/bed.region.host.context';

interface BedRegionTestHostProps {
  children: ReactNode;
}

export const BedRegionTestHost = ({ children }: BedRegionTestHostProps): ReactNode => {
  const [bedRegionHost, setBedRegionHost] = useState<HTMLElement | null>(null);

  return (
    <BedRegionHostContext value={bedRegionHost}>
      {/* A plain element: it only stands in for the bed region the dialogs render into. */}
      <div ref={setBedRegionHost} />
      {children}
    </BedRegionHostContext>
  );
};
