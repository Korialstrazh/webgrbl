/**
 * Gives a test render the bed region element that BedRegionModal and BedRegionDrawer render into, as AppRoute does,
 * so a dialog can be tested without the whole workbench.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
